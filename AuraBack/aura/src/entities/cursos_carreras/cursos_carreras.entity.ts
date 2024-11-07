import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Curso } from '../curso/curso.entity';
import { Carrera } from '../carrera/carrera.entity';

@Entity('cursos_carreras')
export class CursosCarreras {
  @PrimaryGeneratedColumn() 
  id: number;

  @ManyToOne(() => Curso, { nullable: false })
  curso: Curso;

  @ManyToOne(() => Carrera, { nullable: false })
  carrera: Carrera;
}
