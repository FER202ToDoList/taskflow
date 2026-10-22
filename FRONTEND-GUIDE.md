# Hướng dẫn frontend Taskflow — FER202

## Kiến thức sử dụng

Frontend giữ React + JavaScript, React Router, React Bootstrap và Axios đang có trong repo; bổ sung Formik + Yup theo bài lab. Component là function, dùng props, useState, useEffect và map/filter/sort. Không dùng TypeScript hay thêm framework giao diện khác.

Redux Toolkit đã có sẵn trong repo và được giữ lại để các trang dùng chung danh sách. Nếu chưa học Redux, đọc nó sau khi hiểu component và Axios: `dispatch` gửi một hành động; `useSelector` lấy state; async thunk gọi API; reducer cập nhật state từ kết quả API. Formik quản lý dữ liệu, lỗi và trạng thái gửi của form; Yup mô tả quy tắc kiểm tra.

## Chạy bài

Cần Node.js 24 trở lên vì backend dùng `node:sqlite`.

```powershell
cd taskflow
npm install
npm run dev
```

Mở http://localhost:5173. Một lệnh chạy cả FE và BE. SQLite tự tạo database, không cần cài SQL Server. Biến `VITE_API_URL` đã có trong `.env`; không đưa JWT_SECRET vào biến `VITE_*`.

Tài khoản demo: `demo@taskflow.local` / `Demo123!`. Đăng ký tài khoản mới để có bộ dữ liệu riêng; backend hiện tự tạo dữ liệu mẫu cho tài khoản mới.

## Chức năng và API thực tế

| Thao tác trên FE                                   | API của BE                         | File xử lý                                          |
| -------------------------------------------------- | ---------------------------------- | --------------------------------------------------- |
| Đăng ký                                            | POST /api/auth/register            | pages/Auth.jsx → store.js: register                 |
| Đăng nhập                                          | POST /api/auth/login               | pages/Auth.jsx → store.js: login                    |
| Khôi phục tài khoản sau F5                         | GET /api/auth/me                   | store.js: loadWorkspace                             |
| Tải công việc và dự án                             | GET /api/tasks, GET /api/projects  | store.js: loadWorkspace                             |
| Thêm công việc                                     | POST /api/tasks                    | components/TaskEditor.jsx → store.js: saveTask      |
| Sửa tiêu đề, mô tả, hạn, mức ưu tiên, chuyển dự án | PATCH /api/tasks/:id               | components/TaskEditor.jsx → store.js: saveTask      |
| Hoàn thành / mở lại                                | PATCH /api/tasks/:id với completed | pages/Workspace.jsx → store.js: toggleTask          |
| Xóa công việc sau xác nhận                         | DELETE /api/tasks/:id              | pages/Workspace.jsx → store.js: deleteTask          |
| Tạo dự án, chọn màu                                | POST /api/projects                 | components/ProjectEditor.jsx → store.js: addProject |
| Xóa dự án sau xác nhận                             | DELETE /api/projects/:id           | pages/Workspace.jsx → store.js: deleteProject       |
| Đăng xuất                                          | Xóa token và state trên FE         | store.js: signedOut                                 |
| Kiểm tra server                                    | GET /api/health                    | Endpoint kỹ thuật, không cần màn thao tác riêng     |

BE chưa có GET chi tiết theo id, nên trang chi tiết lấy task từ danh sách đã tải. Khi mở trực tiếp URL hoặc F5, workspace tải danh sách trước khi hiển thị chi tiết. Không tìm thấy id sẽ có trạng thái “Task not found”. BE cũng chưa có API sửa dự án, đổi mật khẩu, task lặp hay nhắc việc.

Khi xóa dự án, SQLite chuyển `project_id` của công việc sang null; FE cập nhật giống BE. Công việc vẫn giữ trạng thái hoàn thành: việc đang làm xuất hiện ở Inbox, việc đã hoàn thành nằm ở Completed.

## Các màn hình

| URL          | Nội dung                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------ |
| /login       | Đăng nhập, chuyển sang đăng ký, đăng nhập demo                                             |
| /tasks       | Bảng toàn bộ công việc, thống kê, tìm kiếm theo tên/mô tả, lọc trạng thái/ưu tiên, sắp xếp |
| /today       | Việc hôm nay và quá hạn, chia nhóm                                                         |
| /inbox       | Việc chưa hoàn thành và chưa thuộc dự án                                                   |
| /upcoming    | Việc chưa hoàn thành có hạn sau hôm nay, nhóm theo ngày                                    |
| /completed   | Việc đã hoàn thành và nút mở lại                                                           |
| /search      | Tìm trong các công việc chưa hoàn thành; dùng All tasks để tìm cả việc hoàn thành          |
| /project/:id | Việc chưa hoàn thành của dự án; thêm việc tự chọn dự án hiện tại                           |
| /task/:id    | Chi tiết, sửa/xóa, hoàn thành/mở lại                                                       |

Mọi URL workspace đều cần token. Axios tự đính kèm `Authorization: Bearer ...`. Nếu API trả 401, ứng dụng xóa phiên và quay về đăng nhập. Quyền truy cập thật do backend kiểm tra theo user_id; FE không thay thế việc kiểm tra này.

## Thứ tự đọc code

1. `src/main.jsx`: React được gắn vào HTML, bọc Provider và BrowserRouter.
2. `src/App.jsx`: kiểm tra token, điều hướng vào Auth hoặc Workspace.
3. `src/pages/TaskPage.jsx`: đọc JSX, map danh sách, filter và sort; dữ liệu lấy bằng useSelector.
4. `src/components/TaskEditor.jsx`: props task/projects, Formik, Yup, submit và modal.
5. `src/api.js`: Axios instance, baseURL từ .env, interceptor gửi token.
6. `src/store.js`: theo dõi saveTask → api.post/api.patch → fulfilled → cập nhật tasks.
7. `src/pages/Workspace.jsx`: phối hợp các màn, modal và hành động; `src/components/Sidebar.jsx` nhận props để hiển thị menu, `TaskFilters.jsx` hiển thị các bộ lọc.
8. `server/index.js`: đối chiếu request FE với validation, JWT và SQLite.

Ví dụ khi thêm task: mở modal → nhập form → Yup kiểm tra → dispatch(saveTask) → Axios POST → BE lưu SQLite → trả task có id → reducer thêm task → React render danh sách → đóng modal và thông báo thành công. Nếu request lỗi, modal giữ nội dung và hiển thị lỗi; nút được mở lại để thử tiếp.

## Demo với thầy

1. Đăng ký tài khoản, tạo dự án FER202 và chọn màu.
2. Mở dự án, thêm task với mô tả, hạn và priority; thử để tiêu đề toàn dấu cách để thấy validation.
3. Bấm tên task để xem chi tiết; sửa mô tả và chuyển task sang dự án khác hoặc Inbox.
4. Mở All tasks, tìm task, lọc ưu tiên/trạng thái, đổi sắp xếp.
5. Hoàn thành task, xem Completed rồi mở lại.
6. Xóa dự án và xem các task được chuyển về Inbox; xóa task qua modal xác nhận.
7. F5, đăng xuất rồi đăng nhập lại để thấy dữ liệu còn lưu trên BE.
8. Thu nhỏ màn hình và dùng nút menu.

## Kiểm tra

```powershell
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

API test dùng database tạm. UI test dùng `data/e2e.db`, không dùng `data/tasks.db` của ứng dụng. Tắt ứng dụng dev trước khi chạy UI test để Playwright tự mở đúng backend kiểm thử.
