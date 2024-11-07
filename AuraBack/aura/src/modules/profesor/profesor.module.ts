import { Module } from '@nestjs/common';
import { ProfesorService } from './profesor.service';
import { ProfesorController } from './profesor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profesor } from 'src/entities/profesor/profesor.entity';
import { ProfesorCursoCarrera } from 'src/entities/profesor_curso_carrera/profesor_curso_carrera.entity';
import { ProfesorSeccion } from 'src/entities/profesor_seccion/profesor_seccion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profesor, ProfesorCursoCarrera, ProfesorSeccion]),
  ],
  controllers: [ProfesorController],
  providers: [ProfesorService],
})
export class ProfesorModule {}
