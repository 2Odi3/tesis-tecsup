import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Curso } from 'src/entities/curso/curso.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CursoService {
    constructor(
        @InjectRepository(Curso)
        private cursoRepository: Repository<Curso>,
    ){}

    async findAll(): Promise<Curso[]>{
        return this.cursoRepository.find();
    }

    async findCursoById(id: string): Promise<Curso> {
        const profesor = await this.cursoRepository.findOne({ where: { id_curso: id } });
    
        if (!profesor) {
          throw new NotFoundException(`Profesor con ID: ${id} no encontrado`);
        }
    
        return profesor;
      }

}
