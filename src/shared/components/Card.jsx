import React from 'react';
import colors from "../constants/colors.js";

const Card = ({ children, active, onClick, style = {}, transparent = false }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const getBackgroundColor = () => {
        if (active) return colors.gradientStart;
        if (transparent) {
            return isHovered ? 'rgba(255, 255, 255, 0.2)' : 'transparent';
        }
        return isHovered ? '#FFE5F0' : '#FFFFFF';
    };

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                padding: 12,
                borderRadius: 12,
                backgroundColor: getBackgroundColor(),
                color: '#000000',
                border: `1px solid ${transparent ? 'rgba(255, 255, 255, 0.2)' : colors.cardBorderLight}`,
                boxShadow: colors.cardShadow && !transparent ? `0 2px 4px ${colors.cardShadow}` : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s, border-color 0.2s',
                position: 'relative',
                zIndex: 1,
                ...style
            }}
        >
            {children}
        </div>
    );
};

export default Card;
