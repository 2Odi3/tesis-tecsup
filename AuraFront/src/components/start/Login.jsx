import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import SvgLogoIcon from '../SvgLogoIcon';
import { login } from '../../services/apiService';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (email, password, img = "") => {
    const loginData = {
      email: email,
      pass: password,
    };
  
    try {
      const data = await login(loginData);
  
      if (data.message === 'Inicio de sesión exitoso') {
        setSuccessMessage(data.message);
        setErrorMessage('');
        localStorage.setItem('perfil', img);
        localStorage.setItem('access_token', data.token); 
        setIsAuthenticated(true); 
        navigate('/home');
      } else {
        setErrorMessage('Error: Credenciales incorrectas');
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage('Error al conectarse con el servidor');
      setSuccessMessage('');
    }
  };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    const perfil = jwtDecode(credentialResponse.credential);
    handleSubmit(perfil.email, '', perfil.picture);
  };

  const handleGoogleLoginError = () => {
    setErrorMessage('Error al iniciar sesión con Google'); 
  };

  const onSubmit = (e) => {
    e.preventDefault(); 
    handleSubmit(email, password);
  };

  return (
    <div>
      <div className="wrapper">
        <header className='headerLog'>
          <Header />
        </header>
        <div className="container">
          <div className="row">
            <div className="col-xl-5 col-lg-6 col-md-7 mx-auto mt-5">
              <div className="card radius-10">
                <div className="card-body p-4">
                  <div className="text-center">
                    <strong className='strInicio'>Iniciar Sesión</strong>
                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                  </div>
                  <form className="form-body row g-3" onSubmit={onSubmit}>
                    <div className="col-12">
                      <label htmlFor="inputEmail" className="form-label">Correo</label>
                      <input
                        type="email"
                        className="form-control"
                        id="inputEmail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="inputPassword" className="form-label">Contraseña</label>
                      <input
                        type="password"
                        className="form-control"
                        id="inputPassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-lg-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="flexCheckChecked"
                          defaultChecked
                        />
                        <label className="form-check-label" htmlFor="flexCheckChecked">
                          Estoy de acuerdo con los términos y condiciones.
                        </label>
                      </div>
                    </div>
                    <div className="col-12 col-lg-12">
                      <div className="d-grid">
                        <button type="submit" className="btn">
                          Aceptar
                        </button>
                      </div>
                    </div>
                    <div className="col-12 col-lg-12">
                      <div className="position-relative border-bottom my-3">
                        <div className="position-absolute seperator translate-middle-y">
                          o continúa con
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-12">
                      <div className="social-login d-flex flex-row align-items-center justify-content-center gap-2 my-2">
                        <GoogleOAuthProvider clientId="232538241185-t0tufeaud0k5vup63mfh5eocet5t7gtf.apps.googleusercontent.com">
                          <GoogleLogin
                            onSuccess={handleGoogleLoginSuccess}
                            onError={handleGoogleLoginError}
                          />
                        </GoogleOAuthProvider>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="my-5">
          <div className="container">
            <div className="d-flex align-items-center gap-4 fs-5 justify-content-center social-login-footer">
              <a href="#"><ion-icon name="logo-twitter"></ion-icon></a>
              <a href="#"><ion-icon name="logo-linkedin"></ion-icon></a>
              <a href="#"><ion-icon name="logo-github"></ion-icon></a>
              <a href="#"><ion-icon name="logo-facebook"></ion-icon></a>
              <a href="#"><ion-icon name="logo-pinterest"></ion-icon></a>
            </div>
          </div>
        </div>
        <footer className="footerLog">
          <div className="sgvFooterLog">
            <SvgLogoIcon />
          </div>
          <p>&copy; 2024 Aura. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
