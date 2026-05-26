import React, { useState, useEffect } from 'react';
import RoomCard from './RoomCard.jsx';
import Button from '../../../../shared/components/Button';
import colors from '../../../../shared/constants/colors';
import styles from '../../pages/ChatPage.module.css';

const RoomList = ({ rooms, onSelect, searchQuery, onContact, contactError }) => {
	// Kiểm tra xem có search query và không có khớp chính xác không
	const hasExactMatch = searchQuery && rooms.some(room =>
		room.name.toLowerCase() === searchQuery.toLowerCase().trim()
	);
	const shouldShowContactButton = searchQuery && searchQuery.trim().length > 0 && !hasExactMatch;
	const [showError, setShowError] = useState(false);

	// Hiển thị lỗi khi có contactError và tự ẩn sau 3 giây
	useEffect(() => {
		if (contactError) {
			setShowError(true);
			const timer = setTimeout(() => {
				setShowError(false);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [contactError]);

	return (
		<div
			className={styles['room-list-scrollable']}
			style={{
				flex: 1,
				minHeight: 0,
				overflowY: 'auto',
				overflowX: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				paddingBottom: 10,
				width: '100%'
			}}
		>
			{rooms.map(r => {
				const { key, ...roomProps } = r;
				return (
					<RoomCard
						key={key ?? `${r.type}:${r.name}`}
						{...roomProps}
						transparent={true}
						onClick={() => {
							console.log('Room clicked:', r);
							onSelect?.(r);
						}}
					/>
				);
			})}
			{shouldShowContactButton && (
				<div style={{
					padding: '16px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 16,
					flexShrink: 0
				}}>
					{showError && contactError && (
						<div style={{
							fontSize: 15,
							color: colors.primaryText,
							textAlign: 'center',
							fontWeight: 500,
							padding: '8px 16px'
						}}>
							{contactError}
						</div>
					)}
					<Button
						onClick={() => onContact?.(searchQuery.trim())}
						style={{
							width: 'auto',
							minWidth: '120px',
							padding: '10px 24px',
							backgroundColor: colors.primaryButton,
							borderRadius: 8,
							boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
						}}
					>
						Liên hệ
					</Button>
				</div>
			)}
		</div>
	);
};

export default RoomList;