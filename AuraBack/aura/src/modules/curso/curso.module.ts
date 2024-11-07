import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CursoController } from './curso.controller';
import { CursoService } from './curso.service';
import { Curso } from 'src/entities/curso/curso.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Curso])],
    controllers: [CursoController],
    providers: [CursoService],
    exports: [CursoService],
})
export class CursoModule {}
