import React from 'react';
import { useNavigate } from 'react-router-dom';
import SvgLogoIcon from '../SvgLogoIcon';
import Header from './Header';

const Welcome = () => {
    const navigate = useNavigate();

    const logg = () => {
        navigate('/login');
    };

    return (
        <div className="design-root">
            <div className="layout-container">
                <div className="headerWel">
                    <Header />
                </div>

                <div className="main-content">
                    <div className="flex flex-col gap-6">
                        <h1>Aura</h1>
                        <strong>Simplifica el control, mejora la <br /> precisión</strong>
                        <p>Usa la aplicación de Tecsup para tomar asistencia <br /> de una forma más eficiente.</p>
                        <button className='button' onClick={logg}>
                            <span>Acceder</span>
                        </button>
                    </div>

                    <div className="svgBody">
                        <SvgLogoIcon />
                    </div>


                    <footer className="footer">
                        <div className="sgvFooter">
                            <SvgLogoIcon />
                        </div>
                        <p>&copy; 2024 Aura. Todos los derechos reservados.</p>
                    </footer>

                </div>
            </div>

        </div>
    );
}

export default Welcome;
