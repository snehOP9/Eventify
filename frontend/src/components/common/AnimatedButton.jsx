import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useMagneticHover } from "../../hooks/useMagneticHover";

const MotionLink = motion(Link);

const baseStyles =
  "inline-flex max-w-full items-center justify-center gap-2 whitespace-normal text-center sm:whitespace-nowrap rounded-full border text-sm font-semibold leading-none tracking-wide transition-all duration-300";

const variants = {
  primary:
    "border-[rgba(96,247,214,0.45)] bg-[linear-gradient(135deg,rgba(70,246,210,0.88),rgba(94,136,255,0.85))] text-slate-950 shadow-[0_12px_40px_rgba(60,240,207,0.25)]",
  secondary:
    "border-white/12 bg-white/[0.06] text-white hover:border-white/25 hover:bg-white/[0.08]",
  ghost:
    "border-white/10 bg-[rgba(11,16,34,0.6)] text-white/90 hover:border-[var(--primary)]/40 hover:bg-white/[0.05]"
};

const sizes = {
  sm: "px-4 py-2.5",
  md: "px-5 py-3",
  lg: "px-6 py-3.5"
};

const AnimatedButton = ({
  children,
  to,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  size = "md",
  className,
  icon: Icon
}) => {
  const { springX, springY, handleMouseMove, resetPosition } = useMagneticHover(18);
  const classes = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    disabled && "cursor-not-allowed opacity-55",
    className
  );

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
        onMouseMove={disabled ? undefined : handleMouseMove}
        onMouseLeave={resetPosition}
        whileTap={{ scale: 0.97 }}
        style={{ x: springX, y: springY }}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        className={classes}
      >
        {children}
        {Icon ? <Icon size={18} /> : null}
      </MotionLink>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={disabled ? undefined : handleMouseMove}
      onMouseLeave={resetPosition}
      whileTap={{ scale: 0.97 }}
      style={{ x: springX, y: springY }}
      className={classes}
    >
      {children}
      {Icon ? <Icon size={18} /> : null}
    </motion.button>
  );
};

export default AnimatedButton;
