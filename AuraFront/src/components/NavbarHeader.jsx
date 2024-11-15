import React, { useState, useEffect } from 'react';

const NavbarHeader = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light-theme');
  const [iconName, setIconName] = useState(theme === 'dark-theme' ? 'sunny-outline' : 'moon-outline');
  const [menuToggled, setMenuToggled] = useState(false);
  const [isTakingAsistance, setIsTakingAsistance] = useState(false);
  const [datosCurso, setDatosCurso] = useState();

  useEffect(() => {
    const checkLocalStorage = () => {
      const storedIsTakingAsistance = JSON.parse(localStorage.getItem('isTakingAsistance'));
      if (storedIsTakingAsistance && storedIsTakingAsistance.isTakingAsistance) {
        setIsTakingAsistance(true);
        setDatosCurso(storedIsTakingAsistance);
      }
    };

    checkLocalStorage();

    const intervalId = setInterval(() => {
      checkLocalStorage();
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    if (tooltipTriggerList.length > 0) {
      tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
  }, []);

  // Este useEffect agrega o elimina las clases de tema al cambiar el estado
  useEffect(() => {
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'dark-theme') {
      setTheme('light-theme');
      setIconName('moon-outline');
      localStorage.setItem('theme', 'light-theme');
    } else {
      setTheme('dark-theme');
      setIconName('sunny-outline');
      localStorage.setItem('theme', 'dark-theme');
    }
  };

  const toggleMenu = () => {
    setMenuToggled((prevState) => !prevState);
    const wrapper = document.querySelector('.wrapper');
    if (wrapper) {
      wrapper.classList.toggle('toggled');
    }
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

  return (
    <header className={`top-header ${theme}`}>
      <nav className="navbar navbar-expand gap-3">
        <div className="top-navbar-right ms-auto">
          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
              <a className="nav-link dark-mode-icon">
                <div
                  className="mode-icon"
                  data-bs-toggle="tooltip"
                  data-bs-placement="left"
                  data-bs-original-title={isTakingAsistance ? `${datosCurso.cursoNom} - Registrando` : 'No hay un registro en progreso'}
                  onClick={(e) => isTakingAsistance && handleAsistanceClick(datosCurso.cursoId, localStorage.getItem('userId'), e)}
                >
                  <i className="lni lni-checkmark-circle"></i>
                </div>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link dark-mode-icon" onClick={toggleTheme}>
                <div className="mode-icon d-flex align-items-center">
                  <ion-icon name={iconName}></ion-icon>
                </div>
              </a>
            </li>
            <li className="nav-item dropdown dropdown-user-setting">
              <div>
                {localStorage.getItem('perfil') ? (
                  <img src={localStorage.getItem('perfil')} className="user-img" alt="Perfil de usuario" />
                ) : (
                  <i className="user-img lni lni-user" alt="Avatar predeterminado"></i>
                )}
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default NavbarHeader;
