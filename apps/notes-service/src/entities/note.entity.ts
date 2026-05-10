import { Entity, Column, PrimaryColumn, Unique } from 'typeorm';

@Entity()
@Unique(['title'])
export class Note {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  categoryId: string;
}