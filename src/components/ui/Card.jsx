import { motion } from 'framer-motion';
import clsx from 'clsx';

export const Card = ({ children, className, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "bg-black-soft border border-gold/20 p-6 rounded-xl shadow-2xl backdrop-blur-sm",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};
