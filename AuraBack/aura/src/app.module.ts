import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

//ORM
import { TypeOrmModule } from '@nestjs/typeorm';

//Entities
import { Carrera } from './entities/carrera/carrera.entity';
import { Curso } from './entities/curso/curso.entity'; 
import { CursosCarreras } from './entities/cursos_carreras/cursos_carreras.entity';
import { Profesor } from './entities/profesor/profesor.entity';
import { ProfesorCursoCarrera } from './entities/profesor_curso_carrera/profesor_curso_carrera.entity';
import { Alumno } from './entities/alumno/alumno.entitiy';
import { Asistencia } from './entities/asistencia/asistencia.entity';
import { ProfesorSeccion } from './entities/profesor_seccion/profesor_seccion.entity';
import { Seccion } from './entities/seccion/seccion.entity';

//Modules
import { CursoModule } from './modules/curso/curso.module';
import { ProfesorModule } from './modules/profesor/profesor.module';
import { AsistenciaModule } from './modules/asistencia/asistencia.module';

@Module({
  imports: [
    //creación de tablas
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'estela',
      database: 'aura',
      entities: [ 
        Alumno, 
        Asistencia, 
        Carrera, 
        Curso, 
        CursosCarreras, 
        Profesor, 
        ProfesorCursoCarrera, 
        ProfesorSeccion, 
        Seccion 
      ],
      synchronize: false,
    }),
    CursoModule,
    ProfesorModule,
    AsistenciaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}