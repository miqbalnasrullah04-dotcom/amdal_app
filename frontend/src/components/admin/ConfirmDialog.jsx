export default function ConfirmDialog({ open, onCancel, onConfirm, message }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <p className="text-sm text-[#1B1C1A] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-bold text-[#414844] hover:bg-[#414844]/10"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-[#B3261E] text-white hover:bg-[#93000A]"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}