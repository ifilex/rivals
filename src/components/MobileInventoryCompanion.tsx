import React from "react";
import { PlayerProfile, Weapon } from "../types";
import { Smartphone, Trophy, Layers, Sparkles, X, Shield, Coins } from "lucide-react";
import { sounds } from "../audio/soundEngine";

interface MobileInventoryCompanionProps {
  player: PlayerProfile;
  weapons: Weapon[];
  currentWeapon: Weapon;
  onSelectWeapon: (weapon: Weapon) => void;
  onClose: () => void;
}

export const MobileInventoryCompanion: React.FC<MobileInventoryCompanionProps> = ({
  player,
  weapons,
  currentWeapon,
  onSelectWeapon,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 overflow-y-auto p-4 flex flex-col justify-between select-none">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">RIVALS Mobile Companion</h2>
            <p className="text-[11px] text-zinc-400">Gestión de Inventario & Carga Remota</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Player Card */}
      <div className="my-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-black text-white">{player.username}</div>
            <div className="text-xs text-amber-400 font-bold">{player.rankTier.replace("_", " ")} • {player.elo} ELO</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-emerald-400">Sincronizado</div>
            <div className="text-[10px] text-zinc-500">AES-256 Cloud</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80">
          <div className="p-2 rounded-xl bg-zinc-950 text-center">
            <div className="text-[10px] text-zinc-500">Monedas</div>
            <div className="text-xs font-black text-amber-400">🪙 {player.rivalsCoins.toLocaleString()}</div>
          </div>
          <div className="p-2 rounded-xl bg-zinc-950 text-center">
            <div className="text-[10px] text-zinc-500">Diamantes</div>
            <div className="text-xs font-black text-cyan-400">💎 {player.gems}</div>
          </div>
        </div>
      </div>

      {/* Weapon Quick Selector */}
      <div className="space-y-3 flex-1">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Armamento Equipado para 1v1
        </div>

        <div className="space-y-2.5">
          {weapons.map((w) => {
            const isEquipped = currentWeapon.id === w.id;
            return (
              <div
                key={w.id}
                onClick={() => {
                  sounds.playUiClick();
                  onSelectWeapon(w);
                }}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  isEquipped ? "bg-zinc-800 border-amber-400 shadow-md" : "bg-zinc-900/60 border-zinc-800"
                }`}
              >
                <div>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-zinc-950 text-amber-400">
                    {w.category}
                  </span>
                  <div className="text-sm font-black text-white mt-0.5">{w.name}</div>
                  <div className="text-[11px] text-zinc-400">Skin: {w.equippedSkinId.toUpperCase()}</div>
                </div>

                <button
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    isEquipped ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {isEquipped ? "✓ En Uso" : "Equipar"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Dismiss */}
      <button
        onClick={onClose}
        className="w-full py-3.5 mt-4 rounded-2xl bg-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg"
      >
        Volver a la Pantalla Principal
      </button>

    </div>
  );
};
