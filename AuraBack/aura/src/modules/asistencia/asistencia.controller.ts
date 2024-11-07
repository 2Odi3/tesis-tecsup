import { Controller, NotFoundException, Logger, Post, Body, HttpStatus, HttpException, BadRequestException, InternalServerErrorException, Patch } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { Alumno } from 'src/entities/alumno/alumno.entitiy';
import { RegisterAsistenciaDto } from './dto/create-asistencia.dto';
import { Asistencia } from 'src/entities/asistencia/asistencia.entity';

@Controller('asistencia')
export class AsistenciaController {
    private readonly logger = new Logger(AsistenciaController.name);

    constructor(private readonly asistenciaService: AsistenciaService) { }

    //alumnos-seccion-curso
    @Post('alumnos')
    async obtenerAlumnos(
        @Body() query: {
            idProfesor: string,
            idCurso: string
        }
    ): Promise<Alumno[]> {
        try {
            const { idProfesor, idCurso } = query;
            this.logger.log(`Parámetros: idProfesor=${idProfesor}, idCurso=${idCurso}`);

            const alumnos = await this.asistenciaService.obtenerAlumnosPorCursoYProfesor(idProfesor, idCurso);

            if (!alumnos || alumnos.length === 0) {
                this.logger.warn(`No se encontraron alumnos para el profesor ${idProfesor} y curso ${idCurso}`);
                throw new NotFoundException(`No se encontraron alumnos para el profesor ${idProfesor} y curso ${idCurso}`);
            }

            this.logger.log(`Se encontraron ${alumnos.length} alumnos.`);
            return alumnos;
        } catch (error) {
            this.logger.error(`Error al obtener alumnos: ${error.message}`, error.stack);
            throw new HttpException('Error al obtener alumnos', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //registrar asistencias
    @Post('registrar')
    async registrarAsistencia(
        @Body() registerAsistenciaDto: RegisterAsistenciaDto[]
    ): Promise<{ message: string; asistentes: Asistencia[] }> {
        try {
            this.logger.log("Se ha recibido una solicitud POST para registrar asistencias.");

            const asistentes = await this.asistenciaService.registrarAsistencia(registerAsistenciaDto);

            this.logger.log(`Se registraron ${asistentes.length} asistencias exitosamente.`);

            return {
                message: 'Asistencias registradas exitosamente',
                asistentes,
            };
        } catch (error) {
            this.logger.error('Error al registrar asistencias:', error);
            throw new HttpException('Error al registrar las asistencias', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Filtrar por fecha
    @Post('por-fecha')
    async obtenerAsistenciasPorFecha(@Body() body: { fecha?: string; profesorId: string; cursoId: string }) {
        const { fecha, profesorId, cursoId } = body;

        // Validar si se proporcionan profesorId y cursoId
        if (!profesorId || !cursoId) {
            throw new HttpException(
                'El ID del profesor y del curso son obligatorios en el cuerpo de la solicitud',
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            // Llama al servicio. Si la fecha no es proporcionada, el servicio utilizará la más reciente.
            const asistencias = await this.asistenciaService.asistenciasPorCurso(fecha, profesorId, cursoId);

            // Verifica si se encontraron asistencias
            if (asistencias.length === 0) {
                throw new HttpException(
                    'No se encontraron asistencias para la fecha proporcionada',
                    HttpStatus.NOT_FOUND,
                );
            }

            return asistencias;
        } catch (error) {
            throw new HttpException(
                'Error al obtener asistencias: ' + error.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch('actualizar')
    async actualizarAsistencia(
        @Body() updateAsistenciaDto: {
            fecha: string,
            profesorId: string,
            cursoId: string,
            cambios: { alumnoId: string, asistio: boolean }[]
        }
    ): Promise<Asistencia[]> {
        try {
            const { fecha, profesorId, cursoId, cambios } = updateAsistenciaDto;

            // Validar si faltan datos en el body
            if (!fecha || !profesorId || !cursoId || !cambios || cambios.length === 0) {
                throw new BadRequestException('Los campos fecha, profesorId, cursoId y cambios son requeridos.');
            }

            // Actualizar las asistencias usando el servicio
            const registrosActualizados = await this.asistenciaService.actualizarAsistencia(updateAsistenciaDto);

            if (registrosActualizados.length === 0) {
                throw new NotFoundException('No se encontraron registros de asistencia para actualizar.');
            }

            return registrosActualizados;
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            } else {
                console.error('Error interno en el servidor:', error);
                throw new InternalServerErrorException('Error interno en el servidor al actualizar asistencias.');
            }
        }
    }

    //procentaje de faltas
    @Post('porcentaje-faltas')
    async obtenerPorcentajeFaltas(
        @Body() data: { alumnoId: string | null; profesorId: string; cursoId: string }
    ): Promise<{ alumno: any; porcentajeFaltas: number; faltas: number; clasesTotales: number }[]> {
        try {
            const { alumnoId, profesorId, cursoId } = data;
            const porcentajesFaltas = await this.asistenciaService.obtenerPorcentajeFaltas(
                alumnoId,
                profesorId,
                cursoId
            );
            return porcentajesFaltas; // Debería ser un array de objetos con la nueva estructura
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new HttpException(
                    { message: error.message },
                    HttpStatus.NOT_FOUND
                );
            }
            throw new HttpException(
                { message: 'Error interno del servidor' },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    //faltas por fecha
    @Post('faltas-fecha')
    async obtenerFaltasPorFecha(
        @Body() body: { profesorId: string; cursoId: string }
    ): Promise<{ fecha: string; faltas: number }[]> {
        const { profesorId, cursoId } = body;

        try {
            const faltas = await this.asistenciaService.obtenerFaltasPorFecha(profesorId, cursoId);
            return faltas; // Devolverá un array de objetos con fecha y faltas
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw new Error('Error al obtener faltas');
        }
    }
}