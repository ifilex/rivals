import React, { useState } from "react";
import { LuauMod } from "../types";
import { INITIAL_LUAU_MODS } from "../data/defaultData";
import { Code2, Play, Heart, Download, Sparkles, Terminal, Check, Sliders } from "lucide-react";
import { sounds } from "../audio/soundEngine";

interface LuauModStudioProps {
  activeMod: LuauMod | null;
  onApplyMod: (mod: LuauMod | null) => void;
}

export const LuauModStudio: React.FC<LuauModStudioProps> = ({ activeMod, onApplyMod }) => {
  const [mods, setMods] = useState<LuauMod[]>(INITIAL_LUAU_MODS);
  const [selectedMod, setSelectedMod] = useState<LuauMod>(INITIAL_LUAU_MODS[0]);
  const [editorCode, setEditorCode] = useState(INITIAL_LUAU_MODS[0].scriptCode);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[Luau Runtime v2.4] Initialized dedicated physics sandbox",
    "[Luau Engine] Ready to inject custom scripts at 128Hz",
  ]);

  const handleSelectMod = (mod: LuauMod) => {
    sounds.playUiClick();
    setSelectedMod(mod);
    setEditorCode(mod.scriptCode);
  };

  const handleRunScript = () => {
    sounds.playUiClick();
    const updatedMod: LuauMod = {
      ...selectedMod,
      scriptCode: editorCode,
    };
    onApplyMod(updatedMod);

    setConsoleLogs((prev) => [
      ...prev,
      `[Luau Sandbox] Successfully compiled: "${selectedMod.title}"`,
      `[Luau Physics] Injected parameters: Speed x${selectedMod.parameters.speedMultiplier || 1.0}, Gravity x${selectedMod.parameters.gravityMultiplier || 1.0}`,
    ]);
  };

  const handleToggleActive = (mod: LuauMod) => {
    sounds.playUiClick();
    if (activeMod?.id === mod.id) {
      onApplyMod(null);
      setConsoleLogs((prev) => [...prev, `[Luau Engine] Mod "${mod.title}" desactivado. Regresando a física estándar.`]);
    } else {
      onApplyMod(mod);
      setConsoleLogs((prev) => [...prev, `[Luau Engine] Mod "${mod.title}" activado exitosamente.`]);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in select-none">
      
      {/* Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Code2 className="w-4 h-4" />
            <span>Sandbox de Mods de la Comunidad & Motor Luau</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Luau Scripting Studio</h1>
          <p className="text-xs md:text-sm text-zinc-400">
            Escribe scripts en Luau, altera la física de movimiento de Roblox y prueba mutadores en tiempo real
          </p>
        </div>

        {activeMod && (
          <div className="px-4 py-2 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-black text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>MOD ACTIVO: {activeMod.title}</span>
          </div>
        )}
      </div>

      {/* Grid: Left Mod Browser, Right Code Editor & Sandbox Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Community Mods Catalog (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Mods Comunitarios Populares
          </div>

          <div className="space-y-3">
            {mods.map((m) => {
              const isSelected = selectedMod.id === m.id;
              const isActive = activeMod?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectMod(m)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-zinc-800/90 border-cyan-400 shadow-lg"
                      : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-zinc-950 text-cyan-400">
                      {m.category}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3 text-zinc-400" />
                        <span>{m.downloads.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400" />
                        <span>{m.likes.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  <div className="font-black text-sm text-white mt-1.5">{m.title}</div>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{m.description}</p>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/80">
                    <span className="text-[11px] text-zinc-500 font-medium">Por: {m.author}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleActive(m);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                        isActive
                          ? "bg-emerald-500 text-white shadow-md"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                      }`}
                    >
                      {isActive ? "✓ Activado" : "Activar Mod"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Luau Script Editor & Execution Terminal (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Editor Header */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-zinc-900/90 px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="text-xs font-mono font-bold text-zinc-400 ml-2">
                  {selectedMod.title.replace(/\s+/g, "_").toLowerCase()}.luau
                </span>
              </div>

              <button
                onClick={handleRunScript}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white flex items-center gap-1.5 transition-all shadow-md"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Ejecutar en Sandbox</span>
              </button>
            </div>

            {/* Code Textarea */}
            <div className="p-4 bg-zinc-950 font-mono text-xs">
              <textarea
                value={editorCode}
                onChange={(e) => setEditorCode(e.target.value)}
                rows={12}
                className="w-full bg-transparent text-emerald-400 focus:outline-none resize-none leading-relaxed font-mono selection:bg-cyan-500/30"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Real-Time Parameter Sliders */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Ajustes Rápidos de Física Luau</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Velocidad de Movimiento</span>
                  <span className="text-cyan-400 font-bold">{selectedMod.parameters.speedMultiplier || 1.0}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={selectedMod.parameters.speedMultiplier || 1.0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSelectedMod({
                      ...selectedMod,
                      parameters: { ...selectedMod.parameters, speedMultiplier: val },
                    });
                  }}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Gravedad Luau</span>
                  <span className="text-amber-400 font-bold">{selectedMod.parameters.gravityMultiplier || 1.0}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  value={selectedMod.parameters.gravityMultiplier || 1.0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSelectedMod({
                      ...selectedMod,
                      parameters: { ...selectedMod.parameters, gravityMultiplier: val },
                    });
                  }}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Potencia de Salto (BHop)</span>
                  <span className="text-emerald-400 font-bold">{selectedMod.parameters.jumpPowerMultiplier || 1.0}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={selectedMod.parameters.jumpPowerMultiplier || 1.0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSelectedMod({
                      ...selectedMod,
                      parameters: { ...selectedMod.parameters, jumpPowerMultiplier: val },
                    });
                  }}
                  className="w-full accent-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Console / Output Terminal */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Consola Luau 128Hz</span>
            </div>
            <div className="bg-zinc-900/60 p-3 rounded-2xl font-mono text-[11px] text-zinc-300 space-y-1 max-h-32 overflow-y-auto">
              {consoleLogs.map((log, i) => (
                <div key={i} className="text-emerald-400/90">
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
