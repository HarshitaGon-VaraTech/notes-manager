import { Entity, Column, PrimaryColumn, Unique } from 'typeorm';

@Entity()
@Unique(['name'])
export class Category {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
}