import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { Seccion } from "../seccion/seccion.entity";

@Entity('alumno')
export class Alumno {
    @PrimaryColumn({length: 6})
    id_alumno: string
    
    @Column()
    nombre: string

    @ManyToOne(() => Seccion, { nullable: false })
    seccion: Seccion
}