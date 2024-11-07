import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { Carrera } from "../carrera/carrera.entity";

@Entity('seccion')
export class Seccion {
    @PrimaryColumn({length: 6})
    id_seccion: string

    @Column({length: 255})
    ciclo: string

    @ManyToOne(() => Carrera, { nullable: false })
    carrera: Carrera
}