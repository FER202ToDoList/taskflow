import { Modal, Button } from "react-bootstrap";

export default function ConfirmDialog({ item, onCancel, onConfirm }) {
  const isProject = item?.kind === "project";
  return (
    <Modal show={!!item} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete {isProject ? "project" : "task"}?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-1">“{item?.name}”</p>
        {isProject && <p className="text-muted-soft mb-0">Its tasks will move to Inbox.</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="link" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
