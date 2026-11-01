# Taskflow — To-Do Board App

Ứng dụng quản lý công việc dạng board: các cột Today / Upcoming / No date / Done, kéo thả task giữa các cột, nhóm task theo project, giao diện tối (dark mode) có thể chuyển sang sáng. Frontend React + Redux, backend Express + SQLite, đăng nhập bằng JWT.

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
5. Bấm **Explore the demo workspace** (nút mặt trời ở góc trên để chuyển giao diện sáng), hoặc đăng ký tài khoản riêng.

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
- Mỗi tài khoản có task và project riêng; user khác không xem/sửa được.
- **Board** dạng cột: Today (gồm cả việc quá hạn) · Upcoming · No date · Done.
- **Kéo thả** task giữa các cột: thả vào Today → hạn hôm nay; Upcoming → hạn ngày mai (nếu chưa có ngày tương lai); No date → bỏ hạn; Done → hoàn thành.
- Thêm/sửa/xóa task: tiêu đề, mô tả, hạn, priority 1–4, project. Tick để hoàn thành hoặc mở lại.
- **Project đủ CRUD**: thêm, xem board riêng của project, **đổi tên/đổi màu**, xóa (task của project bị xóa chuyển về Inbox).
- Trang Inbox (task chưa có project), Upcoming (nhóm theo ngày), Completed, Search.
- Tìm kiếm theo tên/mô tả (Ctrl+K / Cmd+K), lọc priority, sắp xếp theo ngày/priority/tên.
- **Dark mode / light mode**: nút mặt trời/mặt trăng ở thanh trên cùng và trang đăng nhập; lựa chọn được nhớ sau khi tải lại trang.
- SQLite lưu vào `data/tasks.db`; tắt app hoặc F5 vẫn còn dữ liệu.
- Responsive: trên điện thoại thanh menu và ô tìm kiếm tự xuống dòng, các cột xếp dọc.

## Đối chiếu yêu cầu môn học

| Yêu cầu | Nơi sử dụng |
| --- | --- |
| Vite | vite.config.js, scripts dev/build |
| React mới nhất (19.3) | package.json / package-lock.json |
| Thư viện UI | React Bootstrap: Modal, Form, Button, Alert, Spinner, Dropdown, ToggleButtonGroup, Toast; dark mode dùng color mode `data-bs-theme` của Bootstrap 5.3 |
| React Router mới nhất (v8, package `react-router`) | src/main.jsx: BrowserRouter; src/App.jsx: Routes, Route lồng nhau, Navigate; Outlet + useOutletContext, NavLink, useParams |
| Axios gọi HTTP API | src/api.js (instance + interceptor), được gọi trong các thunk ở src/store/workspaceSlice.js |
| API URL trong .env với VITE_API_URL | .env, import.meta.env.VITE_API_URL |
| Redux quản lý state dùng chung | src/store: `workspaceSlice` (user, task, project + createAsyncThunk cho mọi thao tác API) và `uiSlice` (theme, từ khóa tìm kiếm, lọc, sắp xếp) |
| RESTful API | server/index.js: GET/POST/PATCH/DELETE `/api/tasks`, GET/POST/PATCH/DELETE `/api/projects`, `/api/auth` |
| Database kết nối backend | node:sqlite, data/tasks.db |
| JWT frontend và backend | jsonwebtoken ở server, middleware bảo vệ /api, token gửi qua Axios interceptor |

Phiên bản được ghi rõ trong package.json và khóa trong package-lock.json. Dùng `npm ci` để cài đúng bản đã kiểm tra.

## Cấu trúc code

```
src/
  main.jsx              Provider (Redux) + BrowserRouter
  App.jsx               Khai báo route, áp dụng theme
  api.js                Axios instance + interceptor gửi token
  store/
    index.js            configureStore
    workspaceSlice.js   user, tasks, projects + async thunks gọi API
    uiSlice.js          theme, search, filter, sort
  utils/tasks.js        xử lý ngày, lọc/sắp xếp, định nghĩa các cột board
  pages/
    LoginPage.jsx       đăng nhập / đăng ký
    Workspace.jsx       khung chung: TopBar, modal, toast (Outlet)
    BoardPage.jsx       board chính và board của từng project
    ListPage.jsx        Inbox, Upcoming, Completed, Search
  components/
    TopBar.jsx, ThemeToggle.jsx, PageHeader.jsx, ProjectBar.jsx
    BoardColumn.jsx, TaskCard.jsx, TaskGrid.jsx
    TaskEditor.jsx, ProjectEditor.jsx, ConfirmDialog.jsx
  styles.css            biến màu cho dark/light và giao diện
server/index.js         Express API, JWT, SQLite, dữ liệu mẫu
tests/                  api.test.js (Node test), ui.spec.js (Playwright)
```

ES6 dùng trong bài: import/export, const/let, arrow functions, destructuring, spread operator, template literals, map/filter, async/await. `useState` giữ dữ liệu form; Redux giữ dữ liệu chia sẻ giữa các trang; `useEffect` tải dữ liệu và gắn phím tắt.

## Kiểm tra

```powershell
npm run build
npm test
```

Test API kiểm tra đăng nhập, JWT, phân quyền tài khoản, CRUD task và project (gồm đổi tên project) và dữ liệu còn sau khi restart backend.

Test giao diện (Playwright) có 3 kịch bản: thêm/sửa/kéo thả/hoàn thành/mở lại/xóa task; tạo/đổi tên/xóa project; bật tắt dark mode và chạy trên màn hình điện thoại.

Test giao diện (lần đầu cần tải trình duyệt):

```powershell
npx playwright install chromium
npm run test:e2e
```

Playwright tự khởi động app. Cần cổng 5173/3001 trống trước khi chạy.

## Phạm vi

Không có nhắc việc push/email, task lặp, đồng bộ Google Calendar, cộng tác nhiều người hoặc nhập ngày bằng ngôn ngữ tự nhiên. Phiên bản này tập trung vào chức năng phù hợp bài học. Backend lưu SQLite tại máy đang chạy; không dùng localStorage để thay thế database. Google Fonts có font hệ thống dự phòng nếu không có mạng.
