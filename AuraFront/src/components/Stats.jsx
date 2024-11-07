import Navbar from "./Navbar";
import NavbarHeader from "./NavbarHeader";
import { createLineChart, createBarChart, createRadarChart } from "../hooks/stats";
import React, { useEffect, useState } from 'react';
import { obtenerPorcentajeFaltas, getCoursesByProfessorId, obtenerFaltasPorFecha } from '../services/apiService'; 
import { useNavigate } from 'react-router-dom';
import { encryptId } from "../utils/cryptoUtils";

function Home() {
    const navigate = useNavigate(); 
    const [faltasData, setFaltasData] = useState([]);
    const [cursoId1, setCursoId1] = useState(null);
    const [cursoId2, setCursoId2] = useState(null);
    const [cursoId3, setCursoId3] = useState(null);
    const [cursoId4, setCursoId4] = useState(null);
    const profesorId = localStorage.getItem('userId');

    // Cursos aleatorios
    useEffect(() => {
        if (!profesorId) {
            setErrorMessage("ID de profesor no encontrado");
            return;
        }

        const fetchCourses = async () => {
            try {
                const cursos = await getCoursesByProfessorId(profesorId);
                
                if (cursos && cursos.length) {
                    const randomCursos = cursos.sort(() => 0.5 - Math.random()).slice(0, 6);
        
                    setCursoId1(randomCursos[0] || null);
                    setCursoId2(randomCursos[1] || null);
                    setCursoId3(randomCursos[2] || null);
                    setCursoId4(randomCursos[3] || null);
                } else {
                    setErrorMessage("No se encontraron cursos.");
                }
        
            } catch (error) {
                setErrorMessage(error.message || 'Error al conectarse con el servidor');
            }
        };
        fetchCourses();
    }, [profesorId]);

    // Porcentajes de faltas
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

    // Faltas por fecha curso
    const fetchFaltasData = async (cursoId) => {
        if (!cursoId) return; 
    
        try {
            const enviar = {
                profesorId: profesorId,
                cursoId: cursoId.id_curso
            };

            const data = await obtenerFaltasPorFecha(enviar.profesorId, enviar.cursoId);
            return data;
        } catch (error) {
            console.error(error);
        }
    };

    const handleCard1Click = (idCurso) => {
        if (idCurso) {
            const encryptedCourseId = encryptId(idCurso);
            navigate(`/estadisticas-curso/${encryptedCourseId}`);
        } else {
            setErrorMessage("ID de curso o profesor inválido");
        }
    };
    
    useEffect(() => {
        const fetchAndRenderData = async () => {
            const dataCurso2 = await fetchFaltasData(cursoId2);
            if (!dataCurso2) return;
    
            const ctx = document.getElementById('chart1').getContext('2d');
            
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
        const fetchAndRenderData = async () => {
            const dataCurso3 = await fetchFaltasData(cursoId3);
            if (!dataCurso3) return;
    
            const ctx = document.getElementById('chart3').getContext('2d');
            
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
        fetchAndRenderData();
    }, [cursoId3, profesorId]);

    useEffect(() => {
        const fetchAndRenderData = async () => {
            const dataCurso4 = await obtenerPorcentajeFaltas(cursoId4);
            if (!dataCurso4) return;
    
            const ctx = document.getElementById('chart4').getContext('2d');
            
            const limitedDataCurso4 = dataCurso4.slice(-5);
    
            const labels = limitedDataCurso4.map(item => item.alumno.nombre);
            const dataR = limitedDataCurso4.map(item => item.porcentajeFaltas);

            const newChartInstance = createRadarChart(ctx, labels, dataR);
            setChartInstance(newChartInstance);
    
            return () => myChart.destroy();
        };
        fetchAndRenderData();
    }, [cursoId4, profesorId]);
    
    const getColor = (porcentajeFaltas) => {
        if (porcentajeFaltas >= 30) return 'text-danger'; 
        if (porcentajeFaltas > 15) return 'text-warning'; 
        return 'text-success'; 
    };

    return (
        <div>
            <div>
                <div className="wrapper">
                    <NavbarHeader />

                    <div className="page-content-wrapper">
                        <div className="page-content">
                            <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
                                <div className="breadcrumb-title pe-3">Estadísticas</div>
                                <div className="ps-3">
                                    <nav aria-label="breadcrumb">
                                        <ol className="breadcrumb mb-0 p-0 align-items-center">
                                            <li className="breadcrumb-item">
                                                <a onClick={(e) => { e.preventDefault(); }}>
                                                    <i className="lni lni-stats-up"></i>
                                                </a>
                                            </li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>

                            <hr className="my-4" />

                            <div className="row row-cols-1 row-cols-lg-3">
                                
                                <div className="col" style={{ width: '1050px' }}>
                                    <div className="card radius-10 card-a w-100" onClick={() => { handleCard1Click(cursoId2.id_curso); }}>
                                        <div className="card-body">
                                            <h6 className="mb-0">{cursoId1 ? cursoId2.nombre : "Nombre del curso no disponible"}</h6>
                                            <div className="chart-container my-4" style={{ height: '480px' }}>
                                                <canvas id="chart1" height="300" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col">
                                    <div className="card radius-10 card-a w-100" onClick={() => { handleCard1Click(cursoId1.id_curso); }}>
                                        <div className="card-body">
                                            <h6 className="mb-0">{cursoId1 ? cursoId1.nombre : "Nombre del curso no disponible"}</h6>
                                            <div className="countries-list my-4" style={{ height: '480px' }}>
                                                {faltasData
                                                    .sort((a, b) => b.porcentajeFaltas - a.porcentajeFaltas)
                                                    .slice(0, 9)
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
                                    <div className="card radius-10 card-a w-100" onClick={() => { handleCard1Click(cursoId4.id_curso); }}>
                                        <div className="card-body" >
                                            <h6 className="mb-0">{cursoId1 ? cursoId4.nombre : "Nombre del curso no disponible"}</h6>
                                            <div className="chart-container my-4">
                                                <canvas id="chart4" height="300" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col" style={{ width: '1050px' }}>
                                    <div className="card radius-10 card-a w-100" onClick={() => { handleCard1Click(cursoId3.id_curso); }}>
                                        <div className="card-body">
                                            <h6 className="mb-0">{cursoId1 ? cursoId3.nombre : "Nombre del curso no disponible"}</h6>
                                            <div className="chart-container my-4" style={{ height: '480px' }}>
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
