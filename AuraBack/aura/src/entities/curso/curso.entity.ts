 import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('curso')
export class Curso {
  @PrimaryColumn({ length: 11 })
  id_curso: string;

  @Column({ length: 255 })
  nombre: string;
}