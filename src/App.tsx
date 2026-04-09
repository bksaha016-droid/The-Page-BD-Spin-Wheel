/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef, useEffect, RefObject } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, RotateCcw, Info, Volume2, VolumeX } from "lucide-react";
import Wheel from "./components/Wheel";

const SEGMENTS = ["1", "2", "3", "4", "5", "6", "JACKPOT"];
const JACKPOT_INDEX = 6;
const RIGGED_INTERVAL = 21;

// Sound URLs
const SOUNDS = {
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  spin: "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3",
  land: "https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3",
  jackpot: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
};

export default function App() {
  const [spinCount, setSpinCount] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Audio Refs
  const clickAudio = useRef<HTMLAudioElement | null>(null);
  const spinAudio = useRef<HTMLAudioElement | null>(null);
  const landAudio = useRef<HTMLAudioElement | null>(null);
  const jackpotAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    clickAudio.current = new Audio(SOUNDS.click);
    spinAudio.current = new Audio(SOUNDS.spin);
    spinAudio.current.loop = true;
    landAudio.current = new Audio(SOUNDS.land);
    jackpotAudio.current = new Audio(SOUNDS.jackpot);

    return () => {
      clickAudio.current?.pause();
      spinAudio.current?.pause();
      landAudio.current?.pause();
      jackpotAudio.current?.pause();
    };
  }, []);

  const playSound = (audioRef: RefObject<HTMLAudioElement | null>) => {
    if (isMuted || !audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // Ignore autoplay errors
    });
  };

  const stopSound = (audioRef: RefObject<HTMLAudioElement | null>) => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const spin = useCallback(() => {
    if (isSpinning) return;

    // Play click sound immediately
    playSound(clickAudio);

    setIsSpinning(true);
    setResult(null);
    const nextSpinCount = spinCount + 1;
    setSpinCount(nextSpinCount);

    // Start spin sound
    playSound(spinAudio);

    let targetIndex: number;

    // --- RIGGED LOGIC ---
    if (nextSpinCount % RIGGED_INTERVAL === 0) {
      targetIndex = JACKPOT_INDEX;
    } else {
      targetIndex = Math.floor(Math.random() * 6);
    }

    const sliceAngle = 360 / SEGMENTS.length;
    const targetRotation = 360 - (targetIndex * sliceAngle);
    const extraSpins = 5 * 360;
    
    const currentRemainder = rotation % 360;
    let rotationToAdd = targetRotation - currentRemainder;
    if (rotationToAdd <= 0) {
      rotationToAdd += 360;
    }

    const newRotation = rotation + rotationToAdd + extraSpins;
    setRotation(newRotation);

    // Wait for animation to finish
    setTimeout(() => {
      setIsSpinning(false);
      setResult(SEGMENTS[targetIndex]);
      
      // Stop spin sound
      stopSound(spinAudio);

      // Play result sound
      if (SEGMENTS[targetIndex] === "JACKPOT") {
        playSound(jackpotAudio);
      } else {
        playSound(landAudio);
      }
    }, 4000);
  }, [spinCount, rotation, isSpinning, isMuted]);

  const reset = () => {
    setSpinCount(0);
    setRotation(0);
    setResult(null);
    setIsSpinning(false);
    stopSound(spinAudio);
  };

  const nextJackpot = Math.ceil((spinCount + 1) / RIGGED_INTERVAL) * RIGGED_INTERVAL;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-yellow-400 selection:text-black flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none mb-4 italic"
            animate={{ scale: isSpinning ? [1, 1.02, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Spin <span className="text-yellow-400">Wheel</span>
          </motion.h1>
          <div className="flex items-center justify-center gap-4">
            <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">
              Try your luck. Win big. (Maybe)
            </p>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>

        {/* Wheel Section */}
        <div className="mb-12 relative">
          <Wheel segments={SEGMENTS} rotation={rotation} isSpinning={isSpinning} />
          
          {/* Result Overlay */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className={`px-8 py-4 rounded-2xl shadow-2xl border-4 ${
                  result === "JACKPOT" 
                    ? "bg-yellow-400 text-black border-white animate-bounce" 
                    : "bg-white text-black border-gray-200"
                }`}>
                  <p className="text-sm font-bold uppercase tracking-tighter mb-1">
                    {result === "JACKPOT" ? "Incredible!" : "Nice Try"}
                  </p>
                  <p className="text-4xl font-black uppercase">
                    {result === "JACKPOT" ? "JACKPOT!" : `Rolled ${result}`}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-6 w-full max-w-xs">
          <button
            onClick={spin}
            disabled={isSpinning}
            className={`w-full py-6 rounded-xl font-black text-2xl uppercase tracking-tighter transition-all transform active:scale-95 shadow-[0_8px_0_rgb(0,0,0,0.3)] hover:shadow-[0_4px_0_rgb(0,0,0,0.3)] hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSpinning ? "bg-gray-700 text-gray-400" : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {isSpinning ? "Spinning..." : "Spin the Wheel"}
          </button>

          <div className="flex items-center justify-between w-full px-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-gray-500">Total Spins</span>
              <span className="text-2xl font-black text-white">{spinCount}</span>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setShowHint(!showHint)}
                className="p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                title="Hint"
              >
                <Info size={20} />
              </button>
              <button 
                onClick={reset}
                className="p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                title="Reset"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 text-center"
              >
                <p className="text-yellow-400 text-xs font-mono uppercase leading-relaxed">
                  Next Jackpot guaranteed on spin #<span className="font-black underline">{nextJackpot}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-16 flex items-center gap-2 text-gray-600">
          <Trophy size={14} />
          <span className="text-[10px] uppercase font-bold tracking-widest">Rigged Casino Engine v1.0</span>
        </div>
      </motion.div>
    </div>
  );
}

