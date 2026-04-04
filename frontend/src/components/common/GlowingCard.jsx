import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const GlowingCard = ({ children, className, hover = true }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -8, scale: 1.01 } : undefined}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn("premium-card card-shine spotlight-border", className)}
    >
      {children}
    </motion.div>
  );
};

export default GlowingCard;
