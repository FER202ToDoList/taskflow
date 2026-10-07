# Taskflow — Todoist-inspired To-Do App

Ứng dụng To-Do đơn giản, lấy cảm hứng từ bố cục Todoist: sidebar màu kem, danh sách công việc, nút Add task màu đỏ và các trang Inbox / Today / Upcoming / Completed. Đây là app độc lập dùng dữ liệu của riêng bạn, không kết nối tài khoản Todoist.

## Chạy trong VS Code trên Windows

1. Cài **Node.js 24 LTS**. Kiểm tra `node -v` (cần v24 trở lên vì backend dùng SQLite tích hợp trong Node).
2. Clone repo (hoặc giải nén), mở thư mục `taskflow` trong VS Code.
3. Mở Terminal ngay thư mục có `package.json` rồi chạy:

```powershell
npm install
copy .env.example .env.local   # macOS/Linux: cp .env.example .env.local
npm run dev
```

Nếu PowerShell chặn npm, dùng `npm.cmd install` và `npm.cmd run dev`.

4. Mở `http://localhost:5173`. Một lệnh dev chạy cả frontend và backend.
5. Bấm **Explore the demo workspace**, hoặc đăng ký tài khoản riêng.

Tài khoản demo: `demo@taskflow.local` / `Demo123!`.

### Biến môi trường

| File | Nội dung | Có lên Git? |
| --- | --- | --- |
| `.env` | `VITE_API_URL=http://localhost:3001/api` (base URL của API cho frontend) | Có — biến `VITE_*` vốn được đóng gói vào code frontend nên không phải bí mật |
| `.env.local` | `PORT`, `JWT_SECRET` cho backend | Không (đã có trong `.gitignore`); tạo từ `.env.example` |

Nếu chưa tạo `.env.local`, backend vẫn chạy được ở chế độ dev với một secret tạm và in cảnh báo. Khi chạy production (`NODE_ENV=production`) bắt buộc phải đặt `JWT_SECRET`.

## Chức năng

- Đăng ký, đăng nhập, đăng xuất; mật khẩu được hash bằng scrypt.
- JWT tạo và kiểm tra bằng thư viện `jsonwebtoken` (HS256, hết hạn sau 1 ngày); Axios tự gửi token trong `Authorization: Bearer`; middleware backend chặn mọi API khi token sai hoặc hết hạn.
- Mỗi tài khoản có danh sách và dự án riêng.
- Thêm/sửa/xóa công việc, mô tả, hạn hoàn thành, priority 1–4, chuyển dự án.
- Tick hoàn thành hoặc mở lại task trong Completed.
- Inbox: công việc chưa gán dự án. Today: việc hôm nay và quá hạn. Upcoming: việc có ngày trong tương lai.
- Tìm kiếm theo tên/mô tả, lọc priority, sắp xếp tên/ưu tiên/ngày.
- Ctrl+K (Windows) hoặc Cmd+K (Mac) mở tìm kiếm.
- Thêm/xóa dự án; xóa dự án chuyển công việc của nó về Inbox.
- SQLite lưu vào `data/tasks.db`; tắt app hoặc F5 vẫn còn dữ liệu.
- Responsive: điện thoại mở sidebar bằng nút menu.

## Đối chiếu yêu cầu môn học

| Yêu cầu | Nơi sử dụng |
| --- | --- |
| Vite | vite.config.js, scripts dev/build |
| React mới nhất (19.3) | package.json / package-lock.json |
| Thư viện UI | React Bootstrap: Modal, Button, Form, Alert, Spinner |
| React Router mới nhất (v8, package `react-router`) | src/main.jsx: BrowserRouter; src/App.jsx: Routes, Route, NavLink, Navigate, useParams |
| Axios gọi HTTP API | src/api.js (instance + interceptor), được gọi trong các thunk ở src/store.js |
| API URL trong .env với VITE_API_URL | .env, import.meta.env.VITE_API_URL |
| Redux quản lý state dùng chung | src/store.js: Redux Toolkit slice + createAsyncThunk cho login/register, tải dữ liệu, thêm/sửa/xóa task và project |
| RESTful API | server/index.js: /api/tasks, /api/projects, /api/auth |
| Database kết nối backend | node:sqlite, data/tasks.db |
| JWT frontend và backend | jsonwebtoken ở server, middleware bảo vệ /api, token gửi qua Axios interceptor |

Phiên bản được ghi rõ trong package.json và khóa trong package-lock.json. Dùng `npm ci` để cài đúng bản đã kiểm tra.

## Cấu trúc code và cách học

- `src/main.jsx`: Provider của Redux và BrowserRouter.
- `src/store.js`: state dùng chung; các thao tác gọi API là async thunk, reducer cập nhật state sau khi API trả về.
- `src/api.js`: Axios instance đọc base URL từ .env, gửi token tự động.
- `src/App.jsx`: trang đăng nhập, sidebar, các trang task, form và modal.
- `src/styles.css`: giao diện và responsive.
- `server/index.js`: Express API, JWT, SQLite, dữ liệu mẫu.

ES6 dùng trong bài: import/export, const/let, arrow functions, destructuring, spread operator, template literals, map/filter, async/await. `useState` giữ dữ liệu form; Redux giữ dữ liệu chia sẻ giữa các trang; `useEffect` tải dữ liệu.

## Kiểm tra

```powershell
npm run build
npm test
```

Test API kiểm tra đăng nhập, JWT, phân quyền tài khoản, CRUD và dữ liệu còn sau khi restart backend.

Test giao diện (lần đầu cần tải trình duyệt):

```powershell
npx playwright install chromium
npm run test:e2e
```

Playwright tự khởi động app. Cần cổng 5173/3001 trống trước khi chạy.

## Phạm vi

Không có nhắc việc push/email, task lặp, đồng bộ Google Calendar, cộng tác nhiều người hoặc nhập ngày bằng ngôn ngữ tự nhiên. Phiên bản này tập trung vào chức năng phù hợp bài học. Backend lưu SQLite tại máy đang chạy; không dùng localStorage để thay thế database. Google Fonts có font hệ thống dự phòng nếu không có mạng.
