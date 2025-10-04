import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PrerequisitesService } from './prerequisites.service';
import {
  CreatePrerequisiteDto,
  ListPrerequisitesDto,
  UpdatePrerequisiteDto,
} from './dto';

@Controller()
export class PrerequisitesController {
  constructor(private readonly prerequisitesService: PrerequisitesService) {}

  @MessagePattern('programs.prerequisites.create')
  create(@Payload() createPrerequisiteDto: CreatePrerequisiteDto) {
    return this.prerequisitesService.create(createPrerequisiteDto);
  }

  @MessagePattern('programs.prerequisites.list')
  findAll(@Payload() listPrerequisitesDto: ListPrerequisitesDto) {
    return this.prerequisitesService.findAll(listPrerequisitesDto);
  }

  @MessagePattern('programs.prerequisites.findOne')
  findOne(@Payload() id: string) {
    return this.prerequisitesService.findOne(id);
  }

  @MessagePattern('programs.prerequisites.update')
  update(
    @Payload()
    payload: {
      id: string;
      updatePrerequisiteDto: UpdatePrerequisiteDto;
    },
  ) {
    return this.prerequisitesService.update(
      payload.id,
      payload.updatePrerequisiteDto,
    );
  }

  @MessagePattern('programs.prerequisites.remove')
  remove(@Payload() id: string) {
    return this.prerequisitesService.remove(id);
  }
}
