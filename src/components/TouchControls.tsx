import React, { useState, useRef, useEffect, useCallback } from "react";
import { Zap, Shield, RotateCcw, Target, Crosshair, ChevronUp, FastForward, Play } from "lucide-react";

interface TouchControlsProps {
  onMove: (vector: { x: number; z: number }) => void;
  onLook: (dx: number, dy: number) => void;
  onFireStart: () => void;
  onFireEnd: () => void;
  onJump: () => void;
  onSlide: () => void;
  onDash: () => void;
  onReload: () => void;
  onAimToggle: () => void;
  onSwitchWeapon: () => void;
  isAiming: boolean;
  sensitivity?: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  onLook,
  onFireStart,
  onFireEnd,
  onJump,
  onSlide,
  onDash,
  onReload,
  onAimToggle,
  onSwitchWeapon,
  isAiming,
  sensitivity = 1.0,
}) => {
  // Joystick State
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const joystickTouchId = useRef<number | null>(null);
  const joystickCenter = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [joystickPos, setJoystickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);

  // Look Touch State
  const lookTouchId = useRef<number | null>(null);
  const lastLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Continuous Fire Holding
  const [isFiringHeld, setIsFiringHeld] = useState(false);

  // 1. Left Joystick Handlers
  const handleJoystickStart = useCallback((e: React.TouchEvent) => {
    if (joystickTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    joystickTouchId.current = touch.identifier;

    if (joystickBaseRef.current) {
      const rect = joystickBaseRef.current.getBoundingClientRect();
      joystickCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    } else {
      joystickCenter.current = { x: touch.clientX, y: touch.clientY };
    }

    setIsJoystickActive(true);
  }, []);

  const handleJoystickMove = useCallback((e: TouchEvent) => {
    if (joystickTouchId.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId.current) {
        const maxRadius = 50;
        const dx = touch.clientX - joystickCenter.current.x;
        const dy = touch.clientY - joystickCenter.current.y;
        const distance = Math.hypot(dx, dy);

        let clampedX = dx;
        let clampedY = dy;
        if (distance > maxRadius) {
          clampedX = (dx / distance) * maxRadius;
          clampedY = (dy / distance) * maxRadius;
        }

        setJoystickPos({ x: clampedX, y: clampedY });

        // Normalized move vector: X is strafe (left/right), Z is forward/backward
        const normX = clampedX / maxRadius;
        const normZ = clampedY / maxRadius;
        onMove({ x: normX, z: normZ });
        break;
      }
    }
  }, [onMove]);

  const handleJoystickEnd = useCallback((e: TouchEvent) => {
    if (joystickTouchId.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId.current) {
        joystickTouchId.current = null;
        setIsJoystickActive(false);
        setJoystickPos({ x: 0, y: 0 });
        onMove({ x: 0, z: 0 });
        break;
      }
    }
  }, [onMove]);

  // 2. Right Look Touch Zone Handlers
  const handleLookStart = useCallback((e: React.TouchEvent) => {
    if (lookTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    lookTouchId.current = touch.identifier;
    lastLookPos.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleLookMove = useCallback((e: TouchEvent) => {
    if (lookTouchId.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchId.current) {
        const dx = touch.clientX - lastLookPos.current.x;
        const dy = touch.clientY - lastLookPos.current.y;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };

        const lookSens = sensitivity * 1.6;
        onLook(dx * lookSens, dy * lookSens);
        break;
      }
    }
  }, [onLook, sensitivity]);

  const handleLookEnd = useCallback((e: TouchEvent) => {
    if (lookTouchId.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchId.current) {
        lookTouchId.current = null;
        break;
      }
    }
  }, []);

  // Attach global touch move/end to window for smooth dragging off button borders
  useEffect(() => {
    window.addEventListener("touchmove", handleJoystickMove, { passive: false });
    window.addEventListener("touchend", handleJoystickEnd);
    window.addEventListener("touchcancel", handleJoystickEnd);

    window.addEventListener("touchmove", handleLookMove, { passive: false });
    window.addEventListener("touchend", handleLookEnd);
    window.addEventListener("touchcancel", handleLookEnd);

    return () => {
      window.removeEventListener("touchmove", handleJoystickMove);
      window.removeEventListener("touchend", handleJoystickEnd);
      window.removeEventListener("touchcancel", handleJoystickEnd);

      window.removeEventListener("touchmove", handleLookMove);
      window.removeEventListener("touchend", handleLookEnd);
      window.removeEventListener("touchcancel", handleLookEnd);
    };
  }, [handleJoystickMove, handleJoystickEnd, handleLookMove, handleLookEnd]);

  return (
    <div id="mobile-touch-root" className="absolute inset-0 pointer-events-none select-none z-30 flex justify-between p-4 sm:p-6 overflow-hidden">
      
      {/* LEFT ZONE: Dynamic Capacitive Movement Joystick */}
      <div
        id="touch-zone-movement"
        className="w-1/2 h-full pointer-events-auto flex items-end justify-start pb-8 pl-4"
        onTouchStart={handleJoystickStart}
      >
        <div
          ref={joystickBaseRef}
          className={`w-36 h-36 rounded-full bg-zinc-950/60 border-2 transition-colors flex items-center justify-center relative backdrop-blur-md shadow-2xl ${
            isJoystickActive ? "border-amber-400 bg-zinc-900/80 shadow-amber-500/20" : "border-zinc-700/80"
          }`}
        >
          {/* Compass Guides */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="w-full h-0.5 bg-zinc-400" />
            <div className="h-full w-0.5 bg-zinc-400 absolute" />
          </div>

          {/* Draggable Knob */}
          <div
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 border-2 border-white/80 shadow-lg flex items-center justify-center pointer-events-none transition-transform duration-75"
            style={{
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-zinc-950/60" />
          </div>
        </div>
      </div>

      {/* RIGHT ZONE: Look / Aim Pan Surface & Action Buttons */}
      <div
        id="touch-zone-look"
        className="w-1/2 h-full pointer-events-auto flex flex-col justify-end items-end pb-6 pr-2 relative"
        onTouchStart={handleLookStart}
      >
        {/* Right Floating Action Clusters */}
        <div className="flex flex-col gap-3 items-end pointer-events-auto">
          
          {/* Secondary Actions (Reload, Switch, Aim) */}
          <div className="flex items-center gap-2.5">
            <button
              id="touch-btn-reload"
              onTouchStart={(e) => { e.stopPropagation(); onReload(); }}
              className="w-12 h-12 rounded-2xl bg-zinc-900/90 active:bg-zinc-800 border border-zinc-700 text-white flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <RotateCcw className="w-5 h-5 text-amber-400" />
              <span className="text-[9px] font-black text-zinc-300">R</span>
            </button>

            <button
              id="touch-btn-switch"
              onTouchStart={(e) => { e.stopPropagation(); onSwitchWeapon(); }}
              className="w-12 h-12 rounded-2xl bg-zinc-900/90 active:bg-zinc-800 border border-zinc-700 text-cyan-400 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform font-black text-xs"
            >
              <Crosshair className="w-5 h-5" />
              <span className="text-[9px] text-zinc-300">ARM</span>
            </button>

            <button
              id="touch-btn-aim"
              onTouchStart={(e) => { e.stopPropagation(); onAimToggle(); }}
              className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all ${
                isAiming
                  ? "bg-amber-500 border-amber-300 text-zinc-950 font-black"
                  : "bg-zinc-900/90 border-zinc-600 text-white"
              }`}
            >
              <Target className="w-6 h-6" />
              <span className="text-[9px] font-extrabold">{isAiming ? "ADS ON" : "ADS"}</span>
            </button>
          </div>

          {/* Movement Tricks (Slide & Dash) */}
          <div className="flex items-center gap-2.5">
            <button
              id="touch-btn-slide"
              onTouchStart={(e) => { e.stopPropagation(); onSlide(); }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 active:from-cyan-500 active:to-blue-500 border border-cyan-400/80 text-white font-black text-xs shadow-xl active:scale-95 transition-transform flex flex-col items-center justify-center gap-0.5"
            >
              <FastForward className="w-5 h-5" />
              <span className="text-[9px]">SLIDE</span>
            </button>

            <button
              id="touch-btn-dash"
              onTouchStart={(e) => { e.stopPropagation(); onDash(); }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-violet-600 active:from-purple-500 active:to-violet-500 border border-purple-400/80 text-white font-black text-xs shadow-xl active:scale-95 transition-transform flex flex-col items-center justify-center gap-0.5"
            >
              <Zap className="w-5 h-5" />
              <span className="text-[9px]">DASH</span>
            </button>
          </div>

          {/* Primary Action Buttons (Jump & Giant Fire Button) */}
          <div className="flex items-center gap-3">
            <button
              id="touch-btn-jump"
              onTouchStart={(e) => { e.stopPropagation(); onJump(); }}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 active:from-emerald-500 active:to-teal-400 border-2 border-emerald-300 text-white font-black text-xs shadow-2xl active:scale-95 transition-transform flex flex-col items-center justify-center gap-0.5"
            >
              <ChevronUp className="w-7 h-7" />
              <span className="text-[10px]">JUMP</span>
            </button>

            <button
              id="touch-btn-fire"
              onTouchStart={(e) => {
                e.stopPropagation();
                setIsFiringHeld(true);
                onFireStart();
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                setIsFiringHeld(false);
                onFireEnd();
              }}
              className={`w-22 h-22 rounded-full border-4 text-white font-black text-base shadow-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all ${
                isFiringHeld
                  ? "bg-gradient-to-tr from-rose-500 to-red-400 border-white ring-4 ring-rose-500/50 scale-105"
                  : "bg-gradient-to-tr from-rose-600 to-amber-600 border-rose-400"
              }`}
            >
              <Crosshair className="w-8 h-8" />
              <span className="text-xs tracking-wider">DISPARAR</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
