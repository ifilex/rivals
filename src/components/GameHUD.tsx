import React from "react";
import { GameSettings, MatchState, Weapon } from "../types";
import { Shield, Zap, Target, Crosshair, ChevronRight, FastForward, RotateCcw, Menu, LogOut, Play } from "lucide-react";
import { TouchControls } from "./TouchControls";
import { sounds } from "../audio/soundEngine";

interface GameHUDProps {
  matchState: MatchState;
  currentWeapon: Weapon;
  settings: GameSettings;
  isTouchDevice: boolean;
  onOpenPauseMenu: () => void;
  // Touch Handlers
  onTouchMove?: (vector: { x: number; z: number }) => void;
  onTouchLook?: (dx: number, dy: number) => void;
  onTouchFireStart?: () => void;
  onTouchFireEnd?: () => void;
  onTouchJump?: () => void;
  onTouchSlide?: () => void;
  onTouchDash?: () => void;
  onTouchReload?: () => void;
  onTouchAimToggle?: () => void;
  onTouchSwitchWeapon?: () => void;
  isAiming?: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  matchState,
  currentWeapon,
  settings,
  isTouchDevice,
  onOpenPauseMenu,
  onTouchMove,
  onTouchLook,
  onTouchFireStart,
  onTouchFireEnd,
  onTouchJump,
  onTouchSlide,
  onTouchDash,
  onTouchReload,
  onTouchAimToggle,
  onTouchSwitchWeapon,
  isAiming = false,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (matchState.playerHp / (matchState.playerMaxHp || 100)) * 100));
  const oppHpPercent = Math.max(0, Math.min(100, (matchState.opponentHp / (matchState.opponentMaxHp || 100)) * 100));
  const staminaPercent = Math.max(0, Math.min(100, matchState.stamina));

  return (
    <div id="game-hud-root" className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3 sm:p-5 overflow-hidden">
      
      {/* 1. TOP SCOREBOARD, PAUSE BUTTON & ROUND BANNER */}
      <div className="w-full flex items-center justify-between gap-2">
        
        {/* Left: Player ID Card */}
        <div className="flex items-center gap-2 sm:gap-3 bg-zinc-950/85 backdrop-blur-md px-3 sm:px-4 py-2 rounded-2xl border border-zinc-800 shadow-xl">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-black text-xs sm:text-sm text-white shadow-inner">
            YOU
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="truncate max-w-[90px] sm:max-w-[140px]">ApexRival_One</span>
              <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-400 font-extrabold">1885 ELO</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: matchState.roundsToWin }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-1.5 rounded-full transition-all ${
                    i < matchState.playerScore ? "bg-emerald-400 shadow-sm shadow-emerald-400" : "bg-zinc-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center: Round & Time Banner + Pause Trigger */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex flex-col items-center bg-zinc-950/90 backdrop-blur-md px-4 sm:px-6 py-1.5 sm:py-2 rounded-2xl border border-zinc-800 shadow-2xl">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-400 font-extrabold">
              RONDA {matchState.round} • PRIMERO A {matchState.roundsToWin}
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-xl sm:text-2xl font-black tracking-wider text-white">
              <span className="text-emerald-400">{matchState.playerScore}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                00:{matchState.roundTimeLeft < 10 ? `0${matchState.roundTimeLeft}` : matchState.roundTimeLeft}
              </span>
              <span className="text-rose-400">{matchState.opponentScore}</span>
            </div>
          </div>

          {/* Dedicated Pause / ESC button */}
          <button
            id="hud-btn-pause"
            onClick={() => {
              sounds.playUiClick();
              onOpenPauseMenu();
            }}
            title="Pausar / Opciones (ESC)"
            className="pointer-events-auto px-3 py-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-700 hover:border-amber-400/60 text-zinc-200 hover:text-amber-400 shadow-xl transition-all flex items-center gap-1.5 group"
          >
            <Menu className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-xs font-extrabold">ESC / PAUSA</span>
          </button>
        </div>

        {/* Right: Opponent Card */}
        <div className="flex items-center gap-2 sm:gap-3 bg-zinc-950/85 backdrop-blur-md px-3 sm:px-4 py-2 rounded-2xl border border-zinc-800 shadow-xl">
          <div className="text-right">
            <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
              <span className="text-[10px] px-1 rounded bg-rose-500/20 text-rose-400 font-extrabold">{matchState.opponentElo} ELO</span>
              <span className="truncate max-w-[90px] sm:max-w-[140px]">{matchState.opponentName}</span>
            </div>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              {Array.from({ length: matchState.roundsToWin }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-1.5 rounded-full transition-all ${
                    i < matchState.opponentScore ? "bg-rose-500 shadow-sm shadow-rose-500" : "bg-zinc-700"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center font-black text-xs sm:text-sm text-white shadow-inner">
            BOT
          </div>
        </div>

      </div>

      {/* 2. KILLFEED & TELEMETRY SPEEDOMETER */}
      <div className="w-full flex justify-between items-start my-auto pointer-events-none">
        
        {/* Left: Luau Movement Telemetry HUD */}
        <div className="hidden sm:block bg-zinc-950/80 backdrop-blur-md p-3 rounded-2xl border border-zinc-800/80 space-y-1.5 text-xs text-zinc-300 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500">Motor Física Luau 128Hz</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="text-sm font-black text-amber-400 flex items-center gap-1.5">
            <FastForward className="w-4 h-4 text-amber-400" />
            <span>{matchState.telemetry.maxSpeed || 14.5} studs/s</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span>BHop Chain:</span>
            <span className="font-bold text-cyan-400">{matchState.isSliding ? "SLIDING ⚡" : matchState.isDashing ? "AIR DASH 💨" : "NORMAL"}</span>
          </div>
        </div>

        {/* Right: Realtime Killfeed Log */}
        <div className="flex flex-col gap-1.5 items-end ml-auto">
          {matchState.killfeed.map((feed) => (
            <div
              key={feed.id}
              className="bg-zinc-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800/80 text-xs font-bold text-white flex items-center gap-2 shadow-lg animate-in slide-in-from-right-3"
            >
              <span className="text-cyan-400">{feed.killer}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                {feed.weaponName}
              </span>
              {feed.isHeadshot && <span className="text-amber-400 text-xs">🎯 DINK</span>}
              <span className="text-rose-400">{feed.victim}</span>
            </div>
          ))}
        </div>

      </div>

      {/* 3. BOTTOM COMBAT CONTROLS & STATUS BARS */}
      <div className="w-full flex items-end justify-between gap-3">
        
        {/* Left: Health & Stamina Bars */}
        <div className="w-64 sm:w-72 bg-zinc-950/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-zinc-800 shadow-2xl space-y-2">
          
          {/* Health Bar */}
          <div>
            <div className="flex justify-between text-xs font-black text-zinc-200 mb-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>SALUD</span>
              </span>
              <span className={hpPercent > 30 ? "text-emerald-400 font-mono" : "text-rose-500 font-mono animate-pulse font-black"}>
                {matchState.playerHp} / {matchState.playerMaxHp || 100}
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  hpPercent > 50
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : hpPercent > 25
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                    : "bg-gradient-to-r from-rose-600 to-red-500"
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Stamina Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-bold text-zinc-400 mb-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>ESTAMINA (SLIDE / DASH)</span>
              </span>
              <span className="text-cyan-400 font-mono">{Math.round(staminaPercent)}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-75"
                style={{ width: `${staminaPercent}%` }}
              />
            </div>
          </div>

        </div>

        {/* Center: Keybinds Helper (Desktop Only - Quake 1 Full Keyboard Layout) */}
        {!isTouchDevice && (
          <div className="hidden lg:flex items-center flex-wrap justify-center gap-2 bg-zinc-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-zinc-800/80 text-[11px] text-zinc-300 shadow-xl">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-amber-400 font-black tracking-wider uppercase bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">QUAKE 1 TECLADO</span>
            </div>
            <div className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700 font-mono">↑ / ↓</kbd> Mover</div>
            <div className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700 font-mono">← / →</kbd> Girar</div>
            <div className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono">A / D</kbd> <span className="text-zinc-400">o</span> <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono">Alt+←→</kbd> Strafe</div>
            <div className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-300 border border-zinc-700 font-mono">RePág/AvPág</kbd> Vista</div>
            <div className="flex items-center gap-1"><kbd className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 font-mono font-bold">CTRL / Enter</kbd> Disparar</div>
            <div className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono">Espacio</kbd> Salto</div>
            <div className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono">C</kbd> Slide</div>
            <div className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono">Q</kbd> Dash</div>
            <div className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700 font-mono font-bold">ESC</kbd> Pausa</div>
          </div>
        )}

        {/* Right: Weapon & Ammo Card */}
        <div className="w-64 sm:w-72 bg-zinc-950/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-zinc-800 shadow-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
              {currentWeapon.category}
            </div>
            <div className="text-sm sm:text-base font-black text-white">{currentWeapon.name}</div>
            <div className="text-xs text-zinc-400 font-medium">{currentWeapon.equippedSkinId?.toUpperCase()}</div>
          </div>

          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tighter">
              <span className={currentWeapon.currentAmmo <= 5 ? "text-rose-500 animate-pulse" : "text-white"}>
                {currentWeapon.currentAmmo}
              </span>
              <span className="text-zinc-600 text-base sm:text-lg mx-1">/</span>
              <span className="text-zinc-400 text-base sm:text-lg">{currentWeapon.reserveAmmo}</span>
            </div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">MUNICIÓN</div>
          </div>
        </div>

      </div>

      {/* CRT Retro Scanline & Vignette Overlay */}
      {settings.pixelFilter === "crt_retro" && (
        <div className="absolute inset-0 pointer-events-none z-10 opacity-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />
      )}

      {/* 4. CAPACITIVE TOUCH CONTROLS (FOR MOBILE & TABLETS) */}
      {isTouchDevice && (
        <TouchControls
          onMove={onTouchMove || (() => {})}
          onLook={onTouchLook || (() => {})}
          onFireStart={onTouchFireStart || (() => {})}
          onFireEnd={onTouchFireEnd || (() => {})}
          onJump={onTouchJump || (() => {})}
          onSlide={onTouchSlide || (() => {})}
          onDash={onTouchDash || (() => {})}
          onReload={onTouchReload || (() => {})}
          onAimToggle={onTouchAimToggle || (() => {})}
          onSwitchWeapon={onTouchSwitchWeapon || (() => {})}
          isAiming={isAiming}
          sensitivity={settings.mouseSensitivity}
        />
      )}

    </div>
  );
};
