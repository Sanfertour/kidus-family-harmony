import { motion } from "framer-motion";

const WaveBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 wave-bg" />
      
      {/* Animated wave layers */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, hsl(211 100% 50% / 0.2) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, hsl(180 50% 70% / 0.2) 0%, transparent 50%)
          `,
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Floating orb 1 */}
      <motion.div
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{
          background: "linear-gradient(135deg, hsl(211 100% 50%) 0%, hsl(180 50% 70%) 100%)",
          top: "10%",
          left: "10%",
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Floating orb 2 */}
      <motion.div
        className="absolute w-48 h-48 rounded-full blur-3xl opacity-15"
        style={{
          background: "linear-gradient(225deg, hsl(36 100% 50%) 0%, hsl(40 100% 70%) 100%)",
          bottom: "20%",
          right: "15%",
        }}
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* SVG Wave at bottom */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-32 opacity-40"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
          fill="hsl(211 100% 50% / 0.1)"
          animate={{
            d: [
              "M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z",
              "M0,80 C240,20 480,100 720,40 C960,0 1200,80 1440,40 L1440,120 L0,120 Z",
              "M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z",
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M0,80 C360,40 720,100 1080,60 C1260,40 1350,80 1440,70 L1440,120 L0,120 Z"
          fill="hsl(180 50% 70% / 0.1)"
          animate={{
            d: [
              "M0,80 C360,40 720,100 1080,60 C1260,40 1350,80 1440,70 L1440,120 L0,120 Z",
              "M0,50 C360,90 720,30 1080,80 C1260,100 1350,50 1440,90 L1440,120 L0,120 Z",
              "M0,80 C360,40 720,100 1080,60 C1260,40 1350,80 1440,70 L1440,120 L0,120 Z",
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
};

export default WaveBackground;
