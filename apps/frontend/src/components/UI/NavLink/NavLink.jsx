import { useState } from 'react';
import styles from './NavLink.module.css';

const NavLink = ({ iconWhite, iconBlue, label, onClick, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);

  const iconSrc = isHovered || isActive ? iconWhite : iconBlue;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      className={isActive ? `${styles.link} ${styles.active}` : styles.link}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
      <img src={iconSrc} alt="" style={{ marginRight: '10px' }} />
      {label}
    </div>
  );
};

export default NavLink;
