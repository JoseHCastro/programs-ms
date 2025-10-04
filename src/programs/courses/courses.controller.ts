import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CoursesService } from './courses.service';
import { CreateCourseDto, ListCoursesDto, UpdateCourseDto } from './dto';

@Controller()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @MessagePattern('programs.courses.create')
  create(@Payload() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @MessagePattern('programs.courses.list')
  findAll(@Payload() listCoursesDto: ListCoursesDto) {
    return this.coursesService.findAll(listCoursesDto);
  }

  @MessagePattern('programs.courses.findOne')
  findOne(@Payload() id: string) {
    return this.coursesService.findOne(id);
  }

  @MessagePattern('programs.courses.update')
  update(
    @Payload()
    payload: {
      id: string;
      updateCourseDto: UpdateCourseDto;
    },
  ) {
    return this.coursesService.update(payload.id, payload.updateCourseDto);
  }

  @MessagePattern('programs.courses.remove')
  remove(@Payload() id: string) {
    return this.coursesService.remove(id);
  }
}
