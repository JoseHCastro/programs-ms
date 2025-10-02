import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Controller()
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @MessagePattern('createProgram')
  create(@Payload() createProgramDto: CreateProgramDto) {
    return this.programsService.create(createProgramDto);
  }

  @MessagePattern('findAllPrograms')
  findAll() {
    return this.programsService.findAll();
  }

  @MessagePattern('findOneProgram')
  findOne(@Payload() id: number) {
    return this.programsService.findOne(id);
  }

  @MessagePattern('updateProgram')
  update(@Payload() updateProgramDto: UpdateProgramDto) {
    return this.programsService.update(updateProgramDto.id, updateProgramDto);
  }

  @MessagePattern('removeProgram')
  remove(@Payload() id: number) {
    return this.programsService.remove(id);
  }
}
