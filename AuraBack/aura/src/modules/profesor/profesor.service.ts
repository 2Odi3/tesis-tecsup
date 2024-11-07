import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Curso } from 'src/entities/curso/curso.entity';
import { Profesor } from 'src/entities/profesor/profesor.entity';
import { ProfesorCursoCarrera } from 'src/entities/profesor_curso_carrera/profesor_curso_carrera.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ProfesorSeccion } from 'src/entities/profesor_seccion/profesor_seccion.entity';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ProfesorService {
  constructor(
    @InjectRepository(ProfesorCursoCarrera)
    private profesorCursoCarreraRepository: Repository<ProfesorCursoCarrera>,

    @InjectRepository(Profesor)
    private readonly profesorRepository: Repository<Profesor>,

    @InjectRepository(ProfesorSeccion)
    private readonly profesorSeccionRepository: Repository<ProfesorSeccion>
  ) { }

  // Obtener profesor por ID
  async findProfesorById(id: string): Promise<Profesor> {
    const profesor = await this.profesorRepository.findOne({ where: { id_profesor: id } });

    if (!profesor) {
      throw new NotFoundException(`Profesor con ID: ${id} no encontrado`);
    }

    return profesor;
  }

  // Obtener cursos que tienen los profesores
  async findCourseByProfesor(profesorId: string): Promise<Curso[]> {
    const result = await this.profesorCursoCarreraRepository
      .createQueryBuilder('profesorCursoCarrera')
      .innerJoinAndSelect('profesorCursoCarrera.curso', 'curso')
      .where('profesorCursoCarrera.profesor.id_profesor = :profesorId', { profesorId })
      .getMany();

    return result.map(pc => pc.curso);
  }

  // Actualizar contraseña
  async updatePassword(id: string, newPassword: string): Promise<Profesor> {
    const profesor = await this.profesorRepository.findOne({ where: { id_profesor: id } });

    if (!profesor) {
      throw new NotFoundException(`Profesor con ID: ${id} no encontrado`);
    }

    // Encriptar la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    profesor.pass = hashedPassword;
    await this.profesorRepository.save(profesor);

    return profesor;
  }

  // Login
  async login(email: string, plainPassword: string): Promise<{ profesor: Profesor; token: string }> {
    const profesor = await this.profesorRepository.findOne({ where: { email } });

    if (!profesor) {
      throw new NotFoundException(`Profesor no encontrado`);
    }

    // Generar el token de inmediato, independientemente de la contraseña
    const token = this.generateToken(profesor); // Genera el token

    // Si la contraseña está vacía, retorna el profesor y el token
    if (!plainPassword) {
      return { profesor, token }; // Retorna el profesor y el token
    }

    // Verificar la contraseña si se proporcionó
    const isPasswordValid = await bcrypt.compare(plainPassword, profesor.pass);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return { profesor, token }; // Retorna el profesor y el token
  }

  // Generar token JWT
  generateToken(profe: Profesor): string {
    const payload = { email: profe.email, id: profe.id_profesor };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  }

  // Obtener horario del profesor
  async getHorarioByProfesorAndCurso(profesorId: string, cursoId?: string) {
    const filters: any = {
      profesor: { id_profesor: profesorId },
    };

    if (cursoId) {
      filters.curso = { id_curso: cursoId };
    }

    const horarios = await this.profesorSeccionRepository.find({
      where: filters,
      select: ['dia', 'hora_inicio', 'hora_fin', 'curso'],
      relations: ['curso'],
    });

    const horariosFormateados = horarios.map(horario => ({
      dia: horario.dia,
      hora_inicio: horario.hora_inicio.substring(0, 5),
      hora_fin: horario.hora_fin.substring(0, 5),
      curso: horario.curso,
    }));

    return horariosFormateados;
  }

  //renovar token
  async renewToken(profesorId: string): Promise<string> {
    const profesor = await this.findProfesorById(profesorId);
    if (!profesor) {
      throw new NotFoundException(`Profesor con ID: ${profesorId} no encontrado`);
    }

    // Genera y devuelve un nuevo token
    return this.generateToken(profesor);
  }
}
