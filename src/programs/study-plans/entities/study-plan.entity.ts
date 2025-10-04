import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DegreeProgram } from '../../degree-programs/entities/degree-program.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('study_plan')
export class StudyPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  degree_program_id: string;

  @Column('varchar', { length: 20 })
  version: string;

  @Column('boolean', { default: false })
  is_current: boolean;

  @Column('date')
  valid_from: Date;

  @Column('date', { nullable: true })
  valid_to: Date | null;

  @Column('varchar', { length: 50, nullable: true })
  resolution: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => DegreeProgram, (degreeProgram) => degreeProgram.study_plans, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'degree_program_id' })
  degree_program: DegreeProgram;

  @OneToMany(() => Course, (course) => course.study_plan, { cascade: false })
  courses: Course[];
}
