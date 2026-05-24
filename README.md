# LangChat - SubeoApp (Frontend)

**LangChat - SubeoApp** là ứng dụng nhắn tin trực tuyến thời gian thực (Real-time Web Chat) hiện đại, được xây dựng với kiến trúc hướng sự kiện (Event-driven) qua WebSocket. Dự án tập trung vào trải nghiệm người dùng mượt mà, giao diện đẹp mắt và hiệu suất cao.

---

## Tính năng nổi bật

### Chat Real-time
- **Nhắn tin 1-1 & Nhóm**: Hỗ trợ trao đổi tin nhắn tức thời với cá nhân hoặc trong phòng chat (Room).
- **Lịch sử tin nhắn**: Tải lại lịch sử chat mượt mà với phân trang.
- **Trạng thái Online**: Theo dõi trạng thái hoạt động của bạn bè trong thời gian thực.
- **Phản hồi tức thì**: Tốc độ gửi/nhận tin nhắn cực nhanh nhờ WebSocket.

### Giao diện & Trải nghiệm (UI/UX)
- **Thiết kế hiện đại**: Giao diện đẹp, hiệu ứng nền _Iridescence_ sống động.
- **Theme tùy biến**: Hỗ trợ thay đổi chủ đề (Theme) cho cuộc trò chuyện (Bubble, Gradient, v.v.).
- **Responsive**: Tương thích tốt trên nhiều kích thước màn hình.
- **UX thân thiện**: Từ modal tạo phòng, tìm kiếm bạn bè đến thông báo lỗi đều được chăm chút.

### Đa phương tiện & Tiện ích
- **Gửi Sticker & Emoji**: Tích hợp bộ Sticker vui nhộn và Emoji phong phú.
- **Chia sẻ File**: Hỗ trợ gửi ảnh, video và tệp tin với thanh tiến trình upload.
- **Media Gallery**: Xem lại toàn bộ ảnh/video đã gửi trong kho lưu trữ gọn gàng.
- **Modal xem ảnh/video**: Trình xem media (Lightbox) tích hợp sẵn với các thao tác zoom, tải xuống, copy link.

### Kết nối & Cộng đồng
- **Tìm kiếm người dùng**: Dễ dàng tìm bạn bè qua tên người dùng hoặc email.
- **Yêu cầu liên hệ**: Gửi, nhận và quản lý danh sách lời mời kết bạn.
- **Quản lý phòng chat**: Tạo phòng, thêm thành viên vào nhóm chat dễ dàng.

---

## Công nghệ sử dụng

Dự án được xây dựng trên nền tảng các công nghệ Web hiện đại nhất:

- **Core**: [React 19](https://react.dev/) - Thư viện UI mới nhất.
- **Build Tool**: [Vite 7](https://vitejs.dev/) - Môi trường phát triển siêu tốc.
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) - Quản lý trạng thái ứng dụng tập trung.
- **Routing**: [React Router 7](https://reactrouter.com/) - Điều hướng SPA.
- **Icons**: [Tabler Icons](https://tabler-icons.io/) - Bộ icon nhất quán, đẹp mắt.
- **Styling**: CSS Modules - Scoped CSS, tránh xung đột style.
- **Real-time**: WebSocket (Native) - Giao thức truyền tin thời gian thực.

---

## Cài đặt & Chạy dự án

Đảm bảo bạn đã cài đặt [Node.js](https://nodejs.org/) (khuyến nghị phiên bản LTS v18+).

### 1. Clone dự án
```bash
git clone https://github.com/lang-nguyen/AppChat-FE.git
cd AppChat-FE
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:5173`

### 4. Build cho Production
```bash
npm run build
```

---

## Cấu trúc dự án

Kiến trúc source code được tổ chức theo module chức năng (Feature-based), giúp dễ dàng quản lý, mở rộng và bảo trì.

```text
src/
├── app/                        # Cấu hình & Global Providers
│   ├── providers/              # React Context & Hooks (Socket, API, UI)
│   ├── store.js                # Redux Store Configuration
│   ├── App.jsx                 # Main App Component
│   └── App.css                 # App Styles
│
├── features/                   # Module tính năng chính
│   ├── auth/                   # Module Xác thực
│   │   ├── login/              # Login Screen & Logic
│   │   ├── register/           # Register Screen & Logic
│   │   ├── components/         # Auth-specific UI
│   │   ├── services/           # Auth API Services
│   │   ├── hooks/              # Auth Logic Hooks
│   │   └── pages/              # Auth Pages
│   │
│   ├── chat/                   # Module Chat (Core Feature)
│   │   ├── api/                # Chat API Definitions
│   │   ├── components/         # Chat UI Components (Chatbox, Sidebar, Header...)
│   │   ├── pages/              # Chat Page Screens
│   │   ├── hooks/              # Chat Logic Hooks
│   │   ├── utils/              # Chat Helper Functions
│   │   └── constants/          # Chat Constants
│   │
│   └── test/                   # Test Feature
│
├── realtime/                   # WebSocket Layer
│   ├── handlers/               # Xử lý sự kiện từ Server
│   ├── socketActions.js        # Action gửi lên Server
│   └── socketHandlers.js       # Dispatcher sự kiện
│
├── shared/                     # Tài nguyên dùng chung
│   ├── components/             # UI Kit (Button, Modal, Loading...)
│   ├── utils/                  # Tiện ích chung
│   ├── services/               # Services chung
│   ├── hooks/                  # Hooks chung
│   └── constants/              # Global Constants
│
├── state/                      # Redux Slices
│   ├── auth/                   # Auth State Folder
│   │   └── authSlice.js        # Auth Slice Logic
│   └── chat/                   # Chat State Folder
│       └── chatSlice.js        # Chat Slice Logic
│
├── styles/                     # Global Styles
│   └── theme.css               # Theme Variables
│
├── assets/                     # Static Assets
│   └── react.svg               # Images/Icons
│
├── main.jsx                    # Application Entry Point
└── index.css                   # Root Styles
```

---

## WebSocket API Protocol

Frontend giao tiếp với Backend thông qua kết nối WebSocket (WSS). Mọi gói tin (Packet) gửi đi đều tuân theo định dạng JSON thống nhất.

**WebSocket URL**: `wss://chat.longapp.site/chat/chat`

### Định dạng Request (Client → Server)

```json
{
  "action": "onchat",
  "data": {
    "event": "EVENT_NAME",
    "data": { ...payload }
  }
}
```

### Danh sách Event chính

| Nhóm | Event | Payload (`data.data`) | Mô tả |
|------|-------|-----------------------|-------|
| **Auth** | `REGISTER` | `{ user, pass }` | Đăng ký tài khoản mới. |
| | `LOGIN` | `{ user, pass }` | Đăng nhập hệ thống. |
| | `RE_LOGIN` | `{ user, code }` | Khôi phục phiên làm việc khi mất kết nối. |
| | `LOGOUT` | `{}` | Đăng xuất. |
| **Chat** | `SEND_CHAT` | `{ type, to, mes }` | Gửi tin nhắn (`type`: "room" hoặc "people"). |
| | `GET_PEOPLE_CHAT_MES`| `{ name, page }` | Lấy lịch sử chat cá nhân (phân trang). |
| | `GET_ROOM_CHAT_MES` | `{ name, page }` | Lấy lịch sử chat phòng (phân trang). |
| **Room** | `CREATE_ROOM` | `{ name }` | Tạo phòng chat nhiều người. |
| | `JOIN_ROOM` | `{ name }` | Tham gia vào một phòng chat có sẵn. |
| **User** | `CHECK_USER_EXIST` | `{ user }` | Kiểm tra tên người dùng có tồn tại không. |
| | `CHECK_USER_ONLINE` | `{ user }` | Kiểm tra trạng thái online của người dùng. |

---

## Đóng góp (Contributing)

Mọi đóng góp đều được hoan nghênh! Nếu bạn phát hiện lỗi hoặc muốn cải thiện dự án, vui lòng tạo Pull Request hoặc Issue trên GitHub.
