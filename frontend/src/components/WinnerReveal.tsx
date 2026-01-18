import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

// Lightning bolt component - emanates from center
function LightningBolt({ angle, intensity, onFlash }: { angle: number; intensity: number; onFlash?: () => void }) {
  const path = useMemo(() => {
    // Start from center, shoot outward at given angle
    const points: string[] = [];
    const centerX = 50;
    const centerY = 50;
    const length = 30 + Math.random() * 25;
    
    let x = centerX;
    let y = centerY;
    points.push(`M ${x} ${y}`);
    
    const segments = 4 + Math.floor(Math.random() * 3);
    const segmentLength = length / segments;
    const radians = (angle * Math.PI) / 180;
    
    for (let i = 0; i < segments; i++) {
      const jitter = ((Math.random() - 0.5) * 40 * Math.PI) / 180;
      const currentAngle = radians + jitter;
      x += Math.cos(currentAngle) * segmentLength;
      y += Math.sin(currentAngle) * segmentLength;
      points.push(`L ${x} ${y}`);
    }
    
    return points.join(' ');
  }, [angle]);

  // Trigger sound when lightning appears
  useEffect(() => {
    if (onFlash) {
      onFlash();
    }
  }, [onFlash]);

  return (
    <motion.svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.9, 0] }}
      transition={{ duration: 0.06 }}
    >
      <path
        d={path}
        fill="none"
        stroke="url(#lightning-gradient)"
        strokeWidth={0.3 + intensity * 0.5}
        strokeLinecap="round"
        filter="url(#glow)"
      />
      <defs>
        <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#a5b4fc" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </motion.svg>
  );
}

// Electric arcs emanating from center (slot machine) - with coordinated sound
function ElectricArc({ intensity, onZap }: { intensity: number; onZap?: () => void }) {
  const [bolts, setBolts] = useState<{ id: number; angle: number }[]>([]);
  const boltIdRef = useRef(0);
  const intensityRef = useRef(intensity);
  const onZapRef = useRef(onZap);
  
  // Keep refs updated with latest values
  useEffect(() => {
    intensityRef.current = intensity;
    onZapRef.current = onZap;
  }, [intensity, onZap]);
  
  // Spawn lightning bolts - runs once and uses refs for current values
  useEffect(() => {
    // Main spawning interval - checks intensity ref to decide whether to spawn
    const interval = setInterval(() => {
      const currentIntensity = intensityRef.current;
      if (currentIntensity < 0.4) {
        setBolts([]);
        return;
      }
      
      // Spawn probability increases with intensity
      const spawnChance = (currentIntensity - 0.4) / 0.6; // 0 to 1 range
      if (Math.random() < spawnChance * 0.7) {
        const newBolt = {
          id: boltIdRef.current++,
          angle: Math.random() * 360,
        };
        
        setBolts(prev => [...prev.slice(-2), newBolt]); // Keep max 3 bolts
        
        // Trigger sound with each bolt
        if (onZapRef.current) {
          onZapRef.current();
        }
      }
    }, 150); // Fixed interval, spawn probability varies
    
    return () => clearInterval(interval);
  }, []); // Empty deps - runs once, uses refs for current values
  
  // Remove old bolts after they animate out
  useEffect(() => {
    if (bolts.length === 0) return;
    
    const cleanup = setTimeout(() => {
      setBolts(prev => prev.slice(1));
    }, 100);
    
    return () => clearTimeout(cleanup);
  }, [bolts]);

  if (intensity < 0.4) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {bolts.map((bolt) => (
        <LightningBolt key={bolt.id} angle={bolt.angle} intensity={intensity} />
      ))}
    </div>
  );
}

// Sparkle component for magical effect
function Sparkle({ delay, x, y, size = 1 }: { delay: number; x: number; y: number; size?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0, size * 2, size * 2.5, 0],
        rotate: [0, 180, 360, 540]
      }}
      transition={{ 
        duration: 1.5 + Math.random(),
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 1.5
      }}
    >
      <svg 
        className="text-gold-400 drop-shadow-lg" 
        style={{ 
          width: `${16 * size}px`, 
          height: `${16 * size}px`,
          filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))'
        }}
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>
    </motion.div>
  );
}

// Electric particle
function ElectricParticle({ delay }: { delay: number }) {
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-blue-400"
      style={{ left: `${startX}%`, top: `${startY}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1.5, 0],
        x: [0, (Math.random() - 0.5) * 100],
        y: [0, (Math.random() - 0.5) * 100],
      }}
      transition={{
        duration: 0.5 + Math.random() * 0.5,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
    />
  );
}

function WinnerReveal({
  isOpen,
  participants,
  winnerName,
  wineName,
  onClose,
}: WinnerRevealProps) {
  const [phase, setPhase] = useState<'warmup' | 'spinning' | 'building' | 'climax' | 'slowdown' | 'revealing' | 'revealed'>('warmup');
  const [reelNames, setReelNames] = useState<string[]>([]);
  const [reelOffset, setReelOffset] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiOpacity, setConfettiOpacity] = useState(1);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [electricIntensity, setElectricIntensity] = useState(0);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const reelRef = useRef<HTMLDivElement>(null);

  // Generate sparkle positions - many more for bedazzling effect!
  const sparkles = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
    size: 0.5 + Math.random() * 1.5,
  })), []);

  // Generate electric particles
  const electricParticles = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
  })), []);

  // Calculate optimal reel width based on longest name
  const reelWidth = useMemo(() => {
    if (!participants || participants.length === 0) return 500;
    
    const longestName = participants.reduce((longest, p) => 
      p.name.length > longest.length ? p.name : longest, 
      ''
    );
    
    // Calculate width: base font ~48px, each char ~0.55em wide, plus padding
    // Min width 400px, max width 95vw (capped at 1200px)
    const charWidth = 48 * 0.55; // approximately 26.4px per character
    const calculatedWidth = longestName.length * charWidth + 80; // 80px padding
    const minWidth = 400;
    const maxWidth = Math.min(window.innerWidth * 0.95, 1200);
    
    return Math.max(minWidth, Math.min(calculatedWidth, maxWidth));
  }, [participants]);

  // Create extended reel with repeated names - must include isOpen to rebuild on modal open
  useEffect(() => {
    if (isOpen && participants.length > 0 && winnerName) {
      const names = participants.map(p => p.name);
      // Create a long reel by repeating names multiple times
      const extended: string[] = [];
      for (let i = 0; i < 40; i++) {
        // Shuffle each batch differently
        const shuffled = [...names].sort(() => Math.random() - 0.5);
        extended.push(...shuffled);
      }
      // Place winner at exact target position (will be used to calculate stop point)
      const winnerIndex = extended.length - 5;
      extended[winnerIndex] = winnerName;
      setReelNames(extended);
    }
  }, [isOpen, participants, winnerName]);

  // Track window size for confetti
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Continuous electric crackling sound system
  const crackleNoiseRef = useRef<AudioBufferSourceNode | null>(null);
  const crackleGainRef = useRef<GainNode | null>(null);
  const crackleFilterRef = useRef<BiquadFilterNode | null>(null);
  const crackleActiveRef = useRef(false);
  
  // Start continuous electric crackling sound
  const startCrackle = useCallback(() => {
    if (crackleActiveRef.current) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      
      // Resume context if suspended
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      // Create noise buffer for crackling (longer for continuous play)
      const bufferDuration = 2;
      const bufferSize = ctx.sampleRate * bufferDuration;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      
      // Generate crackling noise pattern
      for (let i = 0; i < bufferSize; i++) {
        // Random crackle bursts
        const burstChance = Math.random();
        if (burstChance > 0.97) {
          // Sharp crack
          noiseData[i] = (Math.random() * 2 - 1) * (0.8 + Math.random() * 0.2);
        } else if (burstChance > 0.85) {
          // Medium crackle
          noiseData[i] = (Math.random() * 2 - 1) * 0.5;
        } else {
          // Background hiss
          noiseData[i] = (Math.random() * 2 - 1) * 0.15;
        }
      }
      
      // Create looping noise source
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      
      // Bandpass filter for electric character
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2000;
      filter.Q.value = 1;
      
      // High shelf to add sizzle
      const highShelf = ctx.createBiquadFilter();
      highShelf.type = 'highshelf';
      highShelf.frequency.value = 4000;
      highShelf.gain.value = 6;
      
      // Gain node for intensity control
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0; // Start silent
      
      // Connect chain
      noiseSource.connect(filter);
      filter.connect(highShelf);
      highShelf.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Start
      noiseSource.start();
      
      // Store references
      crackleNoiseRef.current = noiseSource;
      crackleGainRef.current = gainNode;
      crackleFilterRef.current = filter;
      crackleActiveRef.current = true;
    } catch (e) {
      // Audio not supported
    }
  }, []);
  
  // Stop crackling sound
  const stopCrackle = useCallback(() => {
    if (crackleNoiseRef.current) {
      try {
        crackleNoiseRef.current.stop();
      } catch {
        // Already stopped
      }
      crackleNoiseRef.current = null;
    }
    crackleGainRef.current = null;
    crackleFilterRef.current = null;
    crackleActiveRef.current = false;
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPhase('warmup');
      setShowConfetti(false);
      setConfettiOpacity(1);
      setReelOffset(0);
      setElectricIntensity(0);
      setShakeIntensity(0);
      setPulseScale(1);
      setGlowIntensity(0);
      // Note: reelNames is recreated by the dedicated effect above when isOpen changes
    } else {
      // Modal closed - stop any ongoing sounds
      stopCrackle();
    }
  }, [isOpen, stopCrackle]);
  
  // Update crackling intensity (called from animation loop)
  const updateCrackleIntensity = useCallback((intensity: number) => {
    if (!crackleActiveRef.current) {
      if (intensity > 0.1) {
        startCrackle();
      }
      return;
    }
    
    if (crackleGainRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      // Volume increases with intensity (0 to 0.5)
      const targetVolume = Math.pow(intensity, 1.5) * 0.5;
      crackleGainRef.current.gain.setTargetAtTime(targetVolume, ctx.currentTime, 0.05);
    }
    
    if (crackleFilterRef.current && audioContextRef.current) {
      // Filter frequency increases with intensity (more high frequencies = more intense)
      const targetFreq = 1500 + intensity * 3000;
      crackleFilterRef.current.frequency.setTargetAtTime(targetFreq, audioContextRef.current.currentTime, 0.1);
    }
  }, [startCrackle]);
  
  // Dummy function for compatibility with ElectricArc component
  const playZapSound = useCallback(() => {
    // Individual zaps now handled by continuous crackling
    // This is called per lightning bolt - we can add extra punch here
    if (crackleGainRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      const currentGain = crackleGainRef.current.gain.value;
      // Brief volume spike for each bolt
      crackleGainRef.current.gain.setValueAtTime(Math.min(currentGain * 1.5, 0.7), ctx.currentTime);
      crackleGainRef.current.gain.setTargetAtTime(currentGain, ctx.currentTime + 0.05, 0.05);
    }
  }, []);

  // Play epic fanfare celebration sound
  const playCelebrationSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      
      // Master gain
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.4;
      masterGain.connect(ctx.destination);
      
      // Reverb for epic sound
      const convolver = ctx.createConvolver();
      const reverbLength = ctx.sampleRate * 2;
      const reverbBuffer = ctx.createBuffer(2, reverbLength, ctx.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const data = reverbBuffer.getChannelData(channel);
        for (let i = 0; i < reverbLength; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLength, 2);
        }
      }
      convolver.buffer = reverbBuffer;
      const reverbGain = ctx.createGain();
      reverbGain.gain.value = 0.3;
      convolver.connect(reverbGain);
      reverbGain.connect(masterGain);
      
      // Dry signal
      const dryGain = ctx.createGain();
      dryGain.gain.value = 0.7;
      dryGain.connect(masterGain);
      
      // Epic brass fanfare - multiple harmonics
      const playNote = (freq: number, startTime: number, duration: number, volume: number) => {
        // Fundamental
        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.value = freq;
        
        // Octave up
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = freq * 2;
        
        // Fifth
        const osc3 = ctx.createOscillator();
        osc3.type = 'triangle';
        osc3.frequency.value = freq * 1.5;
        
        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
        noteGain.gain.setValueAtTime(volume * 0.8, startTime + duration * 0.7);
        noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        // Low pass for brass character
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        
        osc1.connect(filter);
        osc2.connect(filter);
        osc3.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(dryGain);
        noteGain.connect(convolver);
        
        osc1.start(startTime);
        osc2.start(startTime);
        osc3.start(startTime);
        osc1.stop(startTime + duration);
        osc2.stop(startTime + duration);
        osc3.stop(startTime + duration);
      };
      
      // Epic fanfare melody (C major triumph)
      // First phrase - rising
      playNote(261.63, now, 0.2, 0.5);         // C4
      playNote(329.63, now + 0.15, 0.2, 0.5);  // E4
      playNote(392.00, now + 0.30, 0.2, 0.5);  // G4
      playNote(523.25, now + 0.45, 0.4, 0.6);  // C5 (hold)
      
      // Second phrase - triumphant
      playNote(392.00, now + 0.85, 0.15, 0.5); // G4
      playNote(523.25, now + 1.0, 0.15, 0.5);  // C5
      playNote(659.25, now + 1.15, 0.15, 0.5); // E5
      playNote(783.99, now + 1.30, 0.6, 0.7);  // G5 (big finish)
      
      // Final chord - full orchestra hit
      playNote(523.25, now + 1.9, 1.0, 0.6);   // C5
      playNote(659.25, now + 1.9, 1.0, 0.5);   // E5
      playNote(783.99, now + 1.9, 1.0, 0.5);   // G5
      playNote(1046.50, now + 1.9, 1.0, 0.4);  // C6
      
      // Cymbal crash
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / noiseData.length, 1.5);
      }
      const crashSource = ctx.createBufferSource();
      crashSource.buffer = noiseBuffer;
      const crashFilter = ctx.createBiquadFilter();
      crashFilter.type = 'highpass';
      crashFilter.frequency.value = 3000;
      const crashGain = ctx.createGain();
      crashGain.gain.setValueAtTime(0.3, now + 1.9);
      crashGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
      crashSource.connect(crashFilter);
      crashFilter.connect(crashGain);
      crashGain.connect(masterGain);
      crashSource.start(now + 1.9);
      
    } catch (e) {
      // Audio not supported
    }
  };

  // Slot machine animation
  useEffect(() => {
    if (!isOpen || reelNames.length === 0) return;

    const itemHeight = 120; // Height of each name in the reel
    const winnerIndex = reelNames.length - 5; // Where the winner is placed
    // Target offset - this must be an exact multiple of itemHeight
    const targetOffset = winnerIndex * itemHeight;

    let animationFrame: number;
    let startTime: number | null = null;
    const totalDuration = 10000; // 10 seconds total for epic buildup
    let hasFinished = false;

    const animate = (timestamp: number) => {
      if (hasFinished) return;
      
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // Epic 10-second animation phases:
      // 0-20%: Warmup - slow start, building anticipation
      // 20-50%: Spinning - names flying by, energy building
      // 50-70%: Building - intensity ramping up, screen starts to shake
      // 70-85%: Climax - maximum intensity, heavy shake, peak electric
      // 85-97%: Slowdown - dramatic deceleration, tension
      // 97-100%: Reveal - flash and winner shown

      // Custom easing for dramatic effect - slow start, fast middle, dramatic slow end
      let easedProgress: number;
      if (progress < 0.2) {
        // Slow start (ease in)
        easedProgress = Math.pow(progress / 0.2, 2) * 0.1;
      } else if (progress < 0.7) {
        // Fast middle section
        const midProgress = (progress - 0.2) / 0.5;
        easedProgress = 0.1 + midProgress * 0.6;
      } else {
        // Dramatic slowdown at end (ease out expo)
        const endProgress = (progress - 0.7) / 0.3;
        easedProgress = 0.7 + (1 - Math.pow(1 - endProgress, 4)) * 0.3;
      }

      // Calculate current offset
      const currentOffset = Math.round(easedProgress * targetOffset);
      setReelOffset(currentOffset);

      // Update electric intensity with dramatic curve
      let newIntensity: number;
      let newShake: number;
      let newPulse: number;
      let newGlow: number;
      
      // PULSE SCALE: Continuously grows throughout animation - NEVER shrinks!
      // Note: Shake/blur during slowdown makes reel LOOK bigger, so revealing needs higher values to compensate
      // Warmup: 1.00 -> 1.02
      // Spinning: 1.02 -> 1.05
      // Building: 1.05 -> 1.10
      // Climax: 1.10 -> 1.15
      // Slowdown: 1.15 -> 1.22
      // Revealing: 1.22 -> 1.32 (higher to compensate for shake/blur reduction)
      // Final: 1.35
      
      if (progress < 0.2) {
        // Warmup - subtle hints of what's coming
        const p = progress / 0.2;
        newIntensity = progress * 0.5;
        newShake = 0;
        newPulse = 1.00 + p * 0.02; // 1.00 -> 1.02
        newGlow = progress * 0.3;
        setPhase('warmup');
      } else if (progress < 0.5) {
        // Spinning - building energy
        const p = (progress - 0.2) / 0.3;
        newIntensity = 0.1 + p * 0.4;
        newShake = p * 0.3;
        newPulse = 1.02 + p * 0.03; // 1.02 -> 1.05
        newGlow = 0.06 + p * 0.3;
        setPhase('spinning');
      } else if (progress < 0.7) {
        // Building - ramping up intensity
        const p = (progress - 0.5) / 0.2;
        newIntensity = 0.5 + p * 0.35;
        newShake = 0.3 + p * 0.4;
        newPulse = 1.05 + p * 0.05; // 1.05 -> 1.10
        newGlow = 0.36 + p * 0.3;
        setPhase('building');
      } else if (progress < 0.85) {
        // Climax - maximum everything!
        const p = (progress - 0.7) / 0.15;
        newIntensity = 0.85 + p * 0.15;
        newShake = 0.7 + Math.sin(elapsed / 30) * 0.3;
        newPulse = 1.10 + p * 0.05; // 1.10 -> 1.15 (always growing!)
        newGlow = 0.66 + p * 0.34;
        setPhase('climax');
      } else if (progress < 0.95) {
        // Slowdown - INTENSE shaking as it crawls to hide the name!
        const p = (progress - 0.85) / 0.10;
        newIntensity = 1 - p * 0.15; // Keep intensity very high (0.85 at end)
        // Shake INCREASES as reel slows - rapid chaotic vibration
        const baseShake = 0.5 + p * 0.6; // Grows from 0.5 to 1.1
        const rapidVibration = Math.sin(elapsed / 15) * 0.4 * (0.5 + p); // Faster vibration that intensifies
        newShake = baseShake + rapidVibration;
        newPulse = 1.15 + p * 0.07; // 1.15 -> 1.22 (keeps growing!)
        newGlow = 1; // Keep glow maxed
        setPhase('slowdown');
      } else {
        // Final reveal approaching - scale JUMPS UP to compensate for shake/blur reduction!
        const p = (progress - 0.95) / 0.05;
        newIntensity = 0.85 + p * 0.15; // Build to max
        // Intense shake that suddenly stops at the very end
        const shakeDecay = p < 0.8 ? 1 : (1 - p) / 0.2; // Full shake until 99%, then rapid decay
        const chaoticShake = (Math.sin(elapsed / 10) * 0.5 + Math.sin(elapsed / 7) * 0.3) * shakeDecay;
        newShake = (1.2 + chaoticShake) * shakeDecay; // Very intense, then sudden stop
        newPulse = 1.22 + p * 0.10; // 1.22 -> 1.32 (bigger jump to look continuous!)
        newGlow = 1; // Max glow
        setPhase('revealing');
      }
      
      setElectricIntensity(newIntensity);
      setShakeIntensity(newShake);
      setPulseScale(newPulse);
      setGlowIntensity(newGlow);
      updateCrackleIntensity(newIntensity);

      if (progress >= 1) {
        hasFinished = true;
        // Snap to EXACT position (must be multiple of itemHeight)
        setReelOffset(targetOffset);
        // Keep the epic scale and stop shake
        setShakeIntensity(0);
        setPulseScale(1.35); // BIGGEST at reveal! (continues the growth)
        setGlowIntensity(1); // Max glow
        setElectricIntensity(0); // Stop electric for clean reveal
        
        // Stop crackling and play celebration
        stopCrackle();
        
        // Immediate reveal with celebration
        setTimeout(() => {
          setPhase('revealed');
          setShowConfetti(true);
          playCelebrationSound();
        }, 100); // Shorter delay for more impact
        return;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    // Start animation after a brief delay to ensure reel is rendered
    const startDelay = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(startDelay);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      stopCrackle();
    };
  }, [isOpen, reelNames, updateCrackleIntensity, stopCrackle]);

  // Fade out confetti after a while
  useEffect(() => {
    if (showConfetti) {
      // Reset opacity when confetti starts
      setConfettiOpacity(1);
      
      // Start fading after 8 seconds
      const fadeTimeout = setTimeout(() => {
        setConfettiOpacity(0);
      }, 8000);
      
      // Remove confetti after fade completes (2 seconds fade + buffer)
      const removeTimeout = setTimeout(() => {
        setShowConfetti(false);
      }, 10500);
      
      return () => {
        clearTimeout(fadeTimeout);
        clearTimeout(removeTimeout);
      };
    }
  }, [showConfetti]);

  const isRevealed = phase === 'revealed';

  // Use portal to render outside of any parent stacking contexts (like header with backdrop-filter)
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999]"
          style={{ isolation: 'isolate' }}
        >
          {/* Confetti - gold themed celebration with fade out */}
          {showConfetti && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-[2500ms] ease-out"
              style={{ opacity: confettiOpacity }}
            >
              <Confetti
                width={windowSize.width}
                height={windowSize.height}
                recycle={true}
                numberOfPieces={600}
                gravity={0.12}
                initialVelocityX={10}
                initialVelocityY={25}
                colors={['#fbbf24', '#fcd34d', '#fef3c7', '#f59e0b', '#ffffff', '#d97706', '#facc15', '#eab308']}
              />
            </div>
          )}

          {/* Backdrop with dynamic electric gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
            style={{
              background: isRevealed 
                ? `radial-gradient(ellipse at center, 
                    rgba(50, 40, 20, 1) 0%, 
                    rgba(20, 15, 5, 1) 50%, 
                    rgba(0, 0, 0, 1) 100%)`
                : `radial-gradient(ellipse at center, 
                    rgba(${30 + glowIntensity * 40}, ${30 + glowIntensity * 20}, ${50 + glowIntensity * 50}, 1) 0%, 
                    rgba(${10 + glowIntensity * 20}, ${10 + glowIntensity * 10}, ${20 + glowIntensity * 30}, 1) 50%, 
                    rgba(0, 0, 0, 1) 100%)`
            }}
            onClick={isRevealed ? onClose : undefined}
          />
          
          {/* Pulsing vignette during climax */}
          {phase === 'climax' && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{
                background: 'radial-gradient(ellipse at center, transparent 30%, rgba(100, 150, 255, 0.2) 100%)'
              }}
            />
          )}

          {/* Electric arcs - with synced sound */}
          <ElectricArc intensity={electricIntensity} onZap={playZapSound} />

          {/* Electric particles during build-up */}
          {electricIntensity > 0.3 && (
            <div className="absolute inset-0 pointer-events-none">
              {electricParticles.map(p => (
                <ElectricParticle key={p.id} delay={p.delay} />
              ))}
            </div>
          )}

          {/* Screen flash on reveal */}
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-white pointer-events-none"
            />
          )}

          {/* Animated background sparkles after reveal */}
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
          <div 
            className="relative h-full flex items-center justify-center"
            style={{
              transform: shakeIntensity > 0 
                ? `translate(${(Math.random() - 0.5) * shakeIntensity * 10}px, ${(Math.random() - 0.5) * shakeIntensity * 10}px)`
                : 'none',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: pulseScale, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              className="text-center px-8 max-w-3xl mx-auto"
            >
              {/* Title - changes based on phase */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-2xl font-medium mb-8 transition-colors duration-300 ${
                  isRevealed ? 'text-gold-400' : 
                  phase === 'climax' ? 'text-blue-300' :
                  phase === 'building' ? 'text-blue-400/80' :
                  'text-white/60'
                }`}
                style={{
                  textShadow: phase === 'climax' 
                    ? '0 0 20px rgba(96, 165, 250, 0.8), 0 0 40px rgba(96, 165, 250, 0.4)'
                    : phase === 'building'
                    ? '0 0 10px rgba(96, 165, 250, 0.5)'
                    : 'none'
                }}
              >
                {isRevealed ? '🏆 Gratulerer! 🏆' : 
                 phase === 'revealing' ? '⚡ VINNEREN ER... ⚡' :
                 phase === 'slowdown' ? '⚡ Og vinneren er... ⚡' : 
                 phase === 'climax' ? '⚡⚡ HVEM BLIR DET?! ⚡⚡' :
                 phase === 'building' ? '⚡ Spenningen stiger... ⚡' :
                 phase === 'spinning' ? '🎰 Trekker vinner... 🎰' :
                 '✨ Gjør deg klar... ✨'}</motion.h2>

              {/* Slot Machine Reel - width adapts to longest name */}
              <div 
                className="relative mx-auto overflow-hidden rounded-2xl"
                style={{ 
                  height: '120px', 
                  width: `${reelWidth}px`,
                  maxWidth: '95vw',
                  background: isRevealed 
                    ? 'linear-gradient(180deg, rgba(40,30,5,0.95) 0%, rgba(60,45,15,0.98) 50%, rgba(40,30,5,0.95) 100%)'
                    : `linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(${20 + glowIntensity * 20},${20 + glowIntensity * 15},${40 + glowIntensity * 30},0.9) 50%, rgba(0,0,0,0.8) 100%)`,
                  boxShadow: isRevealed 
                    ? '0 0 100px rgba(251, 191, 36, 0.8), 0 0 150px rgba(251, 191, 36, 0.5), 0 0 200px rgba(251, 191, 36, 0.3), inset 0 0 50px rgba(251, 191, 36, 0.4)'
                    : `0 0 ${30 + electricIntensity * 60}px rgba(96, 165, 250, ${0.3 + electricIntensity * 0.5}), 0 0 ${60 + electricIntensity * 80}px rgba(96, 165, 250, ${electricIntensity * 0.3}), inset 0 0 ${20 + electricIntensity * 20}px rgba(96, 165, 250, ${electricIntensity * 0.4})`,
                  border: isRevealed 
                    ? '4px solid rgba(251, 191, 36, 0.9)'
                    : `${2 + electricIntensity}px solid rgba(96, 165, 250, ${0.4 + electricIntensity * 0.6})`,
                  transform: `scale(${isRevealed ? 1.35 : pulseScale})`,
                  transition: isRevealed ? 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.5s ease-out' : 'none',
                }}
              >
                {/* Top fade gradient */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
                
                {/* Bottom fade gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />

                {/* Center highlight line */}
                <div 
                  className="absolute top-1/2 left-0 right-0 h-px z-10 pointer-events-none"
                  style={{
                    background: isRevealed
                      ? 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.8), transparent)'
                      : `linear-gradient(90deg, transparent, rgba(96, 165, 250, ${0.5 + electricIntensity * 0.5}), transparent)`,
                    boxShadow: isRevealed
                      ? '0 0 10px rgba(251, 191, 36, 0.8)'
                      : `0 0 ${5 + electricIntensity * 15}px rgba(96, 165, 250, ${0.5 + electricIntensity * 0.5})`,
                  }}
                />

                {/* Reel content - with horizontal shake during slowdown */}
                <div 
                  ref={reelRef}
                  className="absolute w-full"
                  style={{ 
                    transform: `translateY(${-reelOffset}px) translateX(${!isRevealed && shakeIntensity > 0 ? (Math.random() - 0.5) * shakeIntensity * 15 : 0}px)`,
                    filter: !isRevealed && shakeIntensity > 0.8 ? `blur(${(shakeIntensity - 0.8) * 3}px)` : 'none',
                  }}
                >
                  {reelNames.map((name, index) => {
                    // Dynamic font size based on name length and reel width
                    const nameLength = name.length;
                    const isWinner = isRevealed && name === winnerName;
                    
                    // Calculate font size dynamically based on available width
                    // Base font sizes - winner gets a boost
                    const baseFontSize = isWinner ? 72 : 60;
                    const minFontSize = isWinner ? 16 : 14;
                    
                    // Available width for text (reel width minus padding)
                    const availableWidth = reelWidth - 60;
                    // Each character needs approximately 0.55em width
                    const charWidthRatio = 0.55;
                    // Calculate max font size that fits this name
                    const maxFontForName = availableWidth / (nameLength * charWidthRatio);
                    const fontSize = Math.max(minFontSize, Math.min(baseFontSize, Math.floor(maxFontForName)));
                    
                    return (
                      <div
                        key={index}
                        style={{ height: '120px' }}
                        className="flex items-center justify-center px-6"
                      >
                        <span 
                          className={`font-bold tracking-tight transition-all whitespace-nowrap ${
                            isWinner ? 'text-gold-400 gold-shimmer' : 'text-white/90'
                          }`}
                          style={{
                            fontSize: `${fontSize}px`,
                            lineHeight: '1.1',
                            ...(isWinner ? {
                              textShadow: '0 0 40px rgba(251, 191, 36, 1), 0 0 80px rgba(251, 191, 36, 0.7), 0 0 120px rgba(251, 191, 36, 0.4)',
                              animation: 'pulse 1.5s ease-in-out infinite',
                            } : {
                              textShadow: `0 0 ${electricIntensity * 20}px rgba(96, 165, 250, ${electricIntensity * 0.8})`,
                            })
                          }}
                        >
                          {name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Wine name - elegant reveal */}
              {isRevealed && wineName && (
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.8, type: 'spring', bounce: 0.3 }}
                  className="mt-12"
                >
                  <p className="text-gold-300/70 text-xl mb-3 font-medium">🍷 har vunnet 🍷</p>
                  <p 
                    className="text-white text-3xl sm:text-4xl font-light"
                    style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}
                  >
                    {wineName}
                  </p>
                </motion.div>
              )}

              {/* Close button - premium style */}
              {isRevealed && (
                <motion.button
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1.0, type: 'spring', bounce: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="btn-gold px-12 py-5 text-xl font-semibold rounded-full mt-12"
                  style={{
                    boxShadow: '0 0 30px rgba(251, 191, 36, 0.5), 0 0 60px rgba(251, 191, 36, 0.3)'
                  }}
                >
                  🍷 Tid for vin! 🍷
                </motion.button>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default WinnerReveal;
