import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";

const steps = [
  [
    '[data-tour="board"]',
    "Board của bạn",
    "Công việc được chia thành Today (gồm quá hạn), Upcoming, No date và Done. Hãy tạo công việc đầu tiên để bắt đầu.",
  ],
  [
    '[data-tour="new-task"]',
    "Tạo công việc",
    "Bấm New task, nhập tiêu đề; có thể thêm mô tả, hạn hoàn thành, độ ưu tiên P1–P4 và chọn project. P1 là ưu tiên cao nhất.",
  ],
  [
    '[data-tour="board"]',
    "Di chuyển và hoàn thành",
    "Trên máy tính, kéo thẻ sang cột khác để đổi hạn hoặc hoàn thành. Trên điện thoại, mở sửa task để đổi hạn hoặc bấm hoàn thành; không bắt buộc kéo thả.",
  ],
  [
    '[data-tour="projects"]',
    "Nhóm việc theo project",
    "Bấm nút + ở hàng project để tạo nhóm công việc. Mở project để xem riêng, đổi tên/màu hoặc xóa. Khi xóa project, task vẫn được giữ trong Inbox.",
  ],
  [
    '[data-tour="all-tasks"]',
    "Quản lý tất cả công việc",
    "All tasks có bảng công việc và thống kê. Bạn có thể mở chi tiết, sửa, xóa hoặc đánh dấu hoàn thành.",
  ],
  [
    '[data-tour="search"]',
    "Tìm kiếm và bộ lọc",
    "Tìm theo tên/mô tả; dùng View options để lọc ưu tiên và sắp xếp. Bạn có thể mở lại hướng dẫn từ menu tài khoản.",
  ],
];
export default function UsageGuide({ onClose }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const [selector, title, description] = steps[step];
  useEffect(() => {
    const element = document.querySelector(selector);
    element?.scrollIntoView({ block: "center", behavior: "instant" });
    const update = () => {
      const r = element?.getBoundingClientRect();
      setRect(
        r && r.width && r.height
          ? { top: r.top, left: r.left, width: r.width, height: r.height }
          : null,
      );
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [selector, step]);
  return (
    <>
      <div className="tour-shade" aria-hidden="true" />
      {rect && (
        <div aria-hidden="true" className="tour-highlight" style={rect} />
      )}
      <Modal
        show
        onHide={onClose}
        backdrop={false}
        className="usage-guide"
        aria-labelledby="guide-title"
        keyboard
      >
        <Modal.Header closeButton>
          <Modal.Title id="guide-title">{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p aria-live="polite">{description}</p>
          <small>
            Bước {step + 1}/{steps.length}
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="link" onClick={onClose}>
            Bỏ qua
          </Button>
          {step > 0 && (
            <Button
              variant="outline-secondary"
              onClick={() => setStep(step - 1)}
            >
              Quay lại
            </Button>
          )}
          <Button
            onClick={() =>
              step === steps.length - 1 ? onClose() : setStep(step + 1)
            }
          >
            {step === steps.length - 1 ? "Hoàn tất" : "Tiếp"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
