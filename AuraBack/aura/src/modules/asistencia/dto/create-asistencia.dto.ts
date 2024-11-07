// dto/register-asistencia.dto.ts

import { IsBooleanString, IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class RegisterAsistenciaDto {
    @IsString()
    @IsNotEmpty()
    id_asitencia: string;

    @IsString()
    @IsNotEmpty()
    alumno_id: string;

    @IsString()
    @IsNotEmpty()
    profesorSeccion_id: string;

    @IsDateString()
    fecha: string = null;

    @IsBooleanString()
    asistio: boolean = false;
}