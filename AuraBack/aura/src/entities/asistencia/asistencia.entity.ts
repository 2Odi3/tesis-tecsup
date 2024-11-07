import { Entity, Column, PrimaryColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Alumno } from "../alumno/alumno.entitiy";
import { ProfesorSeccion } from "../profesor_seccion/profesor_seccion.entity";

@Entity('asistencia')
export class Asistencia {
    @PrimaryGeneratedColumn() 
    id_asistencia: number;

    @ManyToOne(() => Alumno, { nullable: false })
    alumno_id: Alumno;

    @ManyToOne(() => ProfesorSeccion, { nullable: false })
    profesorSeccion_id: ProfesorSeccion;

    @Column()
    fecha: Date;

    @Column()
    asistio: boolean;

    @Column({default: false})
    modificado: boolean;
}