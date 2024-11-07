import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity('Profesor')
export class Profesor {
    @PrimaryColumn({length: 6})
    id_profesor: string

    @Column({length: 255})
    nombre: string

    @Column({length: 255})
    email: string

    //password
    @Column({length: 255})
    pass: string
}