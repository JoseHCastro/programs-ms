import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StudyPlansService } from './study-plans.service';
import {
  CreateStudyPlanDto,
  ListStudyPlansDto,
  UpdateStudyPlanDto,
} from './dto';

@Controller()
export class StudyPlansController {
  constructor(private readonly studyPlansService: StudyPlansService) {}

  @MessagePattern('programs.studyPlans.create')
  create(@Payload() createStudyPlanDto: CreateStudyPlanDto) {
    return this.studyPlansService.create(createStudyPlanDto);
  }

  @MessagePattern('programs.studyPlans.list')
  findAll(@Payload() listStudyPlansDto: ListStudyPlansDto) {
    return this.studyPlansService.findAll(listStudyPlansDto);
  }

  @MessagePattern('programs.studyPlans.findOne')
  findOne(@Payload() id: string) {
    return this.studyPlansService.findOne(id);
  }

  @MessagePattern('programs.studyPlans.update')
  update(
    @Payload()
    payload: {
      id: string;
      updateStudyPlanDto: UpdateStudyPlanDto;
    },
  ) {
    return this.studyPlansService.update(payload.id, payload.updateStudyPlanDto);
  }

  @MessagePattern('programs.studyPlans.remove')
  remove(@Payload() id: string) {
    return this.studyPlansService.remove(id);
  }
}
