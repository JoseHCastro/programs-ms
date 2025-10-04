import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudyPlan } from '../../study-plans/entities/study-plan.entity';

@Entity('degree_program')
export class DegreeProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 120 })
  name: string;

  @Column('varchar', { length: 20, unique: true })
  code: string;

  @Column('varchar', { length: 120 })
  degree_title: string;

  @Column('varchar', { length: 20 })
  modality: string;

  @Column('varchar', { length: 20 })
  status: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => StudyPlan, (studyPlan) => studyPlan.degree_program, {
    cascade: false,
  })
  study_plans: StudyPlan[];
}
