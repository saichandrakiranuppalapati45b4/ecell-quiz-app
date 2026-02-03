import clsx from 'clsx';

export const Input = ({ className, ...props }) => {
    return (
        <input
            className={clsx(
                "w-full px-4 py-3 bg-black-soft border-2 border-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-300",
                className
            )}
            {...props}
        />
    );
};
