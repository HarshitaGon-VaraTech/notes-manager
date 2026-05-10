import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('category_read')
export class CategoryReadModel {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
}
