import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/start/Login';
import Home from './components/Home';
import Courses from './components/courses/Courses';
import CourseDetail from './components/courses/CourseDetail';
import Welcome from './components/start/Welcome';
import CourseAsistance from './components/courses/CourseAsistance';
import Schedule from './components/Schedule';
import { checkTokenExpiration, logout } from './hooks/userState';
import Stats from './components/Stats';
import CourseStats from './components/courses/CourseStats';
import Navbar from './components/Navbar';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            try {
                await checkTokenExpiration();
                const token = localStorage.getItem('access_token');
                setIsAuthenticated(!!token);
            } catch (error) {
                console.error('Sesión expirada:', error);
                logout(setIsAuthenticated); // Pasar el callback para actualizar el estado
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        verifySession();

        const handleStorageChange = () => {
            setIsAuthenticated(!!localStorage.getItem('access_token'));
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setIsAuthenticated(!!token);
    }, []);


    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <Router>
            {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}
            <Routes>
                <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Welcome />} />
                <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/" />} />
                <Route path="/cursos" element={isAuthenticated ? <Courses /> : <Navigate to="/" />} />
                <Route path="/curso/:id" element={isAuthenticated ? <CourseDetail /> : <Navigate to="/" />} />
                <Route path="/asistencia/:idCurso/:idProfesor" element={isAuthenticated ? <CourseAsistance /> : <Navigate to="/" />} />
                <Route path="/estadisticas-curso/:idCurso" element={isAuthenticated ? <CourseStats /> : <Navigate to="/" />} />
                <Route path="/stats" element={isAuthenticated ? <Stats /> : <Navigate to="/" />} />
                <Route path="/horario/:id" element={isAuthenticated ? <Schedule /> : <Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
