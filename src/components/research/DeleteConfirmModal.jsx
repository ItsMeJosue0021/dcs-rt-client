// src/components/research/DeleteConfirmModal.jsx
import { Modal } from "../ui/Modal";

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, isDeleting = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Delete" maxWidth="max-w-md">
      <p className="text-sm text-gray-600 mt-2">
        Are you sure you want to delete this research record? This action cannot be undone.
      </p>
      <div className="mt-6 flex flex-col-reverse gap-2 border-t border-emerald-100 pt-4 sm:flex-row sm:justify-end">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="cursor-pointer rounded border border-emerald-200 px-4 py-2 text-sm hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="cursor-pointer rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
