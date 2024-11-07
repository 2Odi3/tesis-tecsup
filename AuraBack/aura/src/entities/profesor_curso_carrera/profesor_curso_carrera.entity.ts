import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Curso } from "../curso/curso.entity";
import { Carrera } from "../carrera/carrera.entity";
import { Profesor } from "../profesor/profesor.entity";

@Entity('profesor_curso_carrera')
export class ProfesorCursoCarrera{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Curso, { nullable: false })
    curso: Curso

    @ManyToOne(() => Carrera, { nullable: false })
    carrera: Carrera

    @ManyToOne(() => Profesor, { nullable: false })
    profesor: Profesor
}