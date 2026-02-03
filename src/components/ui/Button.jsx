import { motion } from 'framer-motion';
import clsx from 'clsx';

export const Button = ({ children, onClick, className, variant = 'primary', ...props }) => {
    const baseStyles = "px-6 py-3 rounded-lg font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gold text-black hover:bg-gold-light hover:shadow-[0_0_20px_rgba(212,175,55,0.6)]",
        outline: "border-2 border-gold text-gold hover:bg-gold hover:text-black",
        ghost: "text-gold hover:text-white"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(baseStyles, variants[variant], className)}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.button>
    );
};
