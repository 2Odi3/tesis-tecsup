import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../Navbar";
import NavbarHeader from '../NavbarHeader';
import { getCoursesByProfessorId } from '../../services/apiService';
import { encryptId } from '../../utils/cryptoUtils';

const Courses = () => {
    const [cursosProfesor, setCursosProfesor] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const idProf = localStorage.getItem('userId');

        if (!idProf) {
            setErrorMessage("ID de profesor no encontrado");
            return;
        }

        const fetchCourses = async () => {
            try {
                const cursos = await getCoursesByProfessorId(idProf);
                setSuccessMessage('Cursos encontrados');
                setCursosProfesor(cursos);
            } catch (error) {
                setErrorMessage(error.message || 'Error al conectarse con el servidor');
            }
        };

        fetchCourses();
    }, []);

    const handleCardClick = (idCurso, e) => {
        if (e.target.closest('.icon-access')) return;

        const encryptedId = encryptId(idCurso);
        navigate(`/curso/${encryptedId}`);
    };

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const handleAsistanceClick = (idCurso, idProfesor, e) => {
        e.stopPropagation();
        if (idCurso && idProfesor) {
            const encryptedCourseId = encryptId(idCurso);
            const encryptedTeachId = encryptId(idProfesor);
            navigate(`/asistencia/${encryptedCourseId}/${encryptedTeachId}`);
        } else {
            setErrorMessage("ID de curso o profesor inválido");
        }
    };

    const handleStatsClick = (idCurso) => {
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
                            <div className="breadcrumb-title pe-3">Cursos</div>
                            <div className="ps-3">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-0 p-0 align-items-center">
                                        <li className="breadcrumb-item">
                                            <a href="#" onClick={() => { }}><ion-icon name="home-outline"></ion-icon></a>
                                        </li>
                                        <li className="breadcrumb-item active" aria-current="page">Cursos</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>

                        <div className="my-3 border-bottom"></div>

                        {cursosProfesor.length > 0 ? (
                            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 ">
                                {cursosProfesor.map((curso) => (
                                    <div className="col" key={curso.id_curso}>
                                        <div className="card card-curso card-anima" onClick={(e) => handleCardClick(curso.id_curso, e)}>
                                            <div
                                                className="card-header card-head"
                                                style={{ backgroundColor: getRandomColor() }}
                                            ></div>
                                            <div className="card-body card-bod">
                                                <h5 className="card-title card-tit">{curso.nombre}</h5>
                                            </div>
                                            <div className="card-foot d-flex justify-content-around mb-2">
                                                <div className="icon-access icon-acc" onClick={(e) => handleAsistanceClick(curso.id_curso, localStorage.getItem('userId'), e)}>
                                                    <i className="lni lni-checkmark-circle"></i>
                                                </div>

                                                <div className="icon-access icon-acc" onClick={(e) => { handleStatsClick(curso.id_curso), e }}>
                                                    <i className="lni lni-stats-up"></i>
                                                </div>

                                                <div className="icon-access icon-acc" onClick={(e) => { handleScheduleClick(curso.id_curso), e }}>
                                                    <i className="lni lni-calendar"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>{errorMessage || "Algo está mal"}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Courses;
