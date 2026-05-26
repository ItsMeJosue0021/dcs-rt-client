// src/components/research/DeleteConfirmModal.jsx
import { Modal } from "../ui/Modal";

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, isDeleting = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Delete" maxWidth="max-w-md">
      <p className="text-sm text-gray-600 mt-2">
        Are you sure you want to delete this research record? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-emerald-100">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="cursor-pointer px-4 py-2 text-sm border border-emerald-200 rounded hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="cursor-pointer px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
