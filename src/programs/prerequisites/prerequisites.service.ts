import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prerequisite } from './entities/prerequisite.entity';
import {
  CreatePrerequisiteDto,
  ListPrerequisitesDto,
  UpdatePrerequisiteDto,
} from './dto';
import { PaginatedResultDto } from '../../common/dto/paginated-result.dto';

@Injectable()
export class PrerequisitesService {
  constructor(
    @InjectRepository(Prerequisite)
    private readonly prerequisiteRepository: Repository<Prerequisite>,
  ) {}

  private ensureValidCourses(mainId: string, requiredId: string) {
    if (mainId === requiredId) {
      throw new BadRequestException('A course cannot be its own prerequisite');
    }
  }

  async create(createPrerequisiteDto: CreatePrerequisiteDto): Promise<Prerequisite> {
    this.ensureValidCourses(
      createPrerequisiteDto.main_course_id,
      createPrerequisiteDto.required_course_id,
    );

    const prerequisite = this.prerequisiteRepository.create({
      ...createPrerequisiteDto,
      kind: createPrerequisiteDto.kind ?? 'required',
    });

    return await this.prerequisiteRepository.save(prerequisite);
  }

  async findAll(
    query: ListPrerequisitesDto,
  ): Promise<PaginatedResultDto<Prerequisite>> {
    const { page = 1, limit = 10, main_course_id, required_course_id } = query;
    const take = Math.max(limit, 1);
    const skip = (page - 1) * take;

    const qb = this.prerequisiteRepository
      .createQueryBuilder('prerequisite')
      .leftJoinAndSelect('prerequisite.main_course', 'main_course')
      .leftJoinAndSelect('prerequisite.required_course', 'required_course')
      .skip(skip)
      .take(take)
      .orderBy('prerequisite.created_at', 'DESC');

    if (main_course_id) {
      qb.andWhere('prerequisite.main_course_id = :main_course_id', { main_course_id });
    }

    if (required_course_id) {
      qb.andWhere('prerequisite.required_course_id = :required_course_id', { required_course_id });
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

  async findOne(id: string): Promise<Prerequisite> {
    const prerequisite = await this.prerequisiteRepository.findOne({
      where: { id },
      relations: ['main_course', 'required_course'],
    });

    if (!prerequisite) {
      throw new NotFoundException(`Prerequisite with ID ${id} not found`);
    }

    return prerequisite;
  }

  async update(
    id: string,
    updatePrerequisiteDto: UpdatePrerequisiteDto,
  ): Promise<Prerequisite> {
    const { id: _, ...data } = updatePrerequisiteDto;

    if (data.main_course_id && data.required_course_id) {
      this.ensureValidCourses(data.main_course_id, data.required_course_id);
    }

    const prerequisite = await this.prerequisiteRepository.preload({
      id,
      ...data,
    });

    if (!prerequisite) {
      throw new NotFoundException(`Prerequisite with ID ${id} not found`);
    }

    return await this.prerequisiteRepository.save(prerequisite);
  }

  async remove(id: string): Promise<void> {
    const prerequisite = await this.findOne(id);
    await this.prerequisiteRepository.remove(prerequisite);
  }
}
