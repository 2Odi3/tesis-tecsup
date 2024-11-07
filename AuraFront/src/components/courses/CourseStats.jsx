import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createLineChart, createBarChart, createRadarChart } from "../../hooks/stats";
import { obtenerFaltasPorFecha, getCursoById, obtenerPorcentajeFaltas } from '../../services/apiService';
import { decryptId } from "../../utils/cryptoUtils";
import Navbar from "../Navbar";
import NavbarHeader from "../NavbarHeader";

const CourseStats = () => {
    const { idCurso } = useParams();
    const [curso, setCurso] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [chartType, setChartType] = useState("Line");
    const [chartInstance, setChartInstance] = useState(null);
    const [dias, setDias] = useState('4');
    const [faltasData, setFaltasData] = useState([]);
    const [faltasPorcentaje, setFaltaPorcentaje] = useState([]);
    const [alumnosData, setAlumnosData] = useState([]);
    const idProfesor = localStorage.getItem('userId');
    const idCur = decryptId(idCurso);
    const [viewMode, setViewMode] = useState("Fecha");
    const [showOptions, setShowOptions] = useState(true);
    const [dataListWidth, setDataListWidth] = useState("100%");

    const handleToggleOptions = () => setShowOptions(!showOptions);

    useEffect(() => {
        const fetchCurso = async () => {
            if (idCur) {
                try {
                    const cursoData = await getCursoById(idCur);
                    setCurso(cursoData);
                } catch (error) {
                    setErrorMessage(error.message);
                }
            }
        };
        fetchCurso();
    }, [idCur]);

    // Obtener porcentaje de faltas
    const fetchPorcentajesFaltasData = async () => {
        if (!idCur) return;

        try {
            const enviar = {
                profesorId: idProfesor,
                cursoId: idCur
            };
            const data = await obtenerPorcentajeFaltas(enviar);
            setFaltaPorcentaje(data);
            return data;
        } catch (error) {
            console.error(error);
        }
    };

    // Obtener faltas por fecha
    const fetchFaltasData = async () => {
        if (!idCur) return;

        try {
            const data = await obtenerFaltasPorFecha(idProfesor, idCur);
            const dataWithWeeks = data.map((item, index) => ({
                ...item,
                semana: index + 1
            }));
            setFaltasData(dataWithWeeks);
            return dataWithWeeks;
        } catch (error) {
            console.error(error);
        }
    };

    // Obtener datos de alumnos
    const fetchAlumnosData = async () => {
        if (!idCur) return;

        try {
            const data = await obtenerPorcentajeFaltas({
                profesorId: idProfesor,
                cursoId: idCur
            });
            setAlumnosData(data);
        } catch (error) {
            console.error(error);
        }
    };

    // Decidir gráfico
    const renderChart = async (canvasId) => {
        const dataAlumno = await fetchPorcentajesFaltasData();
        const dataCurso = await fetchFaltasData();
        if (!dataCurso) return;

        if (chartInstance) {
            chartInstance.destroy();
            setChartInstance(null);
        }

        await new Promise(resolve => setTimeout(resolve, 0));

        const ctx = document.getElementById(canvasId).getContext('2d');
        const limitedData = dataCurso.slice(-parseInt(dias));
        const labels = limitedData.map(item => `Semana ${item.semana}`);
        const datasets = [
            { label: 'Faltas', data: limitedData.map(item => item.faltas)},
            { label: 'Asistencias', data: limitedData.map(item => item.asistencias)},
        ];

        if (viewMode === "Alumno") {
            const labelsR = dataAlumno.map(item => item.alumno.nombre);
            const dataR = dataAlumno.map(item => item.porcentajeFaltas);

            const newChartInstance = createRadarChart(ctx, labelsR, dataR);
            setChartInstance(newChartInstance);
        } else {
            const createChartFunc = chartType === "Line" ? createLineChart : createBarChart;
            const newChartInstance = createChartFunc(ctx, labels, datasets);
            setChartInstance(newChartInstance);
        }
    };

    useEffect(() => {
        renderChart('chartCanvas');
    }, [chartType, idCur, idProfesor, dias, viewMode]);

    useEffect(() => {
        fetchFaltasData();
        if (viewMode === "Alumno") {
            fetchAlumnosData();
        }
    }, [idCur, viewMode]);

    return (
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
                                        <Link to='/home'>
                                            <ion-icon name="home-outline"></ion-icon>
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">Cursos</li>
                                    <li className="breadcrumb-item active" aria-current="page">{curso ? curso.nombre : ""}</li>
                                    <li className="breadcrumb-item active" aria-current="page">Estadísticas</li>
                                </ol>
                            </nav>
                        </div>
                        <div className="ms-auto d-flex align-items-center">
                            <span className="me-2">Fecha</span>
                            <label className="toggle-button">
                                <input
                                    type="checkbox"
                                    checked={viewMode === "Alumno"}
                                    onChange={() => {
                                        setViewMode(prev => (prev === "Fecha" ? "Alumno" : "Fecha"));
                                        handleToggleOptions();
                                    }}
                                />
                                <span className="slider"></span>
                            </label>
                            <span className="ms-2">Alumno</span>
                        </div>
                    </div>
                    <hr className="my-4" />

                    {showOptions && (
                        <div className="d-flex align-items-center justify-content-between mt-4">
                            <div className="chart-switch d-flex me-auto">
                                <input
                                    type="radio"
                                    className="btn-check"
                                    name="chartType"
                                    id="lineChart"
                                    autoComplete="off"
                                    checked={chartType === "Line"}
                                    onChange={() => setChartType("Line")}
                                />
                                <label className="btn custom-btn" htmlFor="lineChart">Tipo 1</label>

                                <input
                                    type="radio"
                                    className="btn-check"
                                    name="chartType"
                                    id="barChart"
                                    autoComplete="off"
                                    checked={chartType === "Bar"}
                                    onChange={() => setChartType("Bar")}
                                />
                                <label className="btn custom-btn" htmlFor="barChart">Tipo 2</label>
                            </div>

                            <div className="d-flex align-items-center mx-3">
                                <span className="font-18 me-2">Mostrar</span>
                                <select
                                    onChange={(e) => setDias(e.target.value)}
                                    className="form-select mx-2"
                                    value={dias}
                                >
                                    <option value="4">4</option>
                                    <option value="8">8</option>
                                    <option value="12">12</option>
                                    <option value="16">16</option>
                                </select>
                                <span className="font-18">fechas</span>
                            </div>
                        </div>
                    )}

                    <div className="card-body">
                        <div className={`d-flex ${viewMode === "Alumno" ? "flex-row" : "flex-column"}`} style={{ height: '450px' }}>

                            <div className="chartContainer me-4" style={{ flex: 1 }}>
                                <div className="chart-container my-5 d-flex justify-content-center" style={{ height: viewMode === "Fecha" ? "450px" : "700px"}}>
                                    <canvas id="chartCanvas" height="300" />
                                </div>
                            </div>

                            <div className="col dataList" style={{ flex: 1 }}>
                                <div className="card-body">
                                    <div className="countries-list">
                                        <h1 className='mb-4'>
                                            LISTA DE {viewMode === "Fecha" ? "FECHAS" : "ALUMNOS"} CON MÁS <strong className='text-danger'>FALTAS</strong>
                                        </h1>

                                        {viewMode === "Fecha" ? (
                                            faltasData
                                                .slice()
                                                .sort((a, b) => b.faltas - a.faltas)
                                                .slice(0, parseInt(dias))
                                                .map((falta) => {
                                                    const asistencias = falta.asistencias || 1;
                                                    const total = asistencias + falta.faltas;
                                                    const porcentajeFaltas = falta.faltas / total;

                                                    const colorClass =
                                                        porcentajeFaltas > 0.5 ? "text-danger" :
                                                            porcentajeFaltas > 0.25 ? "text-warning" :
                                                                "text-success";

                                                    return (
                                                        <div className="mb-3" key={falta.semana}>
                                                            <div className="d-flex flex-wrap align-items-center gap-3" style={{ minWidth: "300px" }}>
                                                                <div className="country-name flex-grow-1">
                                                                    <h5 className="mb-0">{`Semana ${falta.semana}`}</h5>
                                                                    <p className="mb-0 text-secondary">
                                                                        <span className={colorClass}>{`${falta.faltas}/${total}`}</span>
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className={`mb-0 fw-500 ${colorClass}`}>
                                                                        <span>{`${falta.faltas} falta(s)`}</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                        ) : (
                                            alumnosData
                                                .sort((a, b) => b.porcentajeFaltas - a.porcentajeFaltas)
                                                .map((alumno) => {
                                                    const colorClass = alumno.porcentajeFaltas > 29 ? "text-danger" :
                                                        alumno.porcentajeFaltas > 15 ? "text-warning" : "text-success";

                                                    return (
                                                        <div className="mb-3" key={alumno.id}>
                                                            <div className="d-flex flex-wrap align-items-center gap-3" style={{ minWidth: "300px" }}>
                                                                <div className="country-name flex-grow-1">
                                                                    <h5 className="mb-0">{alumno.alumno.nombre}</h5>
                                                                    <p className="mb-0 text-secondary">
                                                                        <span className={colorClass}>{`${alumno.faltas}/${alumno.clasesTotales}`}</span>
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className={`mb-0 fw-500 ${colorClass}`}>
                                                                        <span>{`${alumno.porcentajeFaltas} %`}</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseStats;
