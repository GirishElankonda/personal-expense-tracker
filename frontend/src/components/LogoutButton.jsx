import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <button className="secondary-btn full-width" onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;
