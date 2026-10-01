import { type Toast, toast } from "react-hot-toast";

interface ConfirmToastProps {
  t: Toast;
  message: string;
  onResolve: (value: boolean) => void;
  setIsBlocking: (value: boolean) => void;
}

function ConfirmToast({
  t,
  message,
  onResolve,
  setIsBlocking,
}: ConfirmToastProps) {
  const handleConfirm = () => {
    toast.dismiss(t.id);
    setIsBlocking(false);
    onResolve(true);
  };

  const handleCancel = () => {
    toast.dismiss(t.id);
    setIsBlocking(false);
    onResolve(false);
  };

  return (
    <div className="flex flex-col gap-3 items-center p-2">
      <span className="text-gray-800 font-medium text-base">
        {message}
      </span>

      <div className="flex gap-3 mt-2">
        <button
          onClick={handleConfirm}
          className="px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          ยืนยัน
        </button>

        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
}

export default ConfirmToast;