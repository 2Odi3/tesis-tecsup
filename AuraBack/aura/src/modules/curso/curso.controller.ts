import { Controller, Get, InternalServerErrorException, NotFoundException, Param } from '@nestjs/common';
import { CursoService } from './curso.service';
import { Curso } from 'src/entities/curso/curso.entity';

@Controller('curso')
export class CursoController {
  constructor(private readonly cursoService: CursoService) {}

  @Get()
  async findAll(): Promise<Curso[]> {
    try {
      const cursos = await this.cursoService.findAll(); 
      return cursos; 
    } catch (error) {
      console.error('Error al obtener la lista de cursos:', error); // Pinta el error en la consola
      throw new InternalServerErrorException('Ocurrió un error al obtener la lista de cursos.');
    }
  }

  @Get(':cursoId')
  async findTeacher(@Param('cursoId') cursoId: string): Promise<{ message: string, curso: Curso }> {
    try {
      const curso = await this.cursoService.findCursoById(cursoId);

      if (!curso) {
        throw new NotFoundException(`No se encontró ningún curso con el ID: ${cursoId}`);
      }

      return {
        message: "Curso hallado",
        curso
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error("Error al buscar el curso:", error);
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

} 