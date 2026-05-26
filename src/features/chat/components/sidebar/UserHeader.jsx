import React from 'react';
import colors from '../../../../shared/constants/colors.js';
import Button from '../../../../shared/components/Button';

const UserHeader = ({ name, onAdd, onContactRequests }) => (
	<div style={{
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		color: colors.primaryText,
		fontWeight: 700,
		flexShrink: 0 
	}}>
		<span>{name}</span>
		<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
			{onContactRequests && (
				<Button
					onClick={onContactRequests}
					style={{
						width: 'auto',
						minWidth: '120px',
						padding: '8px 16px',
						backgroundColor: colors.primaryButton,
						borderRadius: 8,
						fontSize: 14,
						fontWeight: 600
					}}
				>
					Yêu cầu liên hệ
				</Button>
			)}
		<button onClick={onAdd} style={{
			borderRadius: '50%',
			border: `1px solid ${colors.cardBorder}`,
			width: 28,
			height: 28,
				minWidth: 28,
				minHeight: 28,
				padding: 0,
				margin: 0,
			cursor: 'pointer',
				background: 'transparent',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				color: colors.primaryText,
				fontSize: 18,
				lineHeight: 1,
				aspectRatio: '1 / 1'
		}}>+</button>
		</div>
	</div>
);

export default UserHeader;