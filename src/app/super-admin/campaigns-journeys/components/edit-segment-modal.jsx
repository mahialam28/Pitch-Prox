"use client";

import SegmentFormModal from "./segment-form-modal";

// Edit Segment (segment detail page): the shared segment form
export default function EditSegmentModal({ isOpen, onClose, segment, onUpdateSuccess }) {
  return <SegmentFormModal key={isOpen ? `edit-${segment?.id}` : "closed"} isOpen={isOpen} onClose={onClose} segment={segment} onSave={onUpdateSuccess} />;
}
