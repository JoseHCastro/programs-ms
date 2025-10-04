import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';

@Entity('prerequisite')
@Unique(['main_course_id', 'required_course_id'])
@Check('"main_course_id" <> "required_course_id"')
@Index('IDX_prerequisite_main_course', ['main_course_id'])
@Index('IDX_prerequisite_required_course', ['required_course_id'])
export class Prerequisite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  main_course_id: string;

  @Column('uuid')
  required_course_id: string;

  @Column('varchar', { length: 20 })
  kind: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Course, (course) => course.prerequisites_as_main, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'main_course_id' })
  main_course: Course;

  @ManyToOne(() => Course, (course) => course.prerequisites_as_required, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'required_course_id' })
  required_course: Course;
}
