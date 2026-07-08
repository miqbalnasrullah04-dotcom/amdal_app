import logo from '../assets/logo-amdal.png';

export default function PageLoader({ visible }) {
  return (
    <div
      aria-hidden={!visible}
      // Kita tambahkan durasi transisi keluar yang pas (duration-500)
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Efek berkedip halus */}
      <div className="flex items-center justify-center animate-[pulse_1.5s_ease-in-out_infinite]">
        <img
          src={logo}
          alt="AMDAL.ID Loading"
          width={80}
          height={80}
          // brightness-0 bikin logo jadi hitam, invert membalik hitam jadi putih solid!
          className="w-20 h-20 object-contain selection:bg-transparent brightness-0 invert"
        />
      </div>
    </div>
  );
}