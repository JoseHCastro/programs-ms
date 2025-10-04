import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DegreeProgramsService } from './degree-programs.service';
import {
  CreateDegreeProgramDto,
  ListDegreeProgramsDto,
  UpdateDegreeProgramDto,
} from './dto';

@Controller()
export class DegreeProgramsController {
  constructor(private readonly degreeProgramsService: DegreeProgramsService) {}

  @MessagePattern('programs.degreePrograms.create')
  create(@Payload() createDegreeProgramDto: CreateDegreeProgramDto) {
    return this.degreeProgramsService.create(createDegreeProgramDto);
  }

  @MessagePattern('programs.degreePrograms.list')
  findAll(@Payload() listDegreeProgramsDto: ListDegreeProgramsDto) {
    return this.degreeProgramsService.findAll(listDegreeProgramsDto);
  }

  @MessagePattern('programs.degreePrograms.findOne')
  findOne(@Payload() id: string) {
    return this.degreeProgramsService.findOne(id);
  }

  @MessagePattern('programs.degreePrograms.update')
  update(
    @Payload()
    payload: {
      id: string;
      updateDegreeProgramDto: UpdateDegreeProgramDto;
    },
  ) {
    return this.degreeProgramsService.update(payload.id, payload.updateDegreeProgramDto);
  }

  @MessagePattern('programs.degreePrograms.remove')
  remove(@Payload() id: string) {
    return this.degreeProgramsService.remove(id);
  }
}
