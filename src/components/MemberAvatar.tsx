import { motion } from "framer-motion";
import { Camera, User } from "lucide-react";

// Función háptica integrada según el manual de la Tribu
const triggerHaptic = (type: 'soft' | 'success') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(type === 'soft' ? 10 : [20, 30, 20]);
  }
};

interface MemberAvatarProps {
  member: any; // O usar tu interfaz NestMember adaptada a DB
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isSelected?: boolean;
  onClick?: () => void;
  showName?: boolean;
  showCamera?: boolean;
  onPhotoUpload?: (file: File) => void;
}

const sizeClasses = {
  xs: "w-8 h-8 text-[10px]",
  sm: "w-10 h-10 text-xs",
  md: "w-16 h-16 text-sm",
  lg: "w-20 h-20 text-base",
  xl: "w-28 h-28 text-lg",
};

export const MemberAvatar = ({
  member,
  size = "md",
  isSelected,
  onClick,
  showName = false,
  showCamera = false,
  onPhotoUpload,
}: MemberAvatarProps) => {
  // Extraemos iniciales del display_name sincronizado
  const initials = member.display_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "??";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onPhotoUpload) {
      triggerHaptic('success');
      onPhotoUpload(file);
    }
  };

  // El color puede venir como HEX en avatar_url o una prop dedicada
  const memberColor = member.avatar_url?.startsWith('#') ? member.avatar_url : '#0EA5E9';
  const hasImage = member.avatar_url?.startsWith('http');

  return (
    <motion.button
      className="relative flex flex-col items-center gap-2 outline-none"
      onClick={() => {
        triggerHaptic('soft');
        onClick?.();
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className={`${sizeClasses[size]} rounded-[1.75rem] flex items-center justify-center font-black transition-all duration-400 overflow-hidden shadow-sm`}
        style={{
          backgroundColor: hasImage ? 'transparent' : memberColor,
          border: isSelected ? `3px solid #0EA5E9` : `2px solid white`,
          boxShadow: isSelected ? `0 0 15px ${memberColor}40` : 'none',
        }}
      >
        {hasImage ? (
          <img 
            src={member.avatar_url} 
            alt={member.display_name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <span className="text-white drop-shadow-md">{initials}</span>
        )}
      </div>

      {/* Camera overlay con Vital Orange */}
      {showCamera && (
        <label className="absolute bottom-6 right-0 w-8 h-8 rounded-full bg-[#F97316] text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
          <Camera size={14} strokeWidth={3} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}

      {showName && (
        <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${isSelected ? 'text-[#0EA5E9]' : 'text-slate-400'}`}>
          {member.display_name?.split(" ")[0]}
        </span>
      )}

      {isSelected && (
        <motion.div
          className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#0EA5E9]"
          layoutId="memberIndicator"
        />
      )}
    </motion.button>
  );
};

export default MemberAvatar;
