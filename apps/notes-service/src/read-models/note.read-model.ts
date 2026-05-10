import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('note_read')
export class NoteReadModel {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  categoryId: string;
}
