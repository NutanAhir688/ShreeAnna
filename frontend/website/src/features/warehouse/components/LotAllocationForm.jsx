import AllocateLotCard from "./AllocateLotCard";

export default function LotAllocationForm({ onClose, onSuccess }) {
  return (
    <AllocateLotCard
      onCancel={onClose}
      onSuccess={(res) => {
        if (onSuccess) onSuccess(res);
        if (onClose) onClose();
      }}
    />
  );
}