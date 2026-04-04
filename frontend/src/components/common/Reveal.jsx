import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { fadeUp } from "../../utils/motion";

const Reveal = ({ children, className, amount = 0.2 }) => {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
