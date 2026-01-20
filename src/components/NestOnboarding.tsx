import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Share2, Plus, Users, ArrowRight } from "lucide-react";

interface NestOnboardingProps {
  onComplete: () => void;
}

export const NestOnboarding = ({ onComplete }: NestOnboardingProps) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'choice' | 'create' | 'join'>('choice');
  const [nestName, setNestName] = useState("");
  const [shareCode, setShareCode] = useState("");

  // Feedback Háptico
  const hapticFeedback = () => {
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  // 1. CREAR UN NIDO NUEVO
  const handleCreateNest = async () => {
    if (!nestName.trim()) return toast.error("Ponle un nombre a tu Nido");
    setLoading(true);
    hapticFeedback();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión");

      // Generar código amigable KID-XXXXX
      const generatedCode = `KID-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Insertar Nido (El ID se genera solo como UUID)
      const { data: nest, error: nestError } = await supabase
        .from('nests')
        .insert([{ name: nestName, nest_code: generatedCode }])
        .select()
        .single();

      if (nestError) throw nestError;

      // Actualizar Perfil del Guía con el UUID del Nido
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          nest_id: nest.id, // Guardamos el UUID
          role: 'autonomous',
          display_name: user.user_metadata.full_name || 'Guía'
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success("Nido creado con éxito. ¡Bienvenido, Guía!");
      onComplete();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. UNIRSE A UN NIDO EXISTENTE
  const handleJoinNest = async () => {
    if (!shareCode.trim()) return toast.error("Introduce un código");
    setLoading(true);
    hapticFeedback();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión");

      // BUSCAR EL NIDO POR EL CÓDIGO (Traducción KID -> UUID)
      const { data: nest, error: nestError } = await supabase
        .from('nests')
        .select('id, name')
        .eq('nest_code', shareCode.trim().toUpperCase())
        .single();

      if (nestError || !nest) throw new Error("Código de Nido no encontrado");

      // Vincular el perfil al UUID encontrado
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          nest_id: nest.id, // Guardamos el UUID real
          role: 'autonomous' 
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success(`Te has unido al Nido: ${nest.name}`);
      onComplete();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-panel w-full max-w-md p-10 animate-page-transition-enter">
        {step === 'choice' && (
          <div className="space-y-8 text-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Tu Nido, en Sincronía</h1>
              <p className="text-slate-500">¿Cómo quieres empezar hoy?</p>
            </div>
            <div className="grid gap-4">
              <Button 
                onClick={() => { hapticFeedback(); setStep('create'); }}
                className="h-20 rounded-3xl bg-sky-500 hover:bg-sky-600 text-lg gap-3"
              >
                <Plus className="w-6 h-6" /> Crear Nuevo Nido
              </Button>
              <Button 
                onClick={() => { hapticFeedback(); setStep('join'); }}
                variant="outline"
                className="h-20 rounded-3xl border-slate-200 text-lg gap-3"
              >
                <Users className="w-6 h-6" /> Unirme a un Nido
              </Button>
            </div>
          </div>
        )}

        {step === 'create' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Nombre del Nido</h2>
            <Input 
              placeholder="Ej: Familia García" 
              value={nestName}
              onChange={(e) => setNestName(e.target.value)}
              className="h-14 rounded-2xl"
            />
            <Button 
              onClick={handleCreateNest} 
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-sky-500 gap-2"
            >
              {loading ? "Creando..." : "Comenzar Sincronía"} <ArrowRight className="w-4 h-4" />
            </Button>
            <button onClick={() => setStep('choice')} className="w-full text-sm text-slate-400">Volver</button>
          </div>
        )}

        {step === 'join' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Código del Nido</h2>
            <Input 
              placeholder="KID-XXXXX" 
              value={shareCode}
              onChange={(e) => setShareCode(e.target.value)}
              className="h-14 rounded-2xl uppercase"
            />
            <Button 
              onClick={handleJoinNest} 
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-slate-800 gap-2"
            >
              {loading ? "Buscando..." : "Unirme a la Tribu"} <Share2 className="w-4 h-4" />
            </Button>
            <button onClick={() => setStep('choice')} className="w-full text-sm text-slate-400">Volver</button>
          </div>
        )}
      </div>
    </div>
  );
};
