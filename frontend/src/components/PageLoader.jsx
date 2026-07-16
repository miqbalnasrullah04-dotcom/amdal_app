import logo from '../assets/logo-tenaga-ahli.png';

export default function PageLoader({ visible }) {
  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center 
        bg-gradient-to-br from-[#031B2E] via-[#04263F] to-[#010B14] 
        transition-opacity duration-700 ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Ring loading berputar dengan gradasi biru brand */}
        <div className="absolute w-32 h-32 rounded-full border border-white/10" />
        <svg
          className="absolute w-32 h-32 animate-[spin_2.5s_linear_infinite]"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="loaderRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0" />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="url(#loaderRing)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="140 200"
          />
        </svg>

        {/* Ring tipis kedua, arah putar berlawanan, memberi kesan lapisan mewah */}
        <svg
          className="absolute w-24 h-24 animate-[spin_4s_linear_infinite_reverse]"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="#0284C7"
            strokeOpacity="0.35"
            strokeWidth="1"
            strokeDasharray="4 10"
            strokeLinecap="round"
          />
        </svg>

        {/* Logo dengan efek breathing halus */}
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 animate-[breathe_3.5s_ease-in-out_infinite]">
          <img
            src={logo}
            alt="TenagaAhli.com Loading"
            width={56}
            height={56}
            className="w-14 h-14 object-contain select-none"
            draggable={false}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        {/* DI SINI DIKUNCI PAKAI 'normal-case' BIAR TIDAK DIPAKSA KAPITAL OLEH FONT */}
        <span className="text-white text-sm font-semibold tracking-wider normal-case">
          Tenaga Ahli<span className="text-[#0EA5E9]">.com</span>
        </span>
        <span className="text-white/40 text-xs tracking-wide">
          Memuat halaman...
        </span>

        {/* Progress bar tipis untuk sentuhan profesional */}
        <div className="mt-4 w-40 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#0EA5E9] to-transparent animate-[loaderBar_1.6s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(0.94); opacity: 0.85; }
          50% { transform: scale(1); opacity: 1; }
        }
        @keyframes loaderBar {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
    </div>
  );
}