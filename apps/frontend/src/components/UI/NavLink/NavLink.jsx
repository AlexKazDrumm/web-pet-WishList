import { useState } from 'react';
import styles from './NavLink.module.css';

const NavLink = ({ iconWhite, iconBlue, label, onClick, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);

  const iconSrc = isHovered || isActive ? iconWhite : iconBlue;

  return (
    <button
      type="button"
      aria-pressed={isActive}
      className={isActive ? `${styles.link} ${styles.active}` : styles.link}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <img src={iconSrc} alt="" style={{ marginRight: '10px' }} />
      {label}
    </button>
  );
};

export default NavLink;
