import React from 'react';
import colors from "../constants/colors.js";

const Button = ({ children, disabled, onClick, style = {} }) => {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			style={{
				width: '100%',
				padding: '12px 0',
				backgroundColor: disabled
					? colors.disabledButton
					: colors.primaryButton,
				color: '#fff',
				border: 'none',
				borderRadius: 8,
				fontSize: 16,
				fontWeight: 600,
				cursor: disabled ? 'not-allowed' : 'pointer',
				...style
			}}
		>
			{children}
		</button>
	);
};

export default Button;