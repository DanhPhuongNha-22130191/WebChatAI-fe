import { useState, useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../../../app/providers/useSocket.js";
import { useApi } from "../../../app/providers/useApi.js";
import { setActiveChat, setPendingConversations } from "../../../state/chat/chatSlice.js";
import { PresenceCache } from "../utils/presenceCache.js";

export function useChatSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'group'
  const { actions, isReady } = useSocket();
  const { actions: apiActions } = useApi();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.auth.user);
  const people = useSelector((s) => s.chat.people);
  const activeChat = useSelector((s) => s.chat.activeChat);
  const onlineStatus = useSelector((s) => s.chat.onlineStatus);

  // Auto-fetch list sau khi socket ready + đã login/relogin
  useEffect(() => {
    const hasUser = user && (user.user || user.name || user.username);
    if (isReady && hasUser) {
      actions.getUserList();

      const username = user.user || user.username || user.name || localStorage.getItem('user_name');
      if (username) {
        apiActions.getIncomingPendingConversations(username)
          .then(data => {
            const pendingList = data
              .filter(item => item.status === 'PENDING')
              .map(item => ({
                username: item.username,
                name: item.username,
                status: item.status,
                createdAt: item.createdAt,
              }));
            dispatch(setPendingConversations(pendingList));
          })
          .catch(err => {
            console.error('Failed to load pending conversations:', err);
          });
      }
    }
  }, [isReady, user, actions, apiActions, dispatch]);

  // Effect: Tự động check online định kỳ (Sử dụng Global Cache để chặn spam)
  useEffect(() => {
    // Hàm thực hiện check logic
    const performCheck = () => {
        if (!isReady || !people || people.length === 0) return;

        const currentUserName = user?.user || user?.username || user?.name || localStorage.getItem('user_name');
        
        const usersToCheck = people
          .filter(p => p.type === 0 && p.name !== currentUserName)
          .map(p => p.name)
          .filter(name => PresenceCache.shouldCheck(name));

        if (usersToCheck.length === 0) return;
        console.log(`[useChatSidebar] Kiểm tra online cho người dùng:`, usersToCheck);

        // Gửi lần lượt với tốc độ an toàn (200ms)
        usersToCheck.forEach((username, index) => {

          PresenceCache.markAsChecked(username);

          setTimeout(() => {
            if (isReady) {
              actions.checkOnline(username);
            }
          }, index * 200); 
        });
    };
    // 1. Thực hiện check ngay khi effect này được kích hoạt
    performCheck();

    const intervalId = setInterval(performCheck, 2 * 60 * 1000); // 2 phút

    return () => clearInterval(intervalId);
  }, [isReady, people, user, actions]);

  const title = useMemo(() => {
    const fromRedux = user?.name || user?.user || user?.username;
    return fromRedux || localStorage.getItem("user_name") || "Tên người dùng";
  }, [user]);

  // Format thời gian hiển thị: "12:00", "Hôm qua", "01/01/2024"
  const formatLastMessageTime = (timeStr) => {
    if (!timeStr) return "";

    try {
      const date = new Date(timeStr);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const diffDays = Math.floor((today - messageDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Hôm nay: hiển thị giờ
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        // Hôm qua
        return "Hôm qua";
      } else if (diffDays < 7) {
        // Trong tuần: hiển thị thứ
        return date.toLocaleDateString('vi-VN', { weekday: 'short' });
      } else {
        // Quá 1 tuần: hiển thị ngày/tháng/năm
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    } catch {
      return "";
    }
  };

  const rooms = useMemo(() => {
    let list = (people ?? []).map((x) => {
      const messageText = x.lastMessage || '';
      const timeText = formatLastMessageTime(x.actionTime);
      const lastMessageDisplay = messageText && timeText
        ? `${messageText} • ${timeText}`
        : messageText || timeText || '';

      const isSelf = x.type === 0 && x.name === title;

      return {
        key: `${x.type}:${x.name}`,
        name: isSelf ? "Lưu trữ" : x.name,
        type: x.type, // 0 people, 1 group
        badge: isSelf ? "Cloud" : (x.type === 1 ? "Group" : "People"),
        lastMessage: lastMessageDisplay,
        active: activeChat?.name === x.name && activeChat?.type === x.type,
        isOnline: x.type === 1 ? undefined : onlineStatus[x.name], // Chỉ check online cho user
      };
    });

    // 1. Lọc theo tab
    if (activeTab === 'group') {
      list = list.filter(room => room.type === 1 || room.type === 'group' || room.type === 'room');
    }

    // 2. Lọc theo search query
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(room =>
      room.name.toLowerCase().includes(query)
    );
  }, [people, activeChat, onlineStatus, title, searchQuery, activeTab]);

  const selectRoom = useCallback(
    (r) => {
      console.log("Selecting room:", r);
      dispatch(setActiveChat({ name: r.name, type: r.type }));
    },
    [dispatch]
  );

  const refreshList = useCallback(() => {
    if (isReady) actions.getUserList();
  }, [isReady, actions]);

  return {
    isReady,
    title,
    rooms,
    activeChat,
    selectRoom,
    refreshList,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab
  };
}


