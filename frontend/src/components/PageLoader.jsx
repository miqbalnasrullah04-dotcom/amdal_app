import logo from '../assets/logo-amdal.png';

export default function PageLoader({ visible }) {
  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center 
        bg-gradient-to-br from-black via-neutral-900 to-black 
        transition-opacity duration-700 ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Ring loading berputar, lebih pelan (2.5s) */}
        <div className="absolute w-28 h-28 rounded-full border-2 border-white/10" />
        <div className="absolute w-28 h-28 rounded-full border-2 border-t-white/80 border-r-transparent border-b-transparent border-l-transparent animate-[spin_2.5s_linear_infinite]" />

        {/* Logo dengan warna asli (tanpa brightness-0 invert) + breathing lebih lambat (3.5s) */}
        <div className="relative flex items-center justify-center animate-[breathe_3.5s_ease-in-out_infinite]">
          <img
            src={logo}
            alt="AMDAL.ID Loading"
            width={64}
            height={64}
            className="w-16 h-16 object-contain select-none drop-shadow-[0_0_14px_rgba(0,0,0,0.3)]"
            draggable={false}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-1">
        <span className="text-white/90 text-sm font-medium tracking-[0.2em] uppercase">
          AMDAL.ID
        </span>
        <span className="text-white/40 text-xs tracking-wide">
          Memuat halaman...
        </span>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(0.92); opacity: 0.75; }
          50% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}