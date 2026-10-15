import React from "react";
import { Play, RotateCcw, Settings, LogOut, Volume2, Shield, Crosshair, Compass } from "lucide-react";
import { GameSettings, MatchState } from "../types";
import { sounds } from "../audio/soundEngine";

interface PauseMenuModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestartRound: () => void;
  onExitToMenu: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  matchState: MatchState;
}

export const PauseMenuModal: React.FC<PauseMenuModalProps> = ({
  isOpen,
  onResume,
  onRestartRound,
  onExitToMenu,
  settings,
  onUpdateSettings,
  matchState,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="pause-menu-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="pause-menu-card"
        className="w-full max-w-lg bg-zinc-950/95 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/20 text-zinc-100 flex flex-col gap-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-400 font-extrabold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>PARTIDA EN PAUSA</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">MENÚ TÁCTICO DE DUELO</h2>
          </div>

          <div className="text-right">
            <div className="text-xs text-zinc-400 font-bold">Ronda {matchState.round}</div>
            <div className="text-base font-black">
              <span className="text-emerald-400">{matchState.playerScore}</span>
              <span className="text-zinc-600 mx-1">-</span>
              <span className="text-rose-400">{matchState.opponentScore}</span>
            </div>
          </div>
        </div>

        {/* Quick Adjustment Sliders */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 space-y-4">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Ajustes Rápidos</span>
          </div>

          {/* 8-Bit Pixel Filter Selector */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-zinc-300">
              <span>Filtro Gráfico 8-Bits</span>
              <span className="text-amber-400 font-mono font-bold uppercase">{settings.pixelFilter || "pixel_8bit"}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  sounds.playUiClick();
                  onUpdateSettings({ ...settings, pixelFilter: "pixel_8bit" });
                }}
                className={`py-1.5 rounded-xl font-bold text-xs border transition-all ${
                  settings.pixelFilter === "pixel_8bit"
                    ? "bg-amber-500 text-zinc-950 border-amber-400 font-black"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800"
                }`}
              >
                👾 8-Bit
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playUiClick();
                  onUpdateSettings({ ...settings, pixelFilter: "crt_retro" });
                }}
                className={`py-1.5 rounded-xl font-bold text-xs border transition-all ${
                  settings.pixelFilter === "crt_retro"
                    ? "bg-cyan-500 text-zinc-950 border-cyan-400 font-black"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800"
                }`}
              >
                📺 CRT
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playUiClick();
                  onUpdateSettings({ ...settings, pixelFilter: "hd" });
                }}
                className={`py-1.5 rounded-xl font-bold text-xs border transition-all ${
                  settings.pixelFilter === "hd"
                    ? "bg-emerald-500 text-zinc-950 border-emerald-400 font-black"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800"
                }`}
              >
                ✨ HD
              </button>
            </div>
          </div>

          {/* Keyboard Turn Speed (Quake 1) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-zinc-300">
              <span>Velocidad Giro Teclado (Quake 1)</span>
              <span className="text-amber-400 font-mono font-bold">{(settings.keyboardTurnSpeed || 2.8).toFixed(1)} rad/s</span>
            </div>
            <input
              id="pause-turn-speed-slider"
              type="range"
              min="1.0"
              max="6.0"
              step="0.2"
              value={settings.keyboardTurnSpeed || 2.8}
              onChange={(e) => {
                onUpdateSettings({ ...settings, keyboardTurnSpeed: parseFloat(e.target.value) });
              }}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Mouse Sensitivity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-zinc-300">
              <span>Sensibilidad de Ratón</span>
              <span className="text-cyan-400 font-mono font-bold">{settings.mouseSensitivity.toFixed(1)}</span>
            </div>
            <input
              id="pause-sens-slider"
              type="range"
              min="0.2"
              max="4.0"
              step="0.1"
              value={settings.mouseSensitivity}
              onChange={(e) => {
                onUpdateSettings({ ...settings, mouseSensitivity: parseFloat(e.target.value) });
              }}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Field of View (FOV) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-zinc-300">
              <span>Campo de Visión (FOV)</span>
              <span className="text-cyan-400 font-mono font-bold">{settings.fov}°</span>
            </div>
            <input
              id="pause-fov-slider"
              type="range"
              min="75"
              max="115"
              step="1"
              value={settings.fov}
              onChange={(e) => {
                onUpdateSettings({ ...settings, fov: parseInt(e.target.value) });
              }}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Volume */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-zinc-300">
              <span>Volumen Maestro</span>
              <span className="text-emerald-400 font-mono font-bold">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              id="pause-vol-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => {
                onUpdateSettings({ ...settings, masterVolume: parseFloat(e.target.value) });
              }}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Resume */}
          <button
            id="pause-btn-resume"
            onClick={() => {
              sounds.playUiClick();
              onResume();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-violet-600 hover:opacity-95 font-black text-base text-white shadow-xl shadow-rose-950/40 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>CONTINUAR DUELO (ESC)</span>
          </button>

          {/* Restart Round */}
          <button
            id="pause-btn-restart"
            onClick={() => {
              sounds.playUiClick();
              onRestartRound();
            }}
            className="w-full py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 font-bold text-sm text-zinc-200 hover:text-amber-400 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>REINICIAR POSICIÓN DE RONDA</span>
          </button>

          {/* Exit to Main Menu */}
          <button
            id="pause-btn-exit"
            onClick={() => {
              sounds.playUiClick();
              onExitToMenu();
            }}
            className="w-full py-3.5 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/80 font-bold text-sm text-rose-300 hover:text-white active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>ABANDONAR Y SALIR AL MENÚ PRINCIPAL</span>
          </button>
        </div>

        {/* Helper Footer */}
        <div className="text-center text-xs text-zinc-500 font-medium">
          Presiona <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">ESC</kbd> en cualquier momento para pausar o desbloquear el cursor.
        </div>
      </div>
    </div>
  );
};
