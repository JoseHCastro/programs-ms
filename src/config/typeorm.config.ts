import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DegreeProgram } from '../programs/degree-programs/entities/degree-program.entity';
import { StudyPlan } from '../programs/study-plans/entities/study-plan.entity';
import { Level } from '../programs/levels/entities/level.entity';
import { Course } from '../programs/courses/entities/course.entity';
import { Prerequisite } from '../programs/prerequisites/entities/prerequisite.entity';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const synchronize =
    (configService.get<string>('DB_SYNCHRONIZE', 'true') ?? 'true').toLowerCase() ===
    'true';

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
    username: configService.get<string>('DB_USER', 'postgres'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME', 'topicos_db'),
    entities: [DegreeProgram, StudyPlan, Level, Course, Prerequisite],
    synchronize,
    logging:
      configService.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
  };
};
