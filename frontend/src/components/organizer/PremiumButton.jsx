import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

const MotionLink = motion(Link);

const baseClassName =
  "inline-flex items-center justify-center gap-2 rounded-2xl border font-semibold tracking-wide transition duration-300 disabled:cursor-not-allowed disabled:opacity-55";

const variants = {
  primary:
    "border-transparent bg-[linear-gradient(120deg,#34d399_0%,#22d3ee_44%,#f59e0b_100%)] text-slate-950 shadow-[0_16px_40px_rgba(14,165,233,0.35)] hover:shadow-[0_20px_55px_rgba(16,185,129,0.45)]",
  secondary:
    "border-cyan-300/30 bg-cyan-300/10 text-cyan-100 hover:border-cyan-200/60 hover:bg-cyan-300/18",
  ghost:
    "border-white/15 bg-white/5 text-white/85 hover:border-white/30 hover:bg-white/10",
  danger:
    "border-rose-300/35 bg-rose-400/10 text-rose-100 hover:border-rose-200/60 hover:bg-rose-500/20"
};

const sizes = {
  xs: "h-9 px-3.5 text-xs",
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base"
};

const PremiumButton = ({
  children,
  variant = "primary",
  size = "md",
  className,
  icon: Icon,
  to,
  type = "button",
  onClick,
  disabled = false
}) => {
  const classes = cn(baseClassName, variants[variant], sizes[size], className);

  if (to) {
    return (
      <MotionLink
        to={to}
        onClick={
          disabled
            ? (event) => {
                event.preventDefault();
              }
            : onClick
        }
        className={classes}
        whileHover={disabled ? undefined : { y: -2, scale: 1.01 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
      >
        {Icon ? <Icon size={16} /> : null}
        <span>{children}</span>
      </MotionLink>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      whileHover={disabled ? undefined : { y: -2, scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
    >
      {Icon ? <Icon size={16} /> : null}
      <span>{children}</span>
    </motion.button>
  );
};

export default PremiumButton;
