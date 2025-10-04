import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LevelsService } from './levels.service';
import {
  CreateLevelDto,
  ListLevelsDto,
  UpdateLevelDto,
} from './dto';

@Controller()
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @MessagePattern('programs.levels.create')
  create(@Payload() createLevelDto: CreateLevelDto) {
    return this.levelsService.create(createLevelDto);
  }

  @MessagePattern('programs.levels.list')
  findAll(@Payload() listLevelsDto: ListLevelsDto) {
    return this.levelsService.findAll(listLevelsDto);
  }

  @MessagePattern('programs.levels.findOne')
  findOne(@Payload() id: string) {
    return this.levelsService.findOne(id);
  }

  @MessagePattern('programs.levels.update')
  update(
    @Payload()
    payload: {
      id: string;
      updateLevelDto: UpdateLevelDto;
    },
  ) {
    return this.levelsService.update(payload.id, payload.updateLevelDto);
  }

  @MessagePattern('programs.levels.remove')
  remove(@Payload() id: string) {
    return this.levelsService.remove(id);
  }
}
