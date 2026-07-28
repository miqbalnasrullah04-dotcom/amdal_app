export default function ConfirmDialog({ open, onCancel, onConfirm, message, title = 'Konfirmasi Hapus' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fadeIn">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 bg-[#FFDAD6] rounded-full mx-auto mb-4">
          <span className="material-symbols-outlined text-[24px] text-[#B3261E]">delete_forever</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#1B1C1A] text-center mb-2">{title}</h3>

        {/* Message */}
        <p className="text-sm text-[#414844]/70 text-center leading-relaxed mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[#414844] bg-[#F5F4EF] hover:bg-[#E8E7E2] transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-[#B3261E] text-white hover:bg-[#93000A] transition-colors shadow-sm shadow-[#B3261E]/20"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
