// components/ZenBackground.tsx
const ZenBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#FAFBFF]">
      {/* Onda 1 - Azul suave */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[60%] opacity-20 blur-[80px] animate-wave-slow">
        <div className="w-full h-full bg-blue-400 rounded-[40%_50%_30%_40%]" />
      </div>
      
      {/* Onda 2 - Naranja corporativo suave */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[50%] opacity-10 blur-[100px] animate-wave-medium">
        <div className="w-full h-full bg-orange-300 rounded-[50%_40%_60%_30%]" />
      </div>

      {/* Onda 3 - Acento Indigo */}
      <div className="absolute top-[20%] right-[-20%] w-[80%] h-[40%] opacity-15 blur-[90px] animate-wave-fast">
        <div className="w-full h-full bg-indigo-200 rounded-[30%_60%_40%_50%]" />
      </div>
    </div>
  );
};

export default ZenBackground;
