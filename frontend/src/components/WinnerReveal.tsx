import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import type { Participant } from '../types';

interface WinnerRevealProps {
  isOpen: boolean;
  participants: Omit<Participant, 'id' | 'is_winner'>[];
  winnerName: string | null;
  wineName?: string;
  onClose: () => void;
}

// Sparkle component for magical effect
function Sparkle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
        rotate: [0, 180, 360]
      }}
      transition={{ 
        duration: 2,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2
      }}
    >
      <svg className="w-4 h-4 text-gold-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>
    </motion.div>
  );
}

function WinnerReveal({
  isOpen,
  participants,
  winnerName,
  wineName,
  onClose,
}: WinnerRevealProps) {
  const [phase, setPhase] = useState<'spinning' | 'slowdown' | 'revealing' | 'revealed'>('spinning');
  const [currentName, setCurrentName] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const audioContextRef = useRef<AudioContext | null>(null);

  // Generate sparkle positions
  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
  }));

  // Track window size for confetti
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase('spinning');
      setShowConfetti(false);
      setCurrentName('');
    }
  }, [isOpen]);

  // Play celebration sound
  const playCelebrationSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      oscillator.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.8);
    } catch (e) {
      // Audio not supported, continue silently
    }
  };

  // Spinning animation - faster and more dramatic
  useEffect(() => {
    if (!isOpen || phase !== 'spinning' || participants.length === 0) return;

    let interval: ReturnType<typeof setTimeout>;
    let spinCount = 0;
    const maxSpins = 25;
    const names = participants.map(p => p.name);

    const spin = () => {
      spinCount++;
      const randomName = names[Math.floor(Math.random() * names.length)];
      setCurrentName(randomName);

      if (spinCount < maxSpins) {
        // Very fast at start
        const delay = 40 + (spinCount * 8);
        interval = setTimeout(spin, delay);
      } else {
        setPhase('slowdown');
      }
    };

    interval = setTimeout(spin, 50);

    return () => {
      clearTimeout(interval);
    };
  }, [isOpen, phase, participants]);

  // Slowdown phase - dramatic pause before reveal
  useEffect(() => {
    if (phase !== 'slowdown' || participants.length === 0) return;

    let interval: ReturnType<typeof setTimeout>;
    let spinCount = 0;
    const slowSpins = 8;
    const names = participants.map(p => p.name);

    const spin = () => {
      spinCount++;
      const randomName = names[Math.floor(Math.random() * names.length)];
      setCurrentName(randomName);

      if (spinCount < slowSpins) {
        // Progressively slower
        const delay = 200 + (spinCount * 100);
        interval = setTimeout(spin, delay);
      } else {
        setPhase('revealing');
      }
    };

    interval = setTimeout(spin, 200);

    return () => {
      clearTimeout(interval);
    };
  }, [phase, participants]);

  // Reveal the winner
  useEffect(() => {
    if (phase !== 'revealing' || !winnerName) return;

    const timeout = setTimeout(() => {
      setCurrentName(winnerName);
      setPhase('revealed');
      setShowConfetti(true);
      playCelebrationSound();
    }, 500);

    return () => clearTimeout(timeout);
  }, [phase, winnerName]);

  // Stop confetti after a while
  useEffect(() => {
    if (showConfetti) {
      const timeout = setTimeout(() => setShowConfetti(false), 10000);
      return () => clearTimeout(timeout);
    }
  }, [showConfetti]);

  const displayName = phase === 'revealed' ? winnerName : currentName;
  const isRevealed = phase === 'revealed';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          {/* Confetti - gold themed */}
          {showConfetti && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={500}
              gravity={0.1}
              colors={['#fbbf24', '#fcd34d', '#fef3c7', '#f59e0b', '#ffffff', '#d97706']}
            />
          )}

          {/* Backdrop with gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"
            onClick={isRevealed ? onClose : undefined}
          />

          {/* Animated background sparkles */}
          {isRevealed && sparkles.map(sparkle => (
            <Sparkle key={sparkle.id} {...sparkle} />
          ))}

          {/* Radial glow effect */}
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-[600px] h-[600px] rounded-full bg-gradient-radial from-gold-400/20 via-gold-500/5 to-transparent blur-3xl" />
            </motion.div>
          )}

          {/* Content */}
          <div className="relative h-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              className="text-center px-8 max-w-3xl mx-auto"
            >
              {/* Trophy/Wine icon */}
              <motion.div
                animate={!isRevealed ? { 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                } : {
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: isRevealed ? 2 : 0.3, 
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="inline-block mb-10"
              >
                <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                  isRevealed 
                    ? 'bg-gradient-to-br from-gold-400 to-gold-600 animate-pulse-gold' 
                    : 'bg-white/10 backdrop-blur-sm'
                }`}>
                  <svg className={`w-16 h-16 transition-colors duration-500 ${isRevealed ? 'text-white' : 'text-white/70'}`} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C12 2 8 8 8 13c0 4 2.5 7 4 7s4-3 4-7c0-5-4-11-4-11z" />
                    <path d="M12 20v2M10 22h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-2xl font-medium mb-6 transition-colors duration-500 ${
                  isRevealed ? 'text-gold-400' : 'text-white/60'
                }`}
              >
                {isRevealed ? 'Gratulerer!' : phase === 'slowdown' ? 'Og vinneren er...' : 'Velger vinner...'}
              </motion.h2>

              {/* Name display - THE STAR OF THE SHOW */}
              <div className="min-h-[150px] flex items-center justify-center mb-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={displayName}
                    initial={{ 
                      opacity: 0, 
                      y: 30, 
                      scale: 0.8,
                      rotateX: -45
                    }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: isRevealed ? 1.1 : 1,
                      rotateX: 0
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: -30, 
                      scale: 0.8,
                      rotateX: 45
                    }}
                    transition={{ 
                      duration: phase === 'spinning' ? 0.05 : phase === 'slowdown' ? 0.15 : 0.6,
                      type: isRevealed ? 'spring' : 'tween',
                      stiffness: 100
                    }}
                    className={`text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight ${
                      isRevealed 
                        ? 'gold-shimmer glow-gold' 
                        : 'text-white/90'
                    }`}
                    style={isRevealed ? {
                      textShadow: '0 0 60px rgba(251, 191, 36, 0.5), 0 0 120px rgba(251, 191, 36, 0.3)'
                    } : undefined}
                  >
                    {displayName || '...'}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Wine name - elegant reveal */}
              {isRevealed && wineName && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="mb-10"
                >
                  <p className="text-white/50 text-lg mb-2">har vunnet</p>
                  <p className="text-white text-3xl font-light">{wineName}</p>
                </motion.div>
              )}

              {/* Close button - premium style */}
              {isRevealed && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  onClick={onClose}
                  className="btn-gold px-10 py-4 text-lg rounded-full"
                >
                  Fortsett
                </motion.button>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WinnerReveal;
