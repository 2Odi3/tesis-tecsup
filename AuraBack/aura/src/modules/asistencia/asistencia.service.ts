import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Asistencia } from 'src/entities/asistencia/asistencia.entity';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { RegisterAsistenciaDto } from './dto/create-asistencia.dto';
import { Alumno } from 'src/entities/alumno/alumno.entitiy';
import { ProfesorSeccion } from 'src/entities/profesor_seccion/profesor_seccion.entity';

@Injectable()
export class AsistenciaService {
    constructor(
        @InjectRepository(Asistencia)
        private readonly asistenciaRepository: Repository<Asistencia>,

        @InjectRepository(Alumno)
        private readonly alumnoRepository: Repository<Alumno>,

        @InjectRepository(ProfesorSeccion)
        private readonly profesorSeccionRepository: Repository<ProfesorSeccion>
    ) { }

    async obtenerAlumnosPorCursoYProfesor(
        id_profesor: string,
        id_curso: string
    ): Promise<Alumno[]> {
        const profesorSeccion = await this.profesorSeccionRepository.findOne({
            where: {
                profesor: { id_profesor },
                curso: { id_curso }
            },
            relations: ['seccion'],
        });

        if (!profesorSeccion) {
            throw new NotFoundException('Profesor o curso no encontrado');
        }

        return this.alumnoRepository.find({
            where: { seccion: profesorSeccion.seccion },
        });
    }

    //registrar asistencia
    async registrarAsistencia(
        createAsistenciaDto: RegisterAsistenciaDto[]
    ): Promise<Asistencia[]> {
        const registros: Asistencia[] = [];

        for (const asistenciaDto of createAsistenciaDto) {
            const { id_asitencia, alumno_id, profesorSeccion_id, fecha, asistio } = asistenciaDto;

            const alumno = await this.alumnoRepository.findOne({ where: { id_alumno: alumno_id } });
            const profesorSeccion = await this.profesorSeccionRepository.findOne({ where: { id: Number(profesorSeccion_id) } });

            if (!alumno || !profesorSeccion) {
                throw new Error('Alumno o ProfesorSeccion no encontrado');
            }

            const registro = new Asistencia();
            registro.id_asistencia = id_asitencia;
            registro.alumno_id = alumno;
            registro.profesorSeccion_id = profesorSeccion;
            registro.fecha = new Date(fecha);
            registro.asistio = asistio;

            const savedRegistro = await this.asistenciaRepository.save(registro);
            registros.push(savedRegistro);
        }

        return registros;
    }

    //obtener asistencias por fecha, curso y profesor
    async asistenciasPorCurso(
        fecha: string,
        profesorId: string,
        cursoId: string
    ): Promise<Asistencia[]> {
        let fechaLocal: Date;
        let profesorSeccion: ProfesorSeccion; // Definimos la variable aquí

        if (fecha) {
            fechaLocal = new Date(fecha + 'T00:00:00-05:00');
            if (isNaN(fechaLocal.getTime())) {
                throw new Error('Fecha no válida');
            }
        } else {
            // Obtenemos la instancia de profesorSeccion
            profesorSeccion = await this.profesorSeccionRepository.findOne({
                where: {
                    profesor: { id_profesor: profesorId },
                    curso: { id_curso: cursoId }
                }
            });

            if (!profesorSeccion) {
                throw new Error('No se encontró la relación profesor-curso para el profesor y curso proporcionados');
            }

            const ultimaFechaAsistencia = await this.asistenciaRepository
                .createQueryBuilder('asistencia')
                .select('MIN(asistencia.fecha)', 'minFecha')
                .where('asistencia.profesorSeccion_id = :profesorSeccionId', { profesorSeccionId: profesorSeccion.id })
                .getRawOne();

            if (!ultimaFechaAsistencia || !ultimaFechaAsistencia.minFecha) {
                throw new Error('No hay asistencias registradas para obtener la fecha más reciente');
            }

            fechaLocal = new Date(ultimaFechaAsistencia.minFecha);
        }

        // Aquí también necesitamos manejar el caso donde la fecha sí fue proporcionada
        if (!fechaLocal) {
            throw new Error('No se pudo determinar la fecha');
        }

        const fechaInicio = new Date(fechaLocal);
        fechaInicio.setHours(0, 0, 0, 0);

        const fechaFin = new Date(fechaLocal);
        fechaFin.setHours(23, 59, 59, 999);

        // Ahora usamos la variable profesorSeccion
        const asistencias = await this.asistenciaRepository.find({
            where: {
                fecha: Between(fechaInicio, fechaFin),
                profesorSeccion_id: profesorSeccion // Aquí pasamos el objeto completo
            },
            relations: ['alumno_id', 'profesorSeccion_id', 'profesorSeccion_id.curso']
        });

        if (asistencias.length === 0) {
            throw new Error('No se encontraron asistencias para los parámetros proporcionados');
        }

        return asistencias;
    }

    //actualizar la asistencia
    async actualizarAsistencia(
        updateAsistenciaDto: {
            fecha: string,
            profesorId: string,
            cursoId: string,
            cambios: { alumnoId: string, asistio: boolean }[]
        }
    ): Promise<Asistencia[]> {
        const { fecha, profesorId, cursoId, cambios } = updateAsistenciaDto;
        const registrosActualizados: Asistencia[] = [];

        //fecha
        let fechaLocal: Date;
        if (fecha) {
            fechaLocal = new Date(fecha + 'T00:00:00-05:00');
            if (isNaN(fechaLocal.getTime())) {
                throw new Error('Fecha no válida');
            }
        } else {
            throw new Error('La fecha es requerida');
        }

        const fechaInicio = new Date(fechaLocal);
        fechaInicio.setHours(0, 0, 0, 0);

        const fechaFin = new Date(fechaLocal);
        fechaFin.setHours(23, 59, 59, 999);

        const profesorSeccion = await this.profesorSeccionRepository.findOne({
            where: {
                profesor: { id_profesor: profesorId },
                curso: { id_curso: cursoId }
            }
        });

        if (!profesorSeccion) {
            throw new Error('No se encontró la relación profesor-curso para el profesor y curso proporcionados');
        }

        for (const cambio of cambios) {
            const { alumnoId, asistio } = cambio;

            const alumno = await this.alumnoRepository.findOne({ where: { id_alumno: alumnoId } });

            if (!alumno) {
                console.log(`Alumno con ID ${alumnoId} no encontrado. Saltando...`);
                continue;
            }

            const asistenciaExistente = await this.asistenciaRepository.findOne({
                where: {
                    alumno_id: alumno,
                    profesorSeccion_id: profesorSeccion,
                    fecha: Between(fechaInicio, fechaFin)
                }
            });

            if (asistenciaExistente && asistenciaExistente.asistio !== asistio) {
                asistenciaExistente.asistio = asistio;

                const savedRegistro = await this.asistenciaRepository.save(asistenciaExistente);
                registrosActualizados.push(savedRegistro);
            }
        }
        return registrosActualizados;
    }

    //porcentaje de faltas
    async obtenerPorcentajeFaltas(
        alumnoId: string | null,
        profesorId: string,
        cursoId: string
    ): Promise<{ alumno: any; porcentajeFaltas: number; faltas: number; clasesTotales: number }[]> {
        const profesorSeccion = await this.profesorSeccionRepository.findOne({
            where: {
                profesor: { id_profesor: profesorId },
                curso: { id_curso: cursoId }
            },
            relations: ['seccion'],
        });
    
        if (!profesorSeccion) {
            throw new NotFoundException('Profesor, curso o sección no encontrados');
        }
    
        // Si no se proporciona un alumnoId, obtener todos los alumnos de la sección
        const alumnos = alumnoId
            ? [await this.alumnoRepository.findOneBy({ id_alumno: alumnoId })]
            : await this.alumnoRepository.find({ where: { seccion: profesorSeccion.seccion } });
    
        if (!alumnos || alumnos.length === 0) {
            throw new NotFoundException('No se encontraron alumnos para este curso y profesor');
        }
    
        const resultados: { alumno: any; porcentajeFaltas: number; faltas: number; clasesTotales: number }[] = [];
    
        for (const alumno of alumnos) {
            const asistencias = await this.asistenciaRepository.find({
                where: {
                    alumno_id: { id_alumno: alumno.id_alumno }, // Asegúrate de que estás usando el id correcto
                    profesorSeccion_id: profesorSeccion // Usa el objeto completo de profesorSeccion
                }
            });
    
            const totalAsistencias = asistencias.length;
            const faltas = asistencias.filter(asistencia => !asistencia.asistio).length;
            const porcentajeFaltas = totalAsistencias > 0 ? (faltas / totalAsistencias) * 100 : 0;
    
            resultados.push({
                alumno, // Devuelve el objeto del alumno
                porcentajeFaltas,
                faltas,
                clasesTotales: totalAsistencias // Se agrega el total de clases
            });
        }
    
        return resultados;
    }
    
    

    //faltas por fecha_
    async obtenerFaltasPorFecha(profesorId: string, cursoId: string): Promise<{ fecha: string; faltas: number; asistencias: number }[]> {
        const profesorSeccion = await this.profesorSeccionRepository.findOne({
            where: {
                profesor: { id_profesor: profesorId },
                curso: { id_curso: cursoId }
            }
        });

        if (!profesorSeccion) {
            throw new NotFoundException('Profesor, curso o sección no encontrados');
        }

        const asistencias = await this.asistenciaRepository.find({
            where: { profesorSeccion_id: profesorSeccion },
            relations: ['alumno_id']
        });

        const registroPorFecha: Record<string, { faltas: number; asistencias: number }> = {};

        for (const asistencia of asistencias) {
            const fecha = asistencia.fecha.toISOString().split('T')[0];

            if (!registroPorFecha[fecha]) {
                registroPorFecha[fecha] = { faltas: 0, asistencias: 0 };
            }

            if (!asistencia.asistio) {
                registroPorFecha[fecha].faltas++;
            } else {
                registroPorFecha[fecha].asistencias++;
            }
        }

        return Object.entries(registroPorFecha).map(([fecha, { faltas, asistencias }]) => ({
            fecha,
            faltas,
            asistencias
        }));
    }
}