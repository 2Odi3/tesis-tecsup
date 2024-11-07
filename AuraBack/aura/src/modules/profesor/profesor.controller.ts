import { Controller, Get, Param, NotFoundException, InternalServerErrorException, Logger, Post, Body, Patch, UnauthorizedException } from '@nestjs/common';
import { ProfesorService } from './profesor.service';
import { Profesor } from 'src/entities/profesor/profesor.entity';

@Controller('profesor')
export class ProfesorController {
  private readonly logger = new Logger(ProfesorController.name);

  constructor(private readonly profesorService: ProfesorService) { }

  // Obtener cursos del profesor
  @Get('cursos/:profesorId')
  async findCourses(@Param('profesorId') profesorId: string) {
    try {
      const cursos = await this.profesorService.findCourseByProfesor(profesorId);

      if (!cursos) {
        throw new NotFoundException(`No se encontraron cursos para el profesor con ID: ${profesorId}`);
      }

      return {
        message: "Cursos encontrados",
        cursos
      };

    } catch (error) {
      console.error('Error al obtener los cursos del profesor:', error);
      throw new InternalServerErrorException('Ocurrió un error al obtener los cursos del profesor.');
    }
  }

  // Obtener profesor por ID
  @Get(':profesorId')
  async findTeacher(@Param('profesorId') profesorId: string): Promise<{ message: string, profesor: Profesor }> {
    try {
      const profesor = await this.profesorService.findProfesorById(profesorId);

      if (!profesor) {
        throw new NotFoundException(`No se encontró ningún profesor con el ID: ${profesorId}`);
      }

      return {
        message: "Profesor hallado",
        profesor
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error("Error al buscar al profesor:", error);
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  // Actualizar contraseña
  @Patch('password/:profesorId')
  async updatePassword(
    @Param('profesorId') profesorId: string,
    @Body('newPassword') newPassword: string
  ): Promise<{ message: string, profe: Profesor }> {
    try {
      const profe = await this.profesorService.updatePassword(profesorId, newPassword);
      return {
        message: 'Contraseña actualizada correctamente!',
        profe,
      };
    } catch (error) {
      this.logger.error('Error interno al actualizar la contraseña:', error);
      throw new InternalServerErrorException('Error interno al actualizar la contraseña.');
    }
  }

  // Login
  @Post('login')
  async login(
    @Body() query: {
      email: string,
      pass: string
    }
  ): Promise<{ message: string, token: string, profe: Profesor }> {
    const { email, pass } = query;

    try {
      const { profesor, token } = await this.profesorService.login(email, pass);

      return {
        message: 'Inicio de sesión exitoso',
        token, // Devolver el token
        profe: profesor // Devolver el profesor
      };

    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn('Usuario no encontrado:', email);
        throw new NotFoundException('Usuario no encontrado');
      } else if (error instanceof UnauthorizedException) {
        this.logger.warn('Credenciales inválidas:', email);
        throw new UnauthorizedException('Credenciales inválidas');
      }

      this.logger.error('Error al iniciar sesión:', error);
      throw new InternalServerErrorException('Error al iniciar sesión.');
    }
  }

  // Obtener horario del profesor
  @Post('horario')
  async getHorarioByProfesorAndCurso(
    @Body('profesorId') profesorId: string,
    @Body('cursoId') cursoId: string,
  ) {
    try {
      const horario = await this.profesorService.getHorarioByProfesorAndCurso(profesorId, cursoId);

      if (!horario) {
        return {
          message: 'No se encontró el horario para el profesor y curso especificados.',
          statusCode: 404
        };
      }

      return {
        message: 'Horario encontrado',
        data: horario,
        statusCode: 200
      };
    } catch (error) {
      console.error('Error al obtener el horario:', error);
      return {
        message: 'Hubo un problema al obtener el horario. Inténtalo nuevamente.',
        error: error.message,
        statusCode: 500
      };
    }
  }

  //renovación de token
  @Post('renew-token')
  async renewToken(@Body('id') id: string) {
    const newToken = await this.profesorService.renewToken(id);
    return { token: newToken };
  }
}
