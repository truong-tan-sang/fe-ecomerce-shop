Để triển khai thành công lên Railway và cho phép frontend kết nối đến cả hai gateway **Chat** (port 80) và **Notification** (port 81), bạn cần thay đổi kiến trúc backend vì Railway chỉ cho phép public **một cổng duy nhất** cho mỗi service.

Dưới đây là hướng dẫn chi tiết từng bước để điều chỉnh code NestJS của bạn và sau đó test kết nối từ frontend.

---

## 🧠 Tại sao cần thay đổi?

- Railway tự động gán biến môi trường `PORT` (thường là `8080` hoặc một cổng động) và chỉ route traffic từ internet đến **đúng một cổng đó**.
- Hai gateway của bạn hiện đang cố gắng mở port `80` và `81` riêng biệt. Điều này không hoạt động trên Railway vì các cổng đó không được public.
- Giải pháp: **Gộp cả hai WebSocket server vào cùng một HTTP server, sử dụng namespace để phân biệt logic**.

---

## 🛠️ Bước 1: Sửa code NestJS để dùng chung một cổng

### 1.1. Cập nhật `main.ts`

Đảm bảo ứng dụng NestJS lắng nghe trên `process.env.PORT` (Railway sẽ inject biến này). Thông thường `main.ts` đã làm điều này:

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ... các middleware, pipes, v.v.
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
```

### 1.2. Sửa decorator `@WebSocketGateway` trong cả hai gateway

Thay vì chỉ định port cụ thể, hãy **bỏ port** hoặc dùng chung port của ứng dụng. NestJS sẽ tự động gắn WebSocket server vào HTTP server hiện có khi bạn không chỉ định port.

#### **ChatGateway** (`chat.gateway.ts`)

```typescript
// Sửa từ @WebSocketGateway(80, { cors: { origin: '*' } })
@WebSocketGateway({ 
  namespace: 'chat',           // Thêm namespace
  cors: { origin: '*' } 
})
export class ChatGateway implements ... {
  // ...
}
```

#### **NotificationGateway** (`notification.gateway.ts`)

```typescript
// Sửa từ @WebSocketGateway(81, { cors: { origin: '*' } })
@WebSocketGateway({ 
  namespace: 'notification',   // Thêm namespace
  cors: { origin: '*' } 
})
export class NotificationGateway implements ... {
  // ...
}
```

> **Lưu ý quan trọng**: Việc sử dụng namespace sẽ làm thay đổi cách frontend kết nối. Xem phần test bên dưới.

---

## 🧪 Bước 2: Test kết nối từ frontend (sau khi deploy lên Railway)

Sau khi bạn push code mới lên Railway và deploy thành công, frontend sẽ kết nối như sau:

### 2.1. URL backend trên Railway

Giả sử Railway cấp cho bạn domain: `https://your-app.up.railway.app`

### 2.2. Frontend code kết nối Socket.IO

#### Kết nối đến **Chat Gateway** (namespace `/chat`)

```javascript
import io from 'socket.io-client';
const socketChat = io('https://your-app.up.railway.app/chat', {
  transports: ['websocket'], // khuyến nghị dùng websocket transport
  auth: {
    token: 'your_jwt_token_here'
  }
});

socketChat.on('connect', () => {
  console.log('Connected to Chat Gateway');
  // Gửi sự kiện, ví dụ: joinPublicRoom, msgToRoomServer...
});

socketChat.on('msgToRoomClient', (data) => {
  console.log('Received chat message:', data);
});
```

#### Kết nối đến **Notification Gateway** (namespace `/notification`)

```javascript
const socketNotif = io('https://your-app.up.railway.app/notification', {
  transports: ['websocket'],
  auth: {
    token: 'your_jwt_token_here'
  }
});

socketNotif.on('connect', () => {
  console.log('Connected to Notification Gateway');
  // Gửi sự kiện, ví dụ: sendPersonalNotificationToUser...
});

socketNotif.on('personalNotificationToClient', (data) => {
  console.log('Received personal notification:', data);
});

socketNotif.on('shopNotificationToClient', (data) => {
  console.log('Received shop notification:', data);
});
```

### 2.3. Xác thực token

Trong code gateway của bạn đã có middleware xác thực JWT. Frontend cần gửi token qua:

- `auth.token` (như ví dụ trên) hoặc
- Header `Authorization: Bearer <token>`

Cả hai cách đều được hỗ trợ vì middleware của bạn kiểm tra cả `socket.handshake.auth.token` và `socket.handshake.headers.authorization`.

---

## 🧰 Bước 3: Kiểm tra bằng công cụ test (không cần frontend)

### 3.1. Sử dụng **Socket.IO Test Client** (ứng dụng desktop)

1. Tải [Socket.IO Test Client](https://socket.io/blog/socket-io-test-client/) cho hệ điều hành của bạn.
2. Nhập URL: `https://your-app.up.railway.app`
3. Chọn namespace: `/chat` hoặc `/notification`
4. Thêm auth token trong tab "Auth" (chọn "Token" và nhập JWT của bạn).
5. Nhấn **Connect**.
6. Bạn có thể gửi và nhận sự kiện để kiểm tra.

### 3.2. Dùng **Postman** (hỗ trợ Socket.IO từ phiên bản mới)

- Tạo request mới, chọn **Socket.IO**.
- Nhập URL: `https://your-app.up.railway.app`
- Trong mục "Options", thêm `path` và `namespace` nếu cần (thường namespace được tự động thêm vào URL).
- Thêm token vào "Auth" hoặc "Headers".
- Kết nối và gửi sự kiện.

---

## 📦 Bước 4: Cập nhật Dockerfile và docker-compose (nếu cần)

- **Dockerfile**: Không cần thay đổi vì ứng dụng sẽ dùng `process.env.PORT`.
- **docker-compose.yml**: Chỉ dùng cho local development. Đảm bảo service `app` expose đúng port mà bạn muốn map ra ngoài (ví dụ `4000:4000`). Các port `80` và `81` không cần expose nữa vì tất cả đều chạy trên cùng một cổng (ví dụ `4000`).

---

## ✅ Kiểm tra logs trên Railway

Sau khi deploy, vào dashboard Railway, xem logs của service để đảm bảo gateway khởi tạo thành công:

```
[Nest] 1  - 04/20/2026, 7:23:57 AM     LOG [ChatGateway] chat Init chat gateway
[Nest] 1  - 04/20/2026, 7:23:57 AM     LOG [NotificationGateway] notification Init notification gateway
```

Nếu có lỗi về `DATABASE_URL` hoặc biến môi trường khác, hãy thêm chúng vào phần **Variables** của service trên Railway.

---

## 🎯 Tóm tắt các thay đổi cần thực hiện

| Thành phần | Trước | Sau |
|------------|-------|-----|
| **ChatGateway** | `@WebSocketGateway(80, {...})` | `@WebSocketGateway({ namespace: 'chat', cors: {...} })` |
| **NotificationGateway** | `@WebSocketGateway(81, {...})` | `@WebSocketGateway({ namespace: 'notification', cors: {...} })` |
| **Frontend kết nối** | `io('http://...:80')` và `io('http://...:81')` | `io('https://your-app.up.railway.app/chat')` và `io('https://your-app.up.railway.app/notification')` |
| **Port trong Docker** | Expose 80, 81, 4000 | Chỉ cần expose cổng ứng dụng chính (do `PORT` env quy định) |

---

Hy vọng hướng dẫn này giúp bạn điều chỉnh thành công và test được cả hai gateway trên Railway. Nếu gặp khó khăn gì trong quá trình triển khai, hãy cho tôi biết thêm chi tiết để hỗ trợ nhé!