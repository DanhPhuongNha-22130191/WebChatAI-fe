import React from 'react';
import colors from '../../../../shared/constants/colors.js';
import { getAvatarUrl } from '../../../../shared/utils/avatarUtils.js';

const ChatHeader = ({ name, isOnline = true, isGroup = false, onCallClick, onMenuClick }) => (
	<div style={{
		padding: 16,
		backgroundColor: colors.chatHeaderBackground,
		color: colors.normalText,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		height: 77,
		boxSizing: 'border-box'
	}}>
		<div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
			<div style={{ position: 'relative' }}>
				<div style={{
					width: 45,
					height: 45,
					borderRadius: '50%',
					backgroundColor: '#000000ff',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					overflow: 'hidden',
					border: '2px solid #fff'
				}}>
					<img
						src={getAvatarUrl(name, 128)}
						alt={name}
						style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					/>
				</div>
				{!isGroup && (
					<div style={{
						position: 'absolute',
						bottom: 2,
						right: 2,
						width: 12,
						height: 12,
						borderRadius: '50%',
						backgroundColor: isOnline ? '#00FF00' : '#808080',
						border: '2px solid #fff'
					}} />
				)}
			</div>
			<strong style={{ fontSize: 24, color: colors.normalText }}>{name}</strong>
		</div>

		<div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
			{/* Nút gọi điện */}
			<button onClick={onCallClick} style={{
				background: 'transparent',
				border: 'none',
				cursor: 'pointer',
				padding: 8,
				display: 'flex',
				alignItems: 'center',
				color: colors.normalText
			}}>
				<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
				</svg>
			</button>

			{/* Nút menu 3 chấm */}
			<button
				onClick={onMenuClick}
				style={{
					background: 'transparent',
					border: 'none',
					cursor: 'pointer',
					padding: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: colors.normalText,
					width: 40,
					height: 40,
					borderRadius: '50%',
					transition: 'background-color 0.2s'
				}}
				onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gradientStart}
				onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
			>
				<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
					<circle cx="12" cy="5" r="2" />
					<circle cx="12" cy="12" r="2" />
					<circle cx="12" cy="19" r="2" />
				</svg>
			</button>
		</div>
	</div>
);

export default ChatHeader;