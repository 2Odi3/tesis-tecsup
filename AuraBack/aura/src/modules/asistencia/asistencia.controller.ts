import { Controller, NotFoundException, Logger, Post, Body, HttpStatus, HttpException, BadRequestException, InternalServerErrorException, Patch } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { Alumno } from 'src/entities/alumno/alumno.entitiy';
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
    ): Promise<
    Alumno[]
    > {
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
        @Body() body: { 
            profesor_id: string; 
            curso_id: string;
            tiempo: number;
        }) {
        const { 
            profesor_id, 
            curso_id,
            tiempo 
        } = body;

        try {
            // Llamada al servicio para registrar la asistencia
            const asistencias = await this.asistenciaService.registrarAsistencia(profesor_id, curso_id, tiempo);
            return { message: 'Asistencia registrada correctamente', asistencias };
        } catch (error) {
            // Manejo de excepciones y reenvío con código y mensaje apropiado
            if (error instanceof HttpException) {
                throw error; // Si es un error HTTP, lanzamos directamente
            }
            // Si el error no es un HttpException, lanzamos un error genérico del servidor
            throw new HttpException(
                'Error interno del servidor',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Filtrar por fecha
    @Post('por-fecha')
    async obtenerAsistenciasPorFecha(
        @Body() body: { 
            fecha?: string; 
            profesorId: string; 
            cursoId: string 
        }) {
        const { 
            fecha, 
            profesorId, 
            cursoId 
        } = body;

        // Validar si se proporcionan profesorId y cursoId
        if (!profesorId || !cursoId) {
            throw new HttpException(
                'El ID del profesor y del curso son obligatorios en el cuerpo de la solicitud',
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            const asistencias = await this.asistenciaService.asistenciasPorCurso(fecha, profesorId, cursoId);
            return asistencias;
        } catch (error) {
            const mensajeError = error.message;
            const status = mensajeError.includes('No se encontraron') ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
            throw new HttpException(
                'Error al obtener asistencias: ' + mensajeError,
                status,
            );
        }
    }


    //actualizar asistencias
    @Patch('actualizar')
    async actualizarAsistencia(
        @Body() updateAsistenciaDto: {
            fecha: string,
            profesorId: string,
            cursoId: string,
            cambios: { 
                alumnoId: string, 
                asistio: boolean 
            }[]
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
        @Body() data: { 
            alumnoId: string | null; 
            profesorId: string; 
            cursoId: string 
        }
    ): Promise<{ 
        alumno: any; 
        porcentajeFaltas: number; 
        faltas: number; 
        clasesTotales: number 
    }[]> {
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
        @Body() body: { 
            profesorId: string; 
            cursoId: string; 
            fecha?: string 
        }
    ): Promise<{ 
        fecha: string; 
        faltas: number; 
        asistencias: number 
    }[]> {
        const { 
            profesorId, 
            cursoId, 
            fecha 
        } = body;

        try {
            const faltas = await this.asistenciaService.obtenerFaltasPorFecha(profesorId, cursoId, fecha);
            return faltas;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw new Error('Error al obtener faltas');
        }
    }

    //obtener fechas
    @Post('fechas')
    async obtenerFechasAsistencia(
        @Body() body: { 
            profesor_id: string, 
            curso_id: string 
        }
    ): Promise<{ 
        fechas: string[] 
    }> {
        try {
            const { profesor_id, curso_id } = body;

            // Verificamos si los datos necesarios están presentes
            if (!profesor_id || !curso_id) {
                throw new HttpException('Profesor o curso no especificado', HttpStatus.BAD_REQUEST);
            }

            // Llamamos al servicio para obtener las fechas de asistencia
            const fechas = await this.asistenciaService.obtenerFechasAsistencia(profesor_id, curso_id);

            // Retornamos las fechas obtenidas
            return { fechas };
        } catch (error) {
            // Manejo de excepciones si algo falla
            if (error instanceof HttpException) {
                throw error; // Si la excepción es de tipo HttpException, la re-lanzamos
            }

            // Si no es una HttpException, lanzamos una nueva con un mensaje de error genérico
            throw new HttpException('Error al obtener las fechas de asistencia', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
