const ZenBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#F8FAFC]">
      {/* Luz Ambiental de fondo */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-50 via-white to-orange-50/30" />

      {/* Onda 1 - Azul Primario (Movimiento Circular Profundo) */}
      <div className="absolute top-[-20%] left-[-10%] w-[140%] h-[70%] opacity-[0.25] mix-blend-multiply blur-[100px] animate-[wave_18s_ease-in-out_infinite] alternate">
        <div 
          className="w-full h-full bg-[#0EA5E9]" 
          style={{ borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }} 
        />
      </div>

      {/* Onda 2 - Naranja Energía (Fluidez Lateral) */}
      <div className="absolute bottom-[-15%] right-[-5%] w-[120%] h-[60%] opacity-[0.15] mix-blend-multiply blur-[120px] animate-[wave_25s_ease-in-out_infinite_6s] alternate-reverse">
        <div 
          className="w-full h-full bg-[#F97316]" 
          style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} 
        />
      </div>

      {/* Onda 3 - Violeta Acento (El "Brillo" de Apple) */}
      <div className="absolute top-[10%] right-[-10%] w-[90%] h-[50%] opacity-[0.18] mix-blend-screen blur-[80px] animate-[wave_20s_linear_infinite] alternate">
        <div 
          className="w-full h-full bg-[#8B5CF6]" 
          style={{ borderRadius: '40% 60% 60% 40% / 70% 30% 30% 70%' }} 
        />
      </div>

      {/* Capa de Grano Fino (Opcional, da textura de anuncio premium) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none contrast-150 brightness-100 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default ZenBackground;
