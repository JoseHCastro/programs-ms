import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DegreeProgram } from './degree-programs/entities/degree-program.entity';
import { StudyPlan } from './study-plans/entities/study-plan.entity';
import { Level } from './levels/entities/level.entity';
import { Course } from './courses/entities/course.entity';
import { Prerequisite } from './prerequisites/entities/prerequisite.entity';
import { DegreeProgramsService } from './degree-programs/degree-programs.service';
import { DegreeProgramsController } from './degree-programs/degree-programs.controller';
import { StudyPlansService } from './study-plans/study-plans.service';
import { StudyPlansController } from './study-plans/study-plans.controller';
import { LevelsService } from './levels/levels.service';
import { LevelsController } from './levels/levels.controller';
import { CoursesService } from './courses/courses.service';
import { CoursesController } from './courses/courses.controller';
import { PrerequisitesService } from './prerequisites/prerequisites.service';
import { PrerequisitesController } from './prerequisites/prerequisites.controller';
import { SeedingController } from './seeding.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DegreeProgram, StudyPlan, Level, Course, Prerequisite]),
  ],
  controllers: [
    DegreeProgramsController,
    StudyPlansController,
    LevelsController,
    CoursesController,
    PrerequisitesController,
    SeedingController,
  ],
  providers: [
    DegreeProgramsService,
    StudyPlansService,
    LevelsService,
    CoursesService,
    PrerequisitesService,
  ],
})
export class ProgramsModule {}
