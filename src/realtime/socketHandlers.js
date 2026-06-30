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
} from "./handlers/roomHandlers";

import {
  handleGetUserList,
  handleCheckUserOnline,
  handleCheckUserExist,
} from "./handlers/userHandlers";

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

    default:
      console.warn("Unknown event:", response.event);
      break;
  }
};
