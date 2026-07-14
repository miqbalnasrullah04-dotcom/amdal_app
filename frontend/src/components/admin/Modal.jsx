export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#2E5E3B]/15">
          <h3 className="text-lg font-bold text-[#2E5E3B]">{title}</h3>
          <button onClick={onClose} className="text-[#414844]/60 hover:text-[#2E5E3B]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}