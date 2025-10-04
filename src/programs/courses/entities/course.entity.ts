import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { StudyPlan } from '../../study-plans/entities/study-plan.entity';
import { Level } from '../../levels/entities/level.entity';
import { Prerequisite } from '../../prerequisites/entities/prerequisite.entity';

@Entity('course')
@Unique(['study_plan_id', 'code'])
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  study_plan_id: string;

  @Column('uuid')
  level_id: string;

  @Column('varchar', { length: 20 })
  code: string;

  @Column('varchar', { length: 120 })
  name: string;

  @Column('int')
  credits: number;

  @Column('smallint')
  hours_theory: number;

  @Column('smallint')
  hours_practice: number;

  @Column('varchar', { length: 20 })
  status: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => StudyPlan, (studyPlan) => studyPlan.courses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'study_plan_id' })
  study_plan: StudyPlan;

  @ManyToOne(() => Level, (level) => level.courses, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'level_id' })
  level: Level;

  @OneToMany(() => Prerequisite, (prerequisite) => prerequisite.main_course, {
    cascade: false,
  })
  prerequisites_as_main: Prerequisite[];

  @OneToMany(() => Prerequisite, (prerequisite) => prerequisite.required_course, {
    cascade: false,
  })
  prerequisites_as_required: Prerequisite[];
}
