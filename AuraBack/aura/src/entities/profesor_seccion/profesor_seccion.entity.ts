import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { Profesor } from "../profesor/profesor.entity";
import { Curso } from "../curso/curso.entity";
import { Seccion } from "../seccion/seccion.entity";

@Entity('profesor_seccion')
export class ProfesorSeccion {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne( () => Profesor, { nullable: false })
    profesor: Profesor;

    @ManyToOne( () => Curso, { nullable: false })
    curso: Curso;

    @ManyToOne( () => Seccion, { nullable: false })
    seccion: Seccion;

    @Column({ type: 'varchar', length: 10 })
    dia: string;

    @Column({ type: 'time' })
    hora_inicio: string; 

    @Column({ type: 'time' })
    hora_fin: string;
}