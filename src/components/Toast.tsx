import {
  AlertCircle,
  CheckCircle2,
  Info,
  X
} from 'lucide-react';

export type ToastType =
  | 'success'
  | 'error'
  | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({
  message,
  type,
  onClose
}: ToastProps) {
  const Icon =
    type === 'success'
      ? CheckCircle2
      : type === 'error'
        ? AlertCircle
        : Info;

  return (
    <div className={`toast ${type}`}>
      <Icon size={18} />

      <span>{message}</span>

      <button
        className="icon-button"
        type="button"
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}