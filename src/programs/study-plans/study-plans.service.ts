import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyPlan } from './entities/study-plan.entity';
import { DegreeProgram } from '../degree-programs/entities/degree-program.entity';
import {
  CreateStudyPlanDto,
  ListStudyPlansDto,
  UpdateStudyPlanDto,
} from './dto';
import { PaginatedResultDto } from '../../common/dto/paginated-result.dto';

@Injectable()
export class StudyPlansService {
  constructor(
    @InjectRepository(StudyPlan)
    private readonly studyPlanRepository: Repository<StudyPlan>,
    @InjectRepository(DegreeProgram)
    private readonly degreeProgramRepository: Repository<DegreeProgram>,
  ) {}

  private async resolveDegreeProgramId(dto: CreateStudyPlanDto | UpdateStudyPlanDto): Promise<string> {
    if (dto.degree_program_id) {
      return dto.degree_program_id;
    }

    if (dto.degree_program_code) {
      const degreeProgram = await this.degreeProgramRepository.findOne({
        where: { code: dto.degree_program_code },
      });

      if (!degreeProgram) {
        throw new NotFoundException(
          `Degree program with code '${dto.degree_program_code}' not found`,
        );
      }

      return degreeProgram.id;
    }

    throw new BadRequestException(
      'Provide degree_program_id or degree_program_code to reference a degree program',
    );
  }

  async create(createStudyPlanDto: CreateStudyPlanDto): Promise<StudyPlan> {
    const degreeProgramId = await this.resolveDegreeProgramId(createStudyPlanDto);

    const studyPlan = this.studyPlanRepository.create({
      degree_program_id: degreeProgramId,
      version: createStudyPlanDto.version,
      is_current: createStudyPlanDto.is_current ?? false,
      valid_from: createStudyPlanDto.valid_from,
      valid_to: createStudyPlanDto.valid_to ?? null,
      resolution: createStudyPlanDto.resolution ?? null,
    });

    return await this.studyPlanRepository.save(studyPlan);
  }

  async findAll(
    query: ListStudyPlansDto,
  ): Promise<PaginatedResultDto<StudyPlan>> {
    const { page = 1, limit = 10, degree_program_id, degree_program_code, is_current } = query;
    const take = Math.max(limit, 1);
    const skip = (page - 1) * take;

    const qb = this.studyPlanRepository
      .createQueryBuilder('study_plan')
      .leftJoinAndSelect('study_plan.degree_program', 'degree_program')
      .skip(skip)
      .take(take)
      .orderBy('study_plan.created_at', 'DESC');

    if (degree_program_id) {
      qb.andWhere('study_plan.degree_program_id = :degree_program_id', { degree_program_id });
    }

    if (degree_program_code) {
      qb.andWhere('degree_program.code = :degree_program_code', { degree_program_code });
    }

    if (is_current !== undefined) {
      qb.andWhere('study_plan.is_current = :is_current', { is_current });
    }

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.max(Math.ceil(total / take), 1);

    return {
      data,
      pagination: {
        page,
        limit: take,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<StudyPlan> {
    const studyPlan = await this.studyPlanRepository.findOne({
      where: { id },
      relations: ['degree_program', 'courses'],
    });

    if (!studyPlan) {
      throw new NotFoundException(`Study plan with ID ${id} not found`);
    }

    return studyPlan;
  }

  async update(id: string, updateStudyPlanDto: UpdateStudyPlanDto): Promise<StudyPlan> {
    const data: Partial<StudyPlan> = { ...updateStudyPlanDto };

    if (updateStudyPlanDto.degree_program_id || updateStudyPlanDto.degree_program_code) {
      data.degree_program_id = await this.resolveDegreeProgramId(updateStudyPlanDto);
    }

    const { id: _, degree_program_code, ...rest } = data as any;

    const studyPlan = await this.studyPlanRepository.preload({
      id,
      ...rest,
    });

    if (!studyPlan) {
      throw new NotFoundException(`Study plan with ID ${id} not found`);
    }

    return await this.studyPlanRepository.save(studyPlan);
  }

  async remove(id: string): Promise<void> {
    const studyPlan = await this.findOne(id);
    await this.studyPlanRepository.remove(studyPlan);
  }
}
