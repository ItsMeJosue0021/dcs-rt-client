import { Modal } from "../ui/Modal";
import { HighlightedText } from "./HighlightedText";

export function SummaryModal({ isOpen, summary, query = "", onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Research Summary">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
        <HighlightedText text={summary || ""} query={query} />
      </p>
    </Modal>
  );
}
