import React, { useState } from 'react';
import { 
  Users, Shield, Bell, Share2, UserPlus, Heart, 
  ChevronRight, LogOut, Copy, Camera, Check, X, Trash2, Edit2
} from 'lucide-react';
import { useNestStore } from "@/store/useNestStore";
import { triggerHaptic } from "@/utils/haptics";
import { motion, AnimatePresence } from "framer-motion";

const SettingsView = () => {
  const { profile, nestData, members, syncNest, addDependent, updateProfile, deleteMember, signOut } = useNestStore();
  
  const [syncCode, setSyncCode] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  
  // Estados para inputs
  const [editName, setEditName] = useState(profile?.display_name || '');
  const [newMemberName, setNewMemberName] = useState('');
  const [editMemberName, setEditMemberName] = useState('');

  const handleUpdateProfile = async () => {
    triggerHaptic('medium');
    await updateProfile({ display_name: editName });
    setIsEditingProfile(false);
  };

  const handleAddMember = async () => {
    if (!newMemberName) return;
    triggerHaptic('medium');
    await addDependent({ 
      display_name: newMemberName, 
      role: 'dependent',
      nest_id: nestData.id 
    });
    setNewMemberName('');
    setShowAddMember(false);
  };

  const handleUpdateMember = async (id: string) => {
    triggerHaptic('medium');
    await updateProfile({ display_name: editMemberName }, id);
    setEditingMemberId(null);
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm("¿Seguro que quieres eliminar a este miembro de la Tribu?")) {
      triggerHaptic('medium'); // CORRECCIÓN: 'heavy' cambiado a 'medium' para el Build
      await deleteMember(id);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-6 pb-32 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER: Perfil del Guía */}
      <header className="mt-12 flex flex-col items-center text-center space-y-4">
        <div className="relative group">
          <img 
            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.display_name}`} 
            className="w-24 h-24 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl"
          />
          <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg text-indigo-600 border border-slate-100">
            <Camera size={16} />
          </button>
        </div>

        {isEditingProfile ? (
          <div className="flex flex-col items-center gap-2">
            <input 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="bg-white/80 border-b-2 border-indigo-500 outline-none px-4 py-1 text-xl font-bold text-center"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleUpdateProfile} className="text-green-500 p-2 hover:scale-110"><Check size={20} /></button>
              <button onClick={() => setIsEditingProfile(false)} className="text-red-400 p-2 hover:scale-110"><X size={20} /></button>
            </div>
          </div>
        ) : (
          <div onClick={() => { triggerHaptic('soft'); setIsEditingProfile(true); }} className="cursor-pointer group">
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter group-hover:text-indigo-600 transition-colors">
              {profile?.display_name}
            </h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              Guía <Edit2 size={10} />
            </p>
          </div>
        )}
      </header>

      {/* CÓDIGO DEL NIDO: Sincronía */}
      <section className="bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[3.5rem] p-8 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-indigo-500/60 uppercase tracking-widest italic">Sincronía KidUs</p>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic">{nestData?.nest_code}</h2>
          </div>
          <button 
            onClick={() => { triggerHaptic('soft'); navigator.clipboard.writeText(nestData?.nest_code || ''); }}
            className="p-4 bg-white rounded-3xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
          >
            <Copy size={20} />
          </button>
        </div>
        <div className="relative">
          <input 
            value={syncCode}
            onChange={(e) => setSyncCode(e.target.value.toUpperCase())}
            placeholder="VINCULAR OTRO NIDO..."
            className="w-full bg-slate-50/40 border-none rounded-[2rem] py-4 px-6 text-[10px] font-black tracking-widest outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          <button 
            onClick={() => { triggerHaptic('medium'); syncNest(syncCode); }}
            className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-5 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest"
          >
            Vincular
          </button>
        </div>
      </section>

      {/* GESTIÓN DE LA TRIBU: Miembros */}
      <section className="space-y-4">
        <h3 className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Gestión de la Tribu</h3>
        
        <div className="space-y-3">
          <AnimatePresence>
            {members?.filter(m => m.role === 'dependent').map((peque) => (
              <motion.div 
                key={peque.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-4 flex items-center justify-between border border-white/60 group overflow-hidden"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-inner">
                    {peque.display_name[0]}
                  </div>
                  
                  {editingMemberId === peque.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input 
                        value={editMemberName}
                        onChange={(e) => setEditMemberName(e.target.value)}
                        className="bg-white rounded-xl px-3 py-1 text-sm font-bold outline-none border-2 border-indigo-100 w-full"
                        autoFocus
                      />
                      <button onClick={() => handleUpdateMember(peque.id)} className="text-green-500"><Check size={18}/></button>
                      <button onClick={() => setEditingMemberId(null)} className="text-slate-300"><X size={18}/></button>
                    </div>
                  ) : (
                    <span className="font-bold text-slate-700 tracking-tight">{peque.display_name}</span>
                  )}
                </div>

                {!editingMemberId && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { 
                        triggerHaptic('soft'); 
                        setEditingMemberId(peque.id); 
                        setEditMemberName(peque.display_name); 
                      }}
                      className="p-3 text-slate-300 hover:text-indigo-500 hover:bg-white rounded-2xl transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteMember(peque.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-white rounded-2xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {!showAddMember ? (
            <button 
              onClick={() => { triggerHaptic('soft'); setShowAddMember(true); }}
              className="w-full bg-white/30 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-6 flex items-center justify-center gap-3 text-slate-400 hover:border-indigo-200 hover:text-indigo-500 transition-all"
            >
              <UserPlus size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Nuevo Peque</span>
            </button>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-pink-50/30 border-2 border-pink-100 rounded-[2.5rem] p-6 space-y-4">
              <input 
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="NOMBRE DEL PEQUE..."
                className="w-full bg-white rounded-2xl py-3 px-5 outline-none font-bold text-slate-700 shadow-sm"
              />
              <div className="flex gap-2">
                <button onClick={handleAddMember} className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em]">Guardar en Nido</button>
                <button onClick={() => setShowAddMember(false)} className="bg-white text-slate-300 px-6 rounded-2xl border border-slate-100"><X size={18}/></button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-10 flex flex-col items-center gap-6">
        <button 
          onClick={() => { triggerHaptic('medium'); signOut(); }} // CORRECCIÓN: 'heavy' cambiado a 'medium'
          className="px-10 py-4 bg-white text-red-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-red-50 hover:bg-red-500 hover:text-white transition-all shadow-sm"
        >
          Finalizar Sesión
        </button>
        <p className="text-[8px] text-slate-300 font-black uppercase tracking-[0.5em]">KidUs Élite • 2026</p>
      </footer>

    </div>
  );
};

export { SettingsView };
