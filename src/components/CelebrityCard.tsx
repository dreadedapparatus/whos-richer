import React from 'react';
import { motion } from 'motion/react';
import { Celebrity } from '../data/celebrities';
import { useWikipediaImage } from '../hooks/useWikipediaImage';
import { formatNetWorth } from '../utils/format';
import { Check, X } from 'lucide-react';

interface CelebrityCardProps {
  celebrity: Celebrity;
  isRevealed: boolean;
  isWinner: boolean;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
}

export const CelebrityCard: React.FC<CelebrityCardProps> = ({
  celebrity,
  isRevealed,
  isWinner,
  isSelected,
  onClick,
  disabled
}) => {
  const { image, loading } = useWikipediaImage(celebrity.wikiTitle);

  let borderClass = 'border-transparent';
  if (isRevealed) {
    if (isWinner) {
      borderClass = 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]';
    } else if (isSelected && !isWinner) {
      borderClass = 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]';
    }
  }

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02, y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`relative w-full max-w-sm mx-auto h-[300px] sm:h-[400px] md:h-[500px] rounded-3xl overflow-hidden cursor-pointer border-4 transition-all duration-300 ${borderClass} bg-zinc-900 group`}
    >
      {/* Image */}
      <div className="absolute inset-0 w-full h-full bg-zinc-800">
        {!loading && image ? (
          <img
            src={image}
            alt={celebrity.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            {loading ? 'Loading...' : 'No Image'}
          </div>
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-8 flex flex-col items-center text-center">
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-1 drop-shadow-lg leading-tight">
          {celebrity.name}
        </h2>
        <p className="text-xs sm:text-base text-zinc-300 font-medium mb-2 sm:mb-4 drop-shadow-md line-clamp-2">
          {celebrity.description}
        </p>
        
        <div className="h-16 sm:h-20 flex items-center justify-center w-full">
          {isRevealed ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <span className="text-3xl sm:text-5xl font-black text-amber-400 drop-shadow-md">
                {formatNetWorth(celebrity.netWorth)}
              </span>
              {isSelected && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mt-2 sm:mt-4"
                >
                  {isWinner ? (
                    <div className="flex items-center gap-1 sm:gap-2 text-emerald-400 font-bold text-sm sm:text-xl bg-emerald-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-full">
                      <Check className="w-4 h-4 sm:w-6 sm:h-6" /> Correct
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 sm:gap-2 text-red-400 font-bold text-sm sm:text-xl bg-red-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-full">
                      <X className="w-4 h-4 sm:w-6 sm:h-6" /> Incorrect
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl text-zinc-400 font-medium uppercase tracking-widest mb-1">Net Worth</span>
              <span className="text-3xl sm:text-5xl font-black text-white drop-shadow-md">
                ???
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
