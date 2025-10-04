import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Level } from './entities/level.entity';
import {
  CreateLevelDto,
  ListLevelsDto,
  UpdateLevelDto,
} from './dto';
import { PaginatedResultDto } from '../../common/dto/paginated-result.dto';

@Injectable()
export class LevelsService {
  constructor(
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
  ) {}

  async create(createLevelDto: CreateLevelDto): Promise<Level> {
    const existing = await this.levelRepository.findOne({
      where: { name: createLevelDto.name },
    });

    if (existing) {
      throw new BadRequestException(
        `Level with name '${createLevelDto.name}' already exists`,
      );
    }

    const level = this.levelRepository.create(createLevelDto);
    return await this.levelRepository.save(level);
  }

  async findAll(query: ListLevelsDto): Promise<PaginatedResultDto<Level>> {
    const { page = 1, limit = 10, search } = query;
    const take = Math.max(limit, 1);
    const skip = (page - 1) * take;

    const qb = this.levelRepository.createQueryBuilder('level');
    qb.skip(skip).take(take).orderBy('level.order', 'ASC');

    if (search) {
      qb.andWhere('level.name ILIKE :search', { search: `%${search}%` });
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

  async findOne(id: string): Promise<Level> {
    const level = await this.levelRepository.findOne({ where: { id } });

    if (!level) {
      throw new NotFoundException(`Level with ID ${id} not found`);
    }

    return level;
  }

  async update(id: string, updateLevelDto: UpdateLevelDto): Promise<Level> {
    const { id: _, ...data } = updateLevelDto;

    const level = await this.levelRepository.preload({
      id,
      ...data,
    });

    if (!level) {
      throw new NotFoundException(`Level with ID ${id} not found`);
    }

    return await this.levelRepository.save(level);
  }

  async remove(id: string): Promise<void> {
    const level = await this.findOne(id);
    await this.levelRepository.remove(level);
  }
}
