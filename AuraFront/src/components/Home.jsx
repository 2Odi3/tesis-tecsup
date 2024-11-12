import NavbarHeader from "./NavbarHeader";
import { createLineChart, createBarChart } from "../hooks/stats";
import React, { useEffect, useState } from 'react';
import { obtenerPorcentajeFaltas, getCoursesByProfessorId, obtenerFaltasPorFecha, getHorarioByProfesor } from '../services/apiService';
import { encryptId } from "../utils/cryptoUtils";
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();
    const [faltasData, setFaltasData] = useState([]);
    const [cursoId1, setCursoId1] = useState(null);
    const [cursoId2, setCursoId2] = useState(null);
    const [cursoId3, setCursoId3] = useState(null);
    const profesorId = localStorage.getItem('userId');
    const [upcomingCourses, setupcomingCourses] = useState(null);

    useEffect(() => {
        const request = {
            profesorId: profesorId,
            cursoId: ""
        };

        const fetchData = async () => {
            try {
                const data = await getHorarioByProfesor(request);
                
                console.log(data)
                
                const now = new Date();
                now.setHours(now.getHours() - 5); 
                const currentDayIndex = now.getDay();
                const currentTime = now.getHours() * 60 + now.getMinutes();

                const weekdays = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
                const upcomingCourses = [];

                let foundTodayCourse = false;

                for (let i = 0; i < 7; i++) {
                    const nextDayIndex = (currentDayIndex + i) % 7;
                    const coursesForDay = data.filter(horario => horario.dia === weekdays[nextDayIndex]);

                    if (coursesForDay.length > 0) {
                        for (const curso of coursesForDay) {
                            const [hour, minute] = curso.hora_inicio.split(':').map(Number);
                     const courseTime = hour * 60 + minute; 

                            if (nextDayIndex === currentDayIndex && courseTime > currentTime) {
                                upcomingCourses.push(curso);
                                foundTodayCourse = true; 
                                break; 
                            }

                            if (nextDayIndex > currentDayIndex) {
                                upcomingCourses.push(curso);
                            }
                        }
                    }

                    if (foundTodayCourse) {
                        let j = (nextDayIndex + 1) % weekdays.length;

                        while (upcomingCourses.length < data.length && j !== nextDayIndex) {
                            const remainingCoursesForDay = data.filter(horario => horario.dia === weekdays[j]);
                            upcomingCourses.push(...remainingCoursesForDay);

                            j = (j + 1) % weekdays.length;
                        }

                        break;
                    }
                }

                setupcomingCourses(upcomingCourses);

            } catch (error) {
                console.error("Error:", error.message);
            }
        };

        fetchData();
    }, [profesorId]);

    //cursos aleatoreos
    useEffect(() => {
        if (!profesorId) {
            setErrorMessage("ID de profesor no encontrado");
            return;
        }

        const fetchCourses = async () => {
            try {
                const cursos = await getCoursesByProfessorId(profesorId);

                if (cursos && cursos.length) {
                    const randomCursos = cursos.sort(() => 0.5 - Math.random()).slice(0, 3);

                    setCursoId1(randomCursos[0] || null);
                    setCursoId2(randomCursos[1] || null);
                    setCursoId3(randomCursos[2] || null);
                } else {
                    setErrorMessage("No se encontraron cursos.");
                }

            } catch (error) {
                setErrorMessage(error.message || 'Error al conectarse con el servidor');
            }
        };
        fetchCourses();
    }, [profesorId]);

    //porcentajes de faltas
    useEffect(() => {
        const fetchFaltasData = async () => {
            if (!cursoId1) return;

            try {
                const enviar = {
                    alumnoId: "",
                    profesorId: profesorId,
                    cursoId: cursoId1.id_curso
                };

                const data = await obtenerPorcentajeFaltas(enviar);
                setFaltasData(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchFaltasData();
    }, [cursoId1, profesorId]);

    //faltas por fecha curso
    const fetchFaltasDiaData = async (cursoId) => {
        if (!cursoId) return;

        try {
            const enviar = {
                profesorId: profesorId,
                cursoId: cursoId.id_curso
            };

            const data = await obtenerFaltasPorFecha(enviar.profesorId, enviar.cursoId);
            return data
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchAndRenderData = async () => {
            const dataCurso2 = await fetchFaltasDiaData(cursoId2);
            if (!dataCurso2) return;

            const ctx = document.getElementById('chart1').getContext('2d');

            // Limitar los datos a los primeros 5 elementos
            const limitedDataCurso2 = dataCurso2.slice(-5);

            const labels = limitedDataCurso2.map(item => item.fecha);
            const datasetsLine = [
                {
                    label: 'Faltas',
                    data: limitedDataCurso2.map(item => item.faltas)
                },
                {
                    label: 'Asistencias',
                    data: limitedDataCurso2.map(item => item.asistencias)
                },
            ];
            const myChart = createLineChart(ctx, labels, datasetsLine);

            return () => myChart.destroy();
        };
        fetchAndRenderData();
    }, [cursoId2, profesorId]);

    useEffect(() => {
        const fetchAndRenderData1 = async () => {
            const dataCurso3 = await fetchFaltasDiaData(cursoId3);
            if (!dataCurso3) return;

            const ctx = document.getElementById('chart3').getContext('2d');

            // Limitar los datos a los primeros 5 elementos
            const limitedDataCurso3 = dataCurso3.slice(-5);

            const labels = limitedDataCurso3.map(item => item.fecha);
            const datasetsLine = [
                {
                    label: 'Faltas',
                    data: limitedDataCurso3.map(item => item.faltas)
                },
                {
                    label: 'Asistencias',
                    data: limitedDataCurso3.map(item => item.asistencias)
                },
            ];
            const myChart = createBarChart(ctx, labels, datasetsLine);

            return () => myChart.destroy();
        };
        fetchAndRenderData1();
    }, [cursoId3, profesorId]);

    const getColor = (porcentajeFaltas) => {
        if (porcentajeFaltas >= 30) return 'text-danger';
        if (porcentajeFaltas > 15) return 'text-warning';
        return 'text-success';
    };

    const handleStatsClick = (idCurso) => {
        if (idCurso) {
            const encryptedCourseId = encryptId(idCurso);
            navigate(`/estadisticas-curso/${encryptedCourseId}`);
        } else {
            setErrorMessage("ID de curso o profesor inválido");
        }
    };

    const handleCourseClick = (idCurso) => {
        if (idCurso) {
            const encryptedCourseId = encryptId(idCurso);
            navigate(`/curso/${encryptedCourseId}`);
        } else {
            setErrorMessage("ID de curso o profesor inválido");
        }
    };

    const abbreviateCourseName = (name) => {
        if (name.length <= 15) return name; 

        const words = name.split(" ");
        if (words.length > 1) {
            return words.map(word => word.charAt(0)).join("").slice(0, 15).toUpperCase();
        } else {
            return name.slice(0, 15) + '...';
        }
    };

    useEffect(() => {
        const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        const tooltipList = tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    
        return () => {
            tooltipList.forEach(tooltip => tooltip.dispose());
        };
    }, [upcomingCourses]);

    const limitedUpcomingCourses = Array.isArray(upcomingCourses) ? upcomingCourses.slice(0, 4) : [];

    return (
        <div>
            <div>
                <div className="wrapper">
                    <NavbarHeader />

                    <div className="page-content-wrapper">
                        <div className="page-content">
                            <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
                                <div className="breadcrumb-title pe-3">Inicio</div>
                                <div className="ps-3">
                                    <nav aria-label="breadcrumb">
                                        <ol className="breadcrumb mb-0 p-0 align-items-center">
                                            <li className="breadcrumb-item">
                                                <a onClick={(e) => { e.preventDefault(); }}>
                                                    <ion-icon name="home-outline"></ion-icon>
                                                </a>
                                            </li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>

                            <hr className="my-4" />
                            <div className="mb-4 d-flex justify-content-end">
                                <h6>Próximos</h6>
                            </div>

                            <div className="row row-cols-1 row-cols-lg-2 row-cols-xxl-4">
                                {limitedUpcomingCourses && limitedUpcomingCourses.length > 0 ? (
                                    limitedUpcomingCourses.map((course, index) => (
                                        <div className="col" key={index}>
                                            <div className="card radius-10 card-ani" onClick={() => { handleCourseClick(course.curso.id_curso); }}>
                                                <div className="card-body">
                                                    <div className="d-flex align-items-start gap-2">
                                                        <div>
                                                            <p 
                                                            className="mb-0 fs-6"
                                                            data-bs-toggle= "tooltip"
                                                            title= {course.curso.nombre}
                                                            >
                                                                {abbreviateCourseName(course.curso.nombre) || "Nombre del Curso"}
                                                            </p>
                                                        </div>
                                                        
                                                    </div>
                                                    <div className="d-flex align-items-center mt-3">
                                                        <div>
                                                            <p className="mb-0">{course.hora_inicio} a {course.hora_fin}</p>

                                                        </div>
                                                        <div className="ms-auto">
                                                            <p className="mb-0">{course.dia}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No hay cursos próximos disponibles.</p>
                                )}
                            </div>

                            <hr className="my-4" />
                            <div className="mb-4 d-flex justify-content-end">
                                <h6>Estadísticas
                                </h6>
                            </div>

                            <div className="row row-cols-1 row-cols-lg-3">
                                <div className="col">
                                    <div className="card radius-10 w-100 card-anima" onClick={() => { handleStatsClick(cursoId1.id_curso); }}>
                                        <div className="card-body">
                                            <div className="d-flex align-items-center mb-3">
                                                <h6 className="mb-0">{cursoId1 ? cursoId1.nombre : "Nombre del curso no disponible"}</h6>
                                            </div>
                                            <div className="countries-list my-4">
                                                {faltasData
                                                    .sort((a, b) => b.porcentajeFaltas - a.porcentajeFaltas)
                                                    .slice(0, 6)
                                                    .map((falta) => (
                                                        <div className="d-flex align-items-center gap-3 mb-3" key={falta.alumno.id_alumno}>
                                                            <div className="country-name flex-grow-1">
                                                                <h5 className={`mb-0 ${getColor(falta.porcentajeFaltas)}`}>{`${falta.alumno.nombre}`}</h5>
                                                                <p className="mb-0 text-secondary">{falta.faltas}/{falta.clasesTotales}</p>
                                                            </div>
                                                            <div className="">
                                                                <p className={`mb-0 ${getColor(falta.porcentajeFaltas)} d-flex gap-1 align-items-center fw-500`}>
                                                                    <span>{`${falta.porcentajeFaltas}%`}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="card radius-10 w-100 card-ani" onClick={() => { handleStatsClick(cursoId2.id_curso); }}>
                                        <div className="card-body">
                                            <h6 className="mb-0">{cursoId1 ? cursoId2.nombre : "Nombre del curso no disponible"}</h6>
                                            <div className="chart-container my-4">
                                                <canvas id="chart1" height="300" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="card radius-10 w-100 card-ani">
                                        <div className="card-body" onClick={() => { handleStatsClick(cursoId3.id_curso); }}>
                                            <h6 className="mb-0">{cursoId1 ? cursoId3.nombre : "Nombre del curso no disponible"}</h6>
                                            <div className="chart-container my-4">
                                                <canvas id="chart3" height="300" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
