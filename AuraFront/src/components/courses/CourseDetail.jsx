import Navbar from "../Navbar";
import NavbarHeader from "../NavbarHeader";
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getCursoById } from "../../services/apiService";
import { decryptId, encryptId } from "../../utils/cryptoUtils";

const CourseDetail = () => {
    const { id } = useParams();
    const [curso, setCurso] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [decryptedId, setDecryptedId] = useState(null);
    const navigate = useNavigate();

    const idProf = localStorage.getItem('userId');

    useEffect(() => {
        try {
            const decryptedId = decryptId(id);
            console.log(decryptedId);
            setDecryptedId(decryptedId);
        } catch (error) {
            setErrorMessage("Error al procesar el ID del curso");
        }
    }, [id]);

    useEffect(() => {
        const fetchCurso = async () => {
            if (decryptedId) {
                try {
                    const cursoData = await getCursoById(decryptedId);
                    setCurso(cursoData);
                } catch (error) {
                    setErrorMessage(error.message);
                }
            }
        };

        fetchCurso();
    }, [decryptedId]);

    const handleCardClick = (idCurso, idProfesor) => {
        if (idCurso && idProfesor) {
            const encryptedCourseId = encryptId(idCurso);
            const encryptedTeachId = encryptId(idProfesor);
            navigate(`/asistencia/${encryptedCourseId}/${encryptedTeachId}`);
        } else {
            setErrorMessage("ID de curso o profesor inválido");
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

    const handleScheduleClick = (idCurso) => {
        if (idCurso) {
            const encryptedCourseId = encryptId(idCurso);
            navigate(`/horario/${encryptedCourseId}`);
        } else {
            setErrorMessage("ID de curso o profesor inválido");
        }
    };

    return (
        <div>
            <div className="wrapper">
                <NavbarHeader />

                <div className="page-content-wrapper">
                    <div className="page-content">
                        <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
                            <div className="breadcrumb-title pe-3">Detalles</div>
                            <div className="ps-3">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-0 p-0 align-items-center">
                                        <li className="breadcrumb-item">
                                            <Link to='/home' onClick={(e) => e.preventDefault()}>
                                                <ion-icon name="home-outline"></ion-icon>
                                            </Link>
                                        </li>
                                        <li className="breadcrumb-item active" aria-current="page">
                                            Cursos
                                        </li>
                                        <li className="breadcrumb-item active" aria-current="page">
                                            {curso ? curso.nombre : ""}
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>

                        <hr className="my-4" />

                        <div className="title-course my-4">
                            <h1 className="text-center curso-titu">{curso ? curso.nombre : "Cargando..."}</h1>
                        </div>

                        <div className="row justify-content-center my-4">
                            <div className="col-12 col-md-4 d-flex justify-content-center">
                                <a onClick={() => handleCardClick(decryptedId, idProf)}>
                                    <div className="card radius-10 card-animation">
                                        <div className="card-body text-center curso-card">
                                            <h5 className="mb-3 card-t">Asistencias</h5>
                                            <div className="icon-course">
                                                <i className="lni lni-checkmark-circle"></i>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>

                            <div className="col-12 col-md-4 d-flex justify-content-center">
                                <a onClick={() => handleCard1Click(decryptedId)}>
                                    <div className="card radius-10 card-animation">
                                        <div className="card-body text-center curso-card">
                                            <h5 className="mb-3 card-t">Estadísticas</h5>
                                            <div className="icon-course">
                                                <i className="lni lni-stats-up"></i>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>

                            <div className="col-12 col-md-4 d-flex justify-content-center">
                                <a onClick={() => handleScheduleClick(decryptedId)}>
                                    <div className="card radius-10 card-animation">
                                        <div className="card-body text-center curso-card">
                                            <h5 className="mb-3 card-t">Horario</h5>
                                            <div className="icon-course">
                                                <i className="lni lni-calendar"></i>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseDetail;
