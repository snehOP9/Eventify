import { motion } from "framer-motion";
import { pageTransition } from "../../utils/motion";

const PageTransition = ({ children }) => {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
