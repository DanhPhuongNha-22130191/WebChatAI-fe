# Lang-Chat-Be (Pending Conversation & Settings Service)

Dịch vụ Backend quản lý trạng thái chờ kết bạn (Pending List) và cấu hình cuộc trò chuyện (Conversation Settings) cho hệ thống chat. Service này hoạt động độc lập, không yêu cầu xác thực Token (No-Auth), phục vụ như một tầng trung gian lưu trữ trạng thái.

## 1. Pending Conversation APIs
Quản lý luồng gửi lời mời, chấp nhận, và từ chối kết bạn.

### Base URL
`http://localhost:8081/api/chat/pending-conversations`

### 1.1. Create Pending Request (Gửi lời mời)
*   **Method:** `POST`
*   **Endpoint:** `/`
*   **Description:** Tạo yêu cầu kết bạn từ A đến B. Nếu đã tồn tại PENDING, sẽ cập nhật thời gian mới nhất.

```json
// Request Body
{
  "fromUsername": "userA",
  "toUsername": "userB"
}
```

```json
// Response (Success)
{
  "action": "onchat",
  "data": {
    "event": "PENDING_CREATE",
    "payload": {
      "id": 1,
      "fromUsername": "userA",
      "toUsername": "userB",
      "status": "PENDING",
      "createdAt": "2024-01-13T10:00:00Z",
      "updatedAt": "2024-01-13T10:00:00Z"
    }
  }
}
```

### 1.2. Get Incoming Requests (Xem danh sách lời mời)
*   **Method:** `GET`
*   **Endpoint:** `/incoming?username={your_username}`
*   **Description:** Lấy danh sách các lời mời đang chờ (PENDING) gửi đến bạn.

```json
// Response
{
  "action": "onchat",
  "data": {
    "event": "PENDING_INCOMING",
    "payload": [
      {
        "username": "userA",
        "status": "PENDING",
        "createdAt": "2024-01-13T10:00:00Z"
      }
    ]
  }
}
```

### 1.3. Accept Request (Chấp nhận kết bạn)
*   **Method:** `POST`
*   **Endpoint:** `/accept`
*   **Description:** Chuyển trạng thái từ `PENDING` sang `ACCEPTED`.

```json
// Request Body
{
  "fromUsername": "userA",
  "toUsername": "userB"
}
```

```json
// Response
{
  "action": "onchat",
  "data": {
    "event": "PENDING_ACCEPT",
    "payload": null
  }
}
```

### 1.4. Delete/Reject Request (Từ chối/Xóa)
*   **Method:** `POST`
*   **Endpoint:** `/delete`
*   **Description:** Xóa vĩnh viễn (Hard Delete) lời mời khỏi hệ thống.

```json
// Request Body (Giống Accept)
{
  "fromUsername": "userA",
  "toUsername": "userB"
}
```

---


## 2. Conversation Settings APIs (Group/Conversation Theme)
Quản lý cấu hình (Theme) cho Group/Cuộc trò chuyện. Hiện tại hỗ trợ thay đổi màu sắc cho nhóm (cặp đôi).

### Base URL
`http://localhost:8081/api/chat/settings`

### 2.1. Get Theme (Lấy Theme hiện tại)
*   **Method:** `GET`
*   **Endpoint:** `/theme?user1={u1}&user2={u2}`
*   **Description:** Lấy theme màu của cuộc trò chuyện giữa 2 người.
*   **Logic:**
    *   Hệ thống tự động sắp xếp tên user (A-B hay B-A đều ra kết quả giống nhau).
    *   Nếu chưa set theme bao giờ, trả về mặc định `"DEFAULT"`.

```json
// Response (Success)
{
  "action": "onchat",
  "data": {
    "event": "GET_THEME_SUCCESS",
    "data": "OCEAN_BLUE"  // hoặc "DEFAULT"
  }
}
```

### 2.2. Set Theme (Cài đặt Theme)
*   **Method:** `POST`
*   **Endpoint:** `/theme`
*   **Description:** Cập nhật theme cho cuộc trò chuyện.

```json
// Request Body
{
  "userOne": "userA",
  "userTwo": "userB",
  "themeId": "OCEAN_BLUE"
}
```

```json
// Response
{
  "action": "onchat",
  "data": {
    "event": "SET_THEME_SUCCESS",
    "data": "OCEAN_BLUE"
  }
}
```

### 2.3. Get Group Theme (Lấy Theme Nhóm)
*   **Method:** `GET`
*   **Endpoint:** `/group?groupName={name}`
*   **Description:** Lấy thông tin cấu hình theme của nhóm chat. Trả về thông tin chi tiết bao gồm người thay đổi cuối cùng.

```json
// Response (Success)
{
  "action": "onchat",
  "data": {
    "event": "GET_GROUP_THEME_SUCCESS",
    "data": {
      "id": 1,
      "groupName": "DevTeam",
      "themeId": "DARK_MODE",
      "owner": null,
      "lastChangedBy": "userA"
    }
  }
}
```

### 2.4. Set Group Theme (Cài đặt Theme Nhóm)
*   **Method:** `POST`
*   **Endpoint:** `/group`
*   **Description:** Cập nhật theme cho nhóm. Bất kỳ thành viên nào cũng có thể thay đổi (Owner để null). Hệ thống sẽ lưu lại người thực hiện thay đổi cuối cùng.

```json
// Request Body
{
  "groupName": "DevTeam",
  "username": "userA",
  "themeId": "DARK_MODE"
}
```

```json
// Response
{
  "action": "onchat",
  "data": {
    "event": "SET_GROUP_THEME_SUCCESS",
    "data": {
      "id": 1,
      "groupName": "DevTeam",
      "themeId": "DARK_MODE",
      "owner": null,
      "lastChangedBy": "userA"
    }
  }
}
```
