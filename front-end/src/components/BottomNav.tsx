import { NavLink } from "react-router-dom";
import { FiHome, FiMessageCircle, FiBell, FiCoffee } from "react-icons/fi";

const BottomNav: React.FC = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className="bottom-nav-item">
        <FiHome />
        <span>Home</span>
      </NavLink>
      <NavLink to="/chats" className="bottom-nav-item">
        <FiMessageCircle />
        <span>Chats</span>
      </NavLink>
      <NavLink to="/notifications" className="bottom-nav-item">
        <FiBell />
        <span>Notifications</span>
      </NavLink>
      <NavLink to="/cafes" className="bottom-nav-item">
        <FiCoffee />
        <span>Cafés</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
