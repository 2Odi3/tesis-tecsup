import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCoursesByProfessorId } from '../services/apiService';
import { encryptId } from '../utils/cryptoUtils';
import { logout } from '../hooks/userState';

const Navbar = ({ setIsAuthenticated }) => {
  const [cursosProfesor, setCursosProfesor] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const idProf = localStorage.getItem('userId');

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

  const handleCardClick = (idCurso) => {
    const encryptedId = encryptId(idCurso);
    navigate(`/curso/${encryptedId}`);
  };

  const toggleMenu = () => {
    setMenuVisible((prevVisible) => !prevVisible);
  };

  const handleLogout = () => {
    logout(setIsAuthenticated);
    navigate('/');
  };

  const abbreviateCourseName = (name) => {
    if (name.length <= 15) return name;
    const words = name.split(" ");
    return words.length > 1 ? words.map(word => word.charAt(0)).join("").slice(0, 15).toUpperCase() : name.slice(0, 15) + '...';
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
    <aside className="sidebar-wrapper" data-simplebar="true">
      <Link to="/home">
        <div className="sidebar-header" style={{ cursor: 'pointer' }}>
          <div>
            <img src="/src/assets/images/aura-logo-icon.png" className='navIcon' alt="" />
          </div>
          <div>
            <strong className="logo-text">Aura</strong>
          </div>
        </div>
      </Link>
      <ul className="metismenu" id="menu">
        <li>
          <Link to="/home">
            <div className="parent-icon">
              <ion-icon name="home-outline"></ion-icon>
            </div>
            <div className="menu-title">Inicio</div>
          </Link>
        </li>

        <li style={{ cursor: 'pointer' }}>
          <a onClick={toggleMenu}>
            <div className="parent-icon">
              <div className="font-22">
                <i className="lni lni-library"></i>
              </div>
            </div>
            <div className="menu-title">Cursos</div>
          </a>
          {menuVisible && (
            <ul>
              <Link to="/cursos">
                <ion-icon name="ellipse-outline"></ion-icon>
                Todos los cursos
              </Link>
              {cursosProfesor.length > 0 ? (
                cursosProfesor.map((curso) => (
                  <li key={curso.id_curso}>
                    <a onClick={() => handleCardClick(curso.id_curso)}>
                      <ion-icon name="ellipse-outline"></ion-icon>
                      {abbreviateCourseName(curso.nombre)}
                    </a>
                  </li>
                ))
              ) : (
                <li>
                  <a href="#">
                    <ion-icon name="ellipse-outline"></ion-icon>
                    No hay cursos disponibles
                  </a>
                </li>
              )}
            </ul>
          )}
        </li>

        <li>
          <Link to='/stats'>
            <div className="parent-icon">
              <div className="font-22">
                <i className="lni lni-stats-up"></i>
              </div>
            </div>
            <div className="menu-title">Estadísticas</div>
          </Link>
        </li>

        <li>
          <a onClick={() => handleScheduleClick("todos")}>
            <div className="parent-icon">
              <div className="font-22">
                <i className="lni lni-calendar"></i>
              </div>
            </div>
            <div className="menu-title">Horario</div>
          </a>
        </li>

        <li className="logout-item" style={{ cursor: 'pointer' }}>
          <a onClick={handleLogout}>
            <div className="parent-icon">
              <div className="font-22">
                <ion-icon name="log-out-outline"></ion-icon>
              </div>
            </div>
            <div className="menu-title">Cerrar sesión</div>
          </a>
        </li>
      </ul>
    </aside>
  );
};

export default Navbar;
