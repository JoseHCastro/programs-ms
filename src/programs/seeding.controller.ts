import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DegreeProgram } from './degree-programs/entities/degree-program.entity';
import { StudyPlan } from './study-plans/entities/study-plan.entity';
import { Course } from './courses/entities/course.entity';
import { Level } from './levels/entities/level.entity';
import { Prerequisite } from './prerequisites/entities/prerequisite.entity';

@Controller()
export class SeedingController {
  constructor(
    @InjectRepository(DegreeProgram)
    private readonly degreeProgramRepository: Repository<DegreeProgram>,
    @InjectRepository(StudyPlan)
    private readonly studyPlanRepository: Repository<StudyPlan>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
    @InjectRepository(Prerequisite)
    private readonly prerequisiteRepository: Repository<Prerequisite>,
  ) {}

  @MessagePattern('programs.clearTestData')
  async clearTestData() {
    try {
      // Use TRUNCATE CASCADE to handle foreign key constraints
      await this.prerequisiteRepository.query('TRUNCATE TABLE "prerequisite" CASCADE');
      await this.courseRepository.query('TRUNCATE TABLE "course" CASCADE');
      await this.levelRepository.query('TRUNCATE TABLE "level" CASCADE');
      await this.studyPlanRepository.query('TRUNCATE TABLE "study_plan" CASCADE');
      await this.degreeProgramRepository.query('TRUNCATE TABLE "degree_program" CASCADE');

      return {
        success: true,
        message: 'All programs test data cleared successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error clearing programs test data: ' + error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
