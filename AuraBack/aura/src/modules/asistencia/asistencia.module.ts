import { Module } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaController } from './asistencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asistencia } from 'src/entities/asistencia/asistencia.entity';
import { Alumno } from 'src/entities/alumno/alumno.entitiy';
import { ProfesorSeccion } from 'src/entities/profesor_seccion/profesor_seccion.entity';
import { RecognitionService } from '../recognition/recognition.service';
import { RecognitionModule } from '../recognition/recognition.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asistencia, Alumno, ProfesorSeccion]),
    RecognitionModule,
    HttpModule
  ],
  controllers: [AsistenciaController],
  providers: [AsistenciaService, RecognitionService],
})
export class AsistenciaModule {}
