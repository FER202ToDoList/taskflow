import { Modal, Button, Alert } from "react-bootstrap";

export default function ConfirmDialog({ item, busy, error, onCancel, onConfirm }) {
  const isProject = item?.kind === "projects";
  return (
    <Modal
      show={!!item}
      onHide={() => !busy && onCancel()}
      centered
      backdrop={busy ? "static" : true}
    >
      <Modal.Header closeButton={!busy}>
        <Modal.Title>Delete {isProject ? "project" : "task"}?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p className="mb-1">“{item?.name}”</p>
        {isProject && <p className="text-muted-soft mb-0">Its tasks will move to Inbox.</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="link" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" disabled={busy} onClick={onConfirm}>
          {busy ? "Deleting…" : "Delete"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
