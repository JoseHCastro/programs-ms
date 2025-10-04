import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { StudyPlan } from '../study-plans/entities/study-plan.entity';
import { DegreeProgram } from '../degree-programs/entities/degree-program.entity';
import { Level } from '../levels/entities/level.entity';
import { CreateCourseDto, ListCoursesDto, UpdateCourseDto } from './dto';
import { PaginatedResultDto } from '../../common/dto/paginated-result.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(StudyPlan)
    private readonly studyPlanRepository: Repository<StudyPlan>,
    @InjectRepository(DegreeProgram)
    private readonly degreeProgramRepository: Repository<DegreeProgram>,
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
  ) {}

  private async resolveStudyPlanAndLevel(
    dto: CreateCourseDto | UpdateCourseDto,
    fallback?: { study_plan_id: string; level_id: string },
  ): Promise<{ study_plan_id: string; level_id: string }> {
    let study_plan_id = dto.study_plan_id ?? fallback?.study_plan_id;
    let level_id = dto.level_id ?? fallback?.level_id;

    if (!study_plan_id || !level_id) {
      if (
        dto.degree_program_code &&
        dto.study_plan_version &&
        typeof dto.level_order === 'number'
      ) {
        const degreeProgram = await this.degreeProgramRepository.findOne({
          where: { code: dto.degree_program_code },
        });
        if (!degreeProgram) {
          throw new NotFoundException(
            `Degree program with code '${dto.degree_program_code}' not found`,
          );
        }

        const studyPlan = await this.studyPlanRepository.findOne({
          where: {
            degree_program_id: degreeProgram.id,
            version: dto.study_plan_version,
          },
        });
        if (!studyPlan) {
          throw new NotFoundException(
            `Study plan version '${dto.study_plan_version}' not found for degree program '${dto.degree_program_code}'`,
          );
        }

        const level = await this.levelRepository.findOne({
          where: { order: dto.level_order },
        });
        if (!level) {
          throw new NotFoundException(
            `Level with order '${dto.level_order}' not found`,
          );
        }

        study_plan_id = studyPlan.id;
        level_id = level.id;
      }
    }

    if (!study_plan_id || !level_id) {
      throw new BadRequestException(
        'Provide (study_plan_id, level_id) or (degree_program_code, study_plan_version, level_order)',
      );
    }

    return { study_plan_id, level_id };
  }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const { study_plan_id, level_id } = await this.resolveStudyPlanAndLevel(createCourseDto);

    const existsByCode = await this.courseRepository.findOne({
      where: { code: createCourseDto.code },
    });
    if (existsByCode) {
      throw new BadRequestException(`Course with code '${createCourseDto.code}' already exists`);
    }

    const course = this.courseRepository.create({
      study_plan_id,
      level_id,
      code: createCourseDto.code,
      name: createCourseDto.name,
      credits: createCourseDto.credits,
      hours_theory: createCourseDto.hours_theory,
      hours_practice: createCourseDto.hours_practice,
      status: createCourseDto.status,
    });

    return await this.courseRepository.save(course);
  }

  async findAll(query: ListCoursesDto): Promise<PaginatedResultDto<Course>> {
    const { page = 1, limit = 10, study_plan_id, level_id, search } = query;
    const take = Math.max(limit, 1);
    const skip = (page - 1) * take;

    const qb = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.study_plan', 'study_plan')
      .leftJoinAndSelect('course.level', 'level')
      .skip(skip)
      .take(take)
      .orderBy('course.name', 'ASC');

    if (study_plan_id) {
      qb.andWhere('course.study_plan_id = :study_plan_id', { study_plan_id });
    }

    if (level_id) {
      qb.andWhere('course.level_id = :level_id', { level_id });
    }

    if (search) {
      qb.andWhere('course.name ILIKE :search OR course.code ILIKE :search', {
        search: `%${search}%`,
      });
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

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['study_plan', 'level', 'prerequisites_as_main', 'prerequisites_as_required'],
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const existing = await this.findOne(id);

    let study_plan_id = existing.study_plan_id;
    let level_id = existing.level_id;

    if (
      updateCourseDto.study_plan_id ||
      updateCourseDto.level_id ||
      updateCourseDto.degree_program_code ||
      updateCourseDto.study_plan_version ||
      typeof updateCourseDto.level_order === 'number'
    ) {
      const resolved = await this.resolveStudyPlanAndLevel(updateCourseDto, {
        study_plan_id,
        level_id,
      });
      study_plan_id = resolved.study_plan_id;
      level_id = resolved.level_id;
    }

    const { id: _, degree_program_code, study_plan_version, level_order, ...rest } =
      updateCourseDto as any;

    const course = await this.courseRepository.preload({
      id,
      ...rest,
      study_plan_id,
      level_id,
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return await this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }
}
