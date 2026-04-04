import { motion } from "framer-motion";

const particleCount = {
  low: 8,
  medium: 12,
  high: 18
};

const BackgroundScene = ({ density = "high" }) => {
  const count = particleCount[density] ?? particleCount.high;
  const particles = Array.from({ length: count }, (_, index) => ({
    id: index,
    width: 6 + ((index * 7) % 18),
    left: `${(index * 11 + 7) % 100}%`,
    top: `${(index * 13 + 17) % 100}%`,
    delay: index * 0.2,
    duration: 12 + (index % 5) * 2
  }));

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(92,225,230,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(120,119,255,0.14),transparent_28%),radial-gradient(circle_at_bottom,rgba(0,229,184,0.1),transparent_28%)]" />
      <div className="absolute left-1/2 top-[-12rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(60,242,214,0.18)_0%,rgba(60,242,214,0.04)_45%,transparent_72%)] blur-3xl" />
      <div className="absolute bottom-[-18rem] right-[-12rem] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(125,121,255,0.18)_0%,rgba(125,121,255,0.05)_48%,transparent_75%)] blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,24,0.35)_0%,rgba(6,10,24,0.86)_100%)]" />

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="floating-dot"
          style={{
            width: particle.width,
            height: particle.width,
            left: particle.left,
            top: particle.top
          }}
          animate={{
            y: [0, -26, 0],
            x: [0, 10, -6, 0],
            opacity: [0.18, 0.5, 0.22]
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default BackgroundScene;
