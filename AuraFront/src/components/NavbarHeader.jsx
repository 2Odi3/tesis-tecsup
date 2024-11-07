import React, { useState, useEffect } from 'react';

const NavbarHeader = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light-theme');
  const [iconName, setIconName] = useState(theme === 'dark-theme' ? 'sunny-outline' : 'moon-outline');
  const [menuToggled, setMenuToggled] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'dark-theme') {
      setTheme('light-theme');
      setIconName('moon-outline');
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('theme', 'light-theme'); 
    } else {
      setTheme('dark-theme');
      setIconName('sunny-outline');
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark-theme');
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

  return (
    <header className={`top-header ${theme}`}>
      <nav className="navbar navbar-expand gap-3">
        <div className="toggle-icon" onClick={toggleMenu}>
          <ion-icon name="menu-outline"></ion-icon>
        </div>
        <form className="searchbar">
          <div className="position-absolute top-50 translate-middle-y search-icon ms-3">
            <ion-icon name="search-outline"></ion-icon>
          </div>
          <input className="form-control" type="text" placeholder="Busca algún curso" />
          <div className="position-absolute top-50 translate-middle-y search-close-icon">
            <ion-icon name="close-outline"></ion-icon>
          </div>
        </form>
        <div className="top-navbar-right ms-auto">
          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
              <a className="nav-link mobile-search-button" onClick={(e) => e.preventDefault()}>
                <div>
                  <ion-icon name="search-outline"></ion-icon>
                </div>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link dark-mode-icon" onClick={toggleTheme}>
                <div className="mode-icon">
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
