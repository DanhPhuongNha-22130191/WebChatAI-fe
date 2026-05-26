import { useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useApi } from '../../../app/providers/useApi';
import { useSocket } from '../../../app/providers/useSocket';
import { createPendingRepository } from '../api/pendingRepository';
import { setPendingConversations, removePendingConversation } from '../../../state/chat/chatSlice';

/**
 * Hook UseCase cho tính năng Pending Conversation
 * Layer: Application
 * Nhiệm vụ: Điều phối (Orchestration) giữa Repository, Redux và Socket
 */
export const usePendingActions = () => {
    const { actions: apiActions } = useApi();
    const { actions: socketActions } = useSocket();
    const dispatch = useDispatch();
    const user = useSelector((s) => s.auth.user);
    const pendingContacts = useSelector((s) => s.chat.pendingConversations);

    // Local state cho flow gửi yêu cầu
    const [showContactRequest, setShowContactRequest] = useState(false);
    const [contactRecipient, setContactRecipient] = useState('');
    const [contactError, setContactError] = useState('');

    // Khởi tạo repository với apiActions từ context
    const repository = useMemo(() => createPendingRepository(apiActions), [apiActions]);

    /**
     * Tải danh sách yêu cầu
     */
    const fetchIncomingRequests = useCallback(async () => {
        const username = user?.user || user?.username || localStorage.getItem('user_name');
        if (!username) return;

        try {
            const cleanData = await repository.getIncomingRequests(username);
            dispatch(setPendingConversations(cleanData));
        } catch (err) {
            console.error('[UseCase] Failed to fetch pending contacts:', err);
            dispatch(setPendingConversations([]));
            throw err;
        }
    }, [repository, user, dispatch]);

    /**
     * Chấp nhận yêu cầu
     */
    const acceptContact = useCallback(async (fromUsername) => {
        try {
            // 1. Gọi Infrastructure (API)
            await repository.acceptRequest(fromUsername);

            // 2. Cập nhật State (Redux)
            dispatch(removePendingConversation({ username: fromUsername }));

            // 3. Giao tiếp Real-time (Socket)
            socketActions.sendChat(fromUsername, "Đã chấp nhận yêu cầu liên hệ", "people");

            // 4. Sync Side Effect: Refresh user list
            // Logic delay này được đóng gói tập trung tại đây
            setTimeout(() => socketActions.getUserList(), 500);
            setTimeout(() => socketActions.getUserList(), 1500);

            return true;
        } catch (err) {
            console.error('[UseCase] Failed to accept contact:', err);
            throw err;
        }
    }, [repository, dispatch, socketActions]);

    /**
     * Từ chối yêu cầu
     */
    const rejectContact = useCallback(async (fromUsername) => {
        try {
            await repository.deleteRequest(fromUsername);
            dispatch(removePendingConversation({ username: fromUsername }));
            return true;
        } catch (err) {
            console.error('[UseCase] Failed to reject contact:', err);
            throw err;
        }
    }, [repository, dispatch]);

    /**
     * Gửi yêu cầu mới
     */
    const sendContactRequest = useCallback(async (recipientName, message) => {
        try {
            await repository.createRequest(recipientName);

            // Socket notification sau khi API thành công
            socketActions.sendChat(recipientName, message, "people");

            // Sync user list
            setTimeout(() => socketActions.getUserList(), 500);
            setTimeout(() => socketActions.getUserList(), 1500);

            setShowContactRequest(false); // Close modal on success
            return true;
        } catch (err) {
            console.error('[UseCase] Failed to send request:', err);
            setContactError('Không thể gửi yêu cầu liên hệ. Vui lòng thử lại.');
            throw err;
        }
    }, [repository, socketActions]);

    /**
     * Handler check user exist trước khi mở modal gửi request
     */
    const handleCheckUserExist = useCallback((username) => {
        if (window.__pendingContactCheck) {
            window.__pendingContactCheck = null;
        }
        setContactError('');
        setContactRecipient(username);

        // Lưu callback vào window để socketHandlers có thể gọi
        window.__pendingContactCheck = {
            username: username,
            onSuccess: () => {
                setShowContactRequest(true);
                setContactError('');
                window.__pendingContactCheck = null;
            },
            onError: () => {
                setContactError('Người dùng không tồn tại');
                window.__pendingContactCheck = null;
            }
        };

        socketActions.checkExist(username);
    }, [socketActions]);

    return {
        pendingContacts,
        fetchIncomingRequests,
        acceptContact,
        rejectContact,
        sendContactRequest,
        // UI State & Actions
        showContactRequest,
        setShowContactRequest,
        contactRecipient,
        contactError,
        setContactError,
        handleCheckUserExist
    };
};
