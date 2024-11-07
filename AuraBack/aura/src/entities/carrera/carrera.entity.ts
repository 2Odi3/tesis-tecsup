import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('carrera')
export class Carrera {
    @PrimaryColumn({ length: 3 })
    id_carrera: string;
    
    @Column({ length: 255 })
    nombre: string;
  }
