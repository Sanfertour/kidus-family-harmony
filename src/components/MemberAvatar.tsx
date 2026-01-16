import { motion } from "framer-motion";
import { Camera, User } from "lucide-react";
import { NestMember } from "@/types/kidus";

interface MemberAvatarProps {
  member: NestMember;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isSelected?: boolean;
  onClick?: () => void;
  showName?: boolean;
  showCamera?: boolean;
  onPhotoUpload?: (file: File) => void;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-base",
  xl: "w-20 h-20 text-lg",
};

const borderWidths = {
  xs: "2px",
  sm: "2px",
  md: "3px",
  lg: "4px",
  xl: "4px",
};

const MemberAvatar = ({
  member,
  size = "md",
  isSelected,
  onClick,
  showName = false,
  showCamera = false,
  onPhotoUpload,
}: MemberAvatarProps) => {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onPhotoUpload) {
      onPhotoUpload(file);
    }
  };

  return (
    <motion.button
      className={`relative flex flex-col items-center gap-1.5 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold shadow-lg transition-all duration-200 overflow-hidden`}
        style={{
          backgroundColor: member.avatar ? "transparent" : member.color,
          color: member.avatar ? "inherit" : "white",
          border: `${borderWidths[size]} solid ${member.color}`,
          boxShadow: isSelected
            ? `0 0 0 3px white, 0 0 0 6px ${member.color}`
            : `0 4px 12px ${member.color}40`,
        }}
      >
        {member.avatar ? (
          <img
            src={member.avatar}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Camera overlay for photo upload */}
      {showCamera && (
        <label className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors">
          <Camera size={12} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}

      {showName && (
        <span className="text-xs font-medium text-foreground truncate max-w-16">
          {member.name.split(" ")[0]}
        </span>
      )}

      {isSelected && (
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary"
          layoutId="memberIndicator"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </motion.button>
  );
};

export default MemberAvatar;
