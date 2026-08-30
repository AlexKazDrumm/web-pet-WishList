import React, { useState } from 'react';
import styles from './NavLink.module.css'

const NavLink = ({ iconWhite, iconBlue, label, onClick, isActive }) => {
    const [isHovered, setIsHovered] = useState(false);

    const determineIconColor = () => {
        if (isHovered || isActive) return iconWhite;
        return iconBlue;
    }

    return (
        <div 
            className={isActive ? `${styles.link} ${styles.active}` : styles.link}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <img 
                src={determineIconColor()} 
                style={{ marginRight: '10px' }}
            />
            {label}
        </div>
    );
}

export default NavLink;