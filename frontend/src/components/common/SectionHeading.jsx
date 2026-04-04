import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const SectionHeading = ({ eyebrow, title, description, action, align = "left", className }) => {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glow-pill"
          >
            {eyebrow}
          </motion.span>
        ) : null}
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        {description ? <p className="mt-4 max-w-2xl text-base text-white/65">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
};

export default SectionHeading;
