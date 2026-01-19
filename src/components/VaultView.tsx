import { motion } from "framer-motion";
import { FileText, ShieldCheck, Download, Plus } from "lucide-react";

interface VaultViewProps {
  nestId: string;
}

export const VaultView = ({ nestId }: VaultViewProps) => {
  // Simulación de documentos (Luego los traeremos de Supabase Storage)
  const documents = [
    { id: 1, name: "Libro Vacunas.pdf", size: "1.2MB", date: "12 Ene" },
    { id: 2, name: "Circular Colegio.png", size: "2.4MB", date: "Hoy" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-6xl font-black text-slate-900 tracking-tighter">Bóveda</h2>
          <p className="text-sky-500 font-bold text-xs uppercase tracking-[0.3em] mt-2">Documentos del Nido</p>
        </div>
        <button className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-xl active:scale-90 transition-all">
          <Plus size={28} />
        </button>
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <div 
            key={doc.id}
            className="p-6 rounded-[2.5rem] bg-white border border-white shadow-brisa flex items-center justify-between group active:scale-95 transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 tracking-tight">{doc.name}</h3>
                <p className="text-slate-400 text-xs font-bold">{doc.size} • {doc.date}</p>
              </div>
            </div>
            <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-sky-500 transition-colors">
              <Download size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Indicador de Seguridad Élite */}
      <div className="p-8 rounded-[3rem] bg-sky-500/5 border border-sky-100 flex items-center gap-4">
        <ShieldCheck className="text-sky-500" size={32} />
        <p className="text-[11px] font-bold text-sky-800/60 leading-relaxed uppercase tracking-widest">
          Sincronía protegida con cifrado de grado militar. Solo los Guías de este Nido tienen acceso.
        </p>
      </div>
    </motion.div>
  );
};
