import {
  handleAuth,
  handleLogin,
  handleReLogin,
  handleRegister,
  handleLogout,
} from "./handlers/authHandlers";

import {
  handleSendChat,
  handleGetChatHistory,
  handleRecallMessage,
  handleEditMessage,
  handleMessageStatus,
  handleReactMessage,
  handleTyping,
} from "./handlers/chatHandlers";

import {
  handleCreateRoom,
  handleJoinRoom,
  handleAddUserToRoom,
  handleAddedToRoom,
  handleGetRoomMembers,
  handleRenameRoom,
  handleRoomRenamed,
  handleLeaveRoom,
  handleRoomMemberLeft,
  handleRoomRoleUpdated,
  handleRemoveRoomMember,
  handleRoomMemberRemoved,
  handleRemovedFromRoom,
  handleRoomOwnerChanged,
} from "./handlers/roomHandlers";

import {
  handleGetUserList,
  handleCheckUserOnline,
  handleCheckUserExist,
  handleGetProfile,
  handleUpdateProfile,
  handleProfileUpdated,
} from "./handlers/userHandlers";

import { handleCallSignal } from "./handlers/callHandlers";

import { setActiveChat, clearMessages } from "../state/chat/chatSlice";

export const handleSocketMessage = (
  response,
  dispatch,
  socketActions,
  socketRef,
  getState,
) => {
  console.log(
    "[Socket Handler] Handler được gọi với event:",
    response?.event,
    "| Status:",
    response?.status,
  );

  if (!response) {
    console.warn("[Socket Handler] Response is null or undefined");
    return;
  }

  if (!response.event) {
    if (response.action === "error") {
      console.error("[Socket Error]", response.data);
      return;
    }

    console.warn("[Socket Handler] Response không có field event:", response);
    return;
  }

  switch (response.event) {
    case "AUTH":
      handleAuth(response, dispatch);
      break;

    case "LOGIN":
      handleLogin(response, dispatch);
      break;

    case "RE_LOGIN":
      handleReLogin(response, dispatch);
      break;

    case "REGISTER":
      handleRegister(response, dispatch);
      break;

    case "LOGOUT":
      handleLogout(response, dispatch);
      break;

    case "SEND_CHAT":
      handleSendChat(response, dispatch, socketActions, socketRef);
      break;

    case "RECALL_MESSAGE":
      handleRecallMessage(response, dispatch, socketActions, socketRef);
      break;

    case "EDIT_MESSAGE":
      handleEditMessage(response, dispatch, socketActions, socketRef);
      break;

    case "MESSAGE_STATUS":
    case "MARK_READ":
      handleMessageStatus(response, dispatch);
      break;

    case "TYPING":
    case "STOP_TYPING":
      handleTyping(response, dispatch, getState);
      break;

    case "GET_PEOPLE_CHAT_MES":
    case "GET_ROOM_CHAT_MES":
      handleGetChatHistory(response, dispatch, getState);
      break;

    case "GET_USER_LIST":
      handleGetUserList(response, dispatch);
      break;

    case "CHECK_USER_ONLINE":
      handleCheckUserOnline(response, dispatch);
      break;

    case "CHECK_USER_EXIST":
      handleCheckUserExist(response, dispatch);
      break;

    case "GET_PROFILE":
      handleGetProfile(response, dispatch);
      break;

    case "UPDATE_PROFILE":
      handleUpdateProfile(response, dispatch);
      socketActions.getUserList(socketRef);
      break;

    case "PROFILE_UPDATED":
      handleProfileUpdated(response, dispatch);
      socketActions.getUserList(socketRef);
      break;

    case "CALL_INVITE":
    case "CALL_INVITE_SENT":
    case "CALL_ACCEPT":
    case "CALL_ACCEPTED":
    case "CALL_REJECT":
    case "CALL_REJECTED":
    case "CALL_CANCEL":
    case "CALL_CANCELED":
    case "CALL_END":
    case "CALL_ENDED":
    case "WEBRTC_OFFER":
    case "WEBRTC_ANSWER":
    case "WEBRTC_ICE_CANDIDATE":
      handleCallSignal(response);
      break;

    case "CREATE_ROOM":
      handleCreateRoom(response, dispatch, socketActions, socketRef, getState);
      break;

    case "JOIN_ROOM":
      handleJoinRoom(response, dispatch);
      break;

    case "ADD_USER_TO_ROOM":
      handleAddUserToRoom(response, dispatch, socketActions, socketRef);
      break;

    case "ADDED_TO_ROOM":
      handleAddedToRoom(response, dispatch, socketActions, socketRef);
      break;

    case "GET_ROOM_MEMBERS":
      handleGetRoomMembers(response, dispatch);
      break;
case "SET_ROOM_DEPUTY":
case "REMOVE_ROOM_DEPUTY":
case "ROOM_ROLE_UPDATED":
  handleRoomRoleUpdated(response, dispatch, socketActions, socketRef);
  break;

case "REMOVE_ROOM_MEMBER":
  handleRemoveRoomMember(response, dispatch, socketActions, socketRef);
  break;

case "ROOM_MEMBER_REMOVED":
  handleRoomMemberRemoved(response, dispatch, socketActions, socketRef);
  break;

case "ROOM_MEMBER_REMOVED_FROM_ROOM":
  handleRemovedFromRoom(response, dispatch, socketActions, socketRef, getState);
  break;

case "ROOM_OWNER_CHANGED":
  handleRoomOwnerChanged(response, dispatch, socketActions, socketRef);
  break;
    case "RENAME_ROOM":
      handleRenameRoom(response, dispatch, socketActions, socketRef, getState);
      break;

    case "ROOM_RENAMED":
      handleRoomRenamed(response, dispatch, socketActions, socketRef, getState);
      break;

    case "LEAVE_ROOM":
      handleLeaveRoom(response, dispatch, socketActions, socketRef);
      break;

    case "ROOM_MEMBER_LEFT":
      handleRoomMemberLeft(response, dispatch);
      break;
    case "REACT_MESSAGE":
      handleReactMessage(response, dispatch);
      break;
      case "REMOVE_CONTACT":
case "CONTACT_REMOVED":
    socketActions.getUserList(socketRef);

    {
        const activeChat = getState().chat.activeChat;
        const data = response.data || {};

        const currentUser =
            localStorage.getItem("user_name") ||
            sessionStorage.getItem("user_name");

        const otherUser =
            data.fromUsername === currentUser
                ? data.toUsername
                : data.fromUsername;

        if (activeChat?.name === otherUser) {
            dispatch(setActiveChat(null));
            dispatch(clearMessages());
        }
    }

    break;

    default:
      console.warn("Unknown event:", response.event);
      break;
  }
};
