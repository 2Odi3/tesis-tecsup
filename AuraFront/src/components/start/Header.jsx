import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate(); 

    const welcome = () => {
        navigate('/');
    }

    return (
        <header className='header'>
            <div className="flex items-center gap-4">
                <h2 onClick={welcome}>Aura</h2>
            </div>
        </header>
    );

}

export default Header;