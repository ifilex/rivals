import React from "react";
import { GameSettings } from "../types";
import { Settings as SettingsIcon, Sliders, Volume2, Eye, Crosshair, Keyboard } from "lucide-react";
import { sounds } from "../audio/soundEngine";

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onUpdateSettings }) => {
  const colors = ["#00ff66", "#00ffff", "#ff0055", "#ffff00", "#ffffff", "#ff8800", "#a855f7"];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in select-none">
      
      {/* Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <SettingsIcon className="w-4 h-4" />
            <span>Configuración de Jugabilidad & Accesibilidad</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Ajustes & Mirilla Personalizada</h1>
          <p className="text-xs md:text-sm text-zinc-400">
            Ajusta tu campo de visión (FOV), sensibilidad de ratón, crosshair dinámico y mezclas de sonido
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Crosshair Studio (7 Cols) */}
        <div className="lg:col-span-7 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-base text-white">Editor de Mirilla Custom</h3>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Renderizado en Vivo</span>
          </div>

          {/* Crosshair Live Preview Sandbox */}
          <div className="w-full h-40 bg-zinc-950 rounded-2xl border border-zinc-800 relative flex items-center justify-center overflow-hidden">
            {/* Background Target simulation */}
            <div className="w-20 h-20 rounded-full border border-zinc-800 flex items-center justify-center opacity-30">
              <div className="w-10 h-10 rounded-full border border-zinc-700"></div>
            </div>

            {/* Rendered Crosshair */}
            <div className="relative flex items-center justify-center">
              {settings.crosshair.dot && (
                <div
                  className="rounded-full absolute"
                  style={{
                    width: `${settings.crosshair.size}px`,
                    height: `${settings.crosshair.size}px`,
                    backgroundColor: settings.crosshair.color,
                  }}
                />
              )}
              {/* Lines */}
              <div
                className="absolute w-[2px]"
                style={{
                  height: `${settings.crosshair.size * 2}px`,
                  backgroundColor: settings.crosshair.color,
                  transform: `translateY(-${settings.crosshair.gap}px)`,
                }}
              />
              <div
                className="absolute w-[2px]"
                style={{
                  height: `${settings.crosshair.size * 2}px`,
                  backgroundColor: settings.crosshair.color,
                  transform: `translateY(${settings.crosshair.gap}px)`,
                }}
              />
              <div
                className="absolute h-[2px]"
                style={{
                  width: `${settings.crosshair.size * 2}px`,
                  backgroundColor: settings.crosshair.color,
                  transform: `translateX(-${settings.crosshair.gap}px)`,
                }}
              />
              <div
                className="absolute h-[2px]"
                style={{
                  width: `${settings.crosshair.size * 2}px`,
                  backgroundColor: settings.crosshair.color,
                  transform: `translateX(${settings.crosshair.gap}px)`,
                }}
              />
            </div>
          </div>

          {/* Crosshair Controls */}
          <div className="space-y-4 text-xs">
            {/* Color Palette */}
            <div>
              <label className="text-zinc-300 font-bold block mb-2">Color de la Mirilla</label>
              <div className="flex items-center gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      sounds.playUiClick();
                      onUpdateSettings({ crosshair: { ...settings.crosshair, color: c } });
                    }}
                    className={`w-7 h-7 rounded-xl border-2 transition-all ${
                      settings.crosshair.color === c ? "scale-110 border-white shadow-md" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Gap & Size Sliders */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-zinc-300 font-bold mb-1">
                  <span>Espaciado (Gap)</span>
                  <span className="text-emerald-400">{settings.crosshair.gap}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  value={settings.crosshair.gap}
                  onChange={(e) =>
                    onUpdateSettings({ crosshair: { ...settings.crosshair, gap: parseInt(e.target.value) } })
                  }
                  className="w-full accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 font-bold mb-1">
                  <span>Tamaño (Size)</span>
                  <span className="text-emerald-400">{settings.crosshair.size}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="14"
                  value={settings.crosshair.size}
                  onChange={(e) =>
                    onUpdateSettings({ crosshair: { ...settings.crosshair, size: parseInt(e.target.value) } })
                  }
                  className="w-full accent-emerald-400"
                />
              </div>
            </div>

            {/* Dot Toggle */}
            <div className="flex items-center justify-between pt-2">
              <span className="font-bold text-zinc-300">Punto Central (Center Dot)</span>
              <button
                onClick={() =>
                  onUpdateSettings({ crosshair: { ...settings.crosshair, dot: !settings.crosshair.dot } })
                }
                className={`px-3 py-1 rounded-xl font-bold text-xs ${
                  settings.crosshair.dot ? "bg-emerald-500 text-zinc-950" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {settings.crosshair.dot ? "Activado" : "Desactivado"}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Mouse, Audio & FOV Sliders (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Sens & FOV */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-base text-white">Cámara, Gráficos & Filtro 8-Bits</h3>
            </div>

            <div className="space-y-3 text-xs">
              {/* 8-Bit Retro Filter Selector */}
              <div>
                <label className="text-zinc-300 font-bold block mb-1">Filtro de Renderizado Retro (8-Bits)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      sounds.playUiClick();
                      onUpdateSettings({ pixelFilter: "pixel_8bit" });
                    }}
                    className={`py-2 px-2 rounded-xl font-black text-[11px] border transition-all ${
                      settings.pixelFilter === "pixel_8bit"
                        ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-md scale-102"
                        : "bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    👾 8-Bit Retro
                  </button>
                  <button
                    onClick={() => {
                      sounds.playUiClick();
                      onUpdateSettings({ pixelFilter: "crt_retro" });
                    }}
                    className={`py-2 px-2 rounded-xl font-black text-[11px] border transition-all ${
                      settings.pixelFilter === "crt_retro"
                        ? "bg-cyan-500 text-zinc-950 border-cyan-400 shadow-md scale-102"
                        : "bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    📺 CRT Arcade
                  </button>
                  <button
                    onClick={() => {
                      sounds.playUiClick();
                      onUpdateSettings({ pixelFilter: "hd" });
                    }}
                    className={`py-2 px-2 rounded-xl font-black text-[11px] border transition-all ${
                      settings.pixelFilter === "hd"
                        ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md scale-102"
                        : "bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    ✨ HD Crisp
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 font-bold mb-1">
                  <span>Campo de Visión (FOV)</span>
                  <span className="text-amber-400">{settings.fov}°</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="120"
                  value={settings.fov}
                  onChange={(e) => onUpdateSettings({ fov: parseInt(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 font-bold mb-1">
                  <span>Velocidad de Giro por Teclado (Quake 1)</span>
                  <span className="text-amber-400 font-mono">{(settings.keyboardTurnSpeed || 2.8).toFixed(1)} rad/s</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="6.0"
                  step="0.2"
                  value={settings.keyboardTurnSpeed || 2.8}
                  onChange={(e) => onUpdateSettings({ keyboardTurnSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 font-bold mb-1">
                  <span>Sensibilidad del Ratón (Opcional)</span>
                  <span className="text-cyan-400">{settings.mouseSensitivity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.05"
                  value={settings.mouseSensitivity}
                  onChange={(e) => onUpdateSettings({ mouseSensitivity: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Audio Mix */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-purple-400" />
              <h3 className="font-extrabold text-base text-white">Mezclador de Audio</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-zinc-300 font-bold mb-1">
                  <span>Efectos de Disparo & Hitmarker</span>
                  <span className="text-purple-400">{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
                  className="w-full accent-purple-400"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Quake 1 Pure Keyboard Layout Reference Card */}
      <div className="bg-zinc-900/85 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-white">Configuración 100% Teclado Estilo Quake 1</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold">
            ⚡ CERO RATÓN NECESARIO
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-zinc-950/70 border border-zinc-800/80 p-4 rounded-2xl space-y-2">
            <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">Movimiento & Giros</div>
            <ul className="space-y-1.5 text-zinc-300">
              <li className="flex justify-between"><span>Avanzar / Retroceder:</span> <kbd className="font-mono text-amber-300 bg-zinc-800 px-1.5 py-0.5 rounded">↑ / ↓</kbd></li>
              <li className="flex justify-between"><span>Girar Cámara (Yaw):</span> <kbd className="font-mono text-amber-300 bg-zinc-800 px-1.5 py-0.5 rounded">← / →</kbd></li>
              <li className="flex justify-between"><span>Giro Rápido (Turbo):</span> <kbd className="font-mono text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded">Shift + ←→</kbd></li>
              <li className="flex justify-between"><span>Desplazamiento (Strafe):</span> <kbd className="font-mono text-cyan-300 bg-zinc-800 px-1.5 py-0.5 rounded">A / D o Alt+←→</kbd></li>
            </ul>
          </div>

          <div className="bg-zinc-950/70 border border-zinc-800/80 p-4 rounded-2xl space-y-2">
            <div className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">Inclinación & Combate</div>
            <ul className="space-y-1.5 text-zinc-300">
              <li className="flex justify-between"><span>Mirar Arriba (+lookup):</span> <kbd className="font-mono text-cyan-300 bg-zinc-800 px-1.5 py-0.5 rounded">Re Pág / Home</kbd></li>
              <li className="flex justify-between"><span>Mirar Abajo (+lookdown):</span> <kbd className="font-mono text-cyan-300 bg-zinc-800 px-1.5 py-0.5 rounded">Av Pág / Del</kbd></li>
              <li className="flex justify-between"><span>Centrar Vista:</span> <kbd className="font-mono text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded">Fin (End) / K</kbd></li>
              <li className="flex justify-between"><span>Disparar (+attack):</span> <kbd className="font-mono text-rose-300 bg-rose-950 border border-rose-800 px-1.5 py-0.5 rounded font-bold">CTRL / Enter</kbd></li>
            </ul>
          </div>

          <div className="bg-zinc-950/70 border border-zinc-800/80 p-4 rounded-2xl space-y-2">
            <div className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">Habilidades & Acciones</div>
            <ul className="space-y-1.5 text-zinc-300">
              <li className="flex justify-between"><span>Salto / BHop (+jump):</span> <kbd className="font-mono text-emerald-300 bg-zinc-800 px-1.5 py-0.5 rounded">Espacio</kbd></li>
              <li className="flex justify-between"><span>Slide / Deslizarse:</span> <kbd className="font-mono text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded">C / X</kbd></li>
              <li className="flex justify-between"><span>Dash / Impulso:</span> <kbd className="font-mono text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded">Q / Tab</kbd></li>
              <li className="flex justify-between"><span>Recargar / Inspeccionar:</span> <kbd className="font-mono text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded">R / F</kbd></li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};
