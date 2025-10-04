import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DegreeProgram } from './entities/degree-program.entity';
import {
  CreateDegreeProgramDto,
  ListDegreeProgramsDto,
  UpdateDegreeProgramDto,
} from './dto';
import { PaginatedResultDto } from '../../common/dto/paginated-result.dto';

@Injectable()
export class DegreeProgramsService {
  constructor(
    @InjectRepository(DegreeProgram)
    private readonly degreeProgramRepository: Repository<DegreeProgram>,
  ) {}

  async create(createDegreeProgramDto: CreateDegreeProgramDto): Promise<DegreeProgram> {
    const exists = await this.degreeProgramRepository.findOne({
      where: { code: createDegreeProgramDto.code },
    });

    if (exists) {
      throw new BadRequestException(
        `Degree program with code '${createDegreeProgramDto.code}' already exists`,
      );
    }

    const degreeProgram = this.degreeProgramRepository.create(createDegreeProgramDto);
    return await this.degreeProgramRepository.save(degreeProgram);
  }

  async findAll(
    query: ListDegreeProgramsDto,
  ): Promise<PaginatedResultDto<DegreeProgram>> {
    const { page = 1, limit = 10, search, status } = query;
    const take = Math.max(limit, 1);
    const skip = (page - 1) * take;

    const qb = this.degreeProgramRepository.createQueryBuilder('degree_program');
    qb.skip(skip).take(take).orderBy('degree_program.name', 'ASC');

    if (search) {
      qb.andWhere('degree_program.name ILIKE :search OR degree_program.code ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (status) {
      qb.andWhere('degree_program.status = :status', { status });
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

  async findOne(id: string): Promise<DegreeProgram> {
    const degreeProgram = await this.degreeProgramRepository.findOne({
      where: { id },
      relations: ['study_plans'],
    });

    if (!degreeProgram) {
      throw new NotFoundException(`Degree program with ID ${id} not found`);
    }

    return degreeProgram;
  }

  async update(
    id: string,
    updateDegreeProgramDto: UpdateDegreeProgramDto,
  ): Promise<DegreeProgram> {
    const { id: _, ...data } = updateDegreeProgramDto;

    const degreeProgram = await this.degreeProgramRepository.preload({
      id,
      ...data,
    });

    if (!degreeProgram) {
      throw new NotFoundException(`Degree program with ID ${id} not found`);
    }

    return await this.degreeProgramRepository.save(degreeProgram);
  }

  async remove(id: string): Promise<void> {
    const degreeProgram = await this.findOne(id);
    await this.degreeProgramRepository.remove(degreeProgram);
  }
}
