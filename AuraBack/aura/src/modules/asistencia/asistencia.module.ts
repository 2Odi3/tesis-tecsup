import { Module } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaController } from './asistencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asistencia } from 'src/entities/asistencia/asistencia.entity';
import { Alumno } from 'src/entities/alumno/alumno.entitiy';
import { ProfesorSeccion } from 'src/entities/profesor_seccion/profesor_seccion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asistencia, Alumno, ProfesorSeccion]),
  ],
  controllers: [AsistenciaController],
  providers: [AsistenciaService],
})
export class AsistenciaModule {}
