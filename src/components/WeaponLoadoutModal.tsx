import React, { useState } from "react";
import { Weapon, WeaponSkin, PlayerProfile } from "../types";
import { Sparkles, Crosshair, Zap, Shield, RotateCw, Check, Lock, Gift } from "lucide-react";
import { sounds } from "../audio/soundEngine";
import confetti from "canvas-confetti";

interface WeaponLoadoutModalProps {
  weapons: Weapon[];
  currentWeapon: Weapon;
  player: PlayerProfile;
  onSelectWeapon: (weapon: Weapon) => void;
  onEquipSkin: (weaponId: string, skinId: string) => void;
  onUnlockSkin: (weaponId: string, skin: WeaponSkin, cost: number) => void;
}

export const WeaponLoadoutModal: React.FC<WeaponLoadoutModalProps> = ({
  weapons,
  currentWeapon,
  player,
  onSelectWeapon,
  onEquipSkin,
  onUnlockSkin,
}) => {
  const [activeWeapon, setActiveWeapon] = useState<Weapon>(currentWeapon);
  const [inspectRotation, setInspectRotation] = useState(0);
  const [unboxingCrate, setUnboxingCrate] = useState(false);
  const [wonSkin, setWonSkin] = useState<WeaponSkin | null>(null);

  const equippedSkin = activeWeapon.skins.find((s) => s.id === activeWeapon.equippedSkinId) || activeWeapon.skins[0];

  const handleOpenCrate = () => {
    if (player.rivalsCoins < 2500) {
      alert("Necesitas 2,500 RIVALS Coins para abrir una caja Cyber Void.");
      return;
    }

    sounds.playUiClick();
    setUnboxingCrate(true);
    setWonSkin(null);

    setTimeout(() => {
      // Pick random locked skin
      const allSkins = activeWeapon.skins;
      const randomSkin = allSkins[Math.floor(Math.random() * allSkins.length)];
      setWonSkin(randomSkin);
      onUnlockSkin(activeWeapon.id, randomSkin, 2500);
      setUnboxingCrate(false);

      sounds.playRoundWin();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 2200);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Armería Competitiva & Skins Exclusivas</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Arsenal de Duelos RIVALS</h1>
          <p className="text-xs md:text-sm text-zinc-400">Personaliza tus envolturas de armas, miras réflex y camuflajes de Temporada 4</p>
        </div>

        {/* Crate Unboxing Button */}
        <button
          onClick={handleOpenCrate}
          disabled={unboxingCrate}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 font-black text-xs text-white shadow-xl shadow-rose-950/40 hover:opacity-95 transition-all flex items-center gap-2.5"
        >
          <Gift className="w-4 h-4" />
          <span>{unboxingCrate ? "Abriendo Caja..." : "Abrir Caja Cyber Void (2,500 🪙)"}</span>
        </button>
      </div>

      {/* Main Grid: Left Weapon List, Center 3D Showcase, Right Stats & Skins */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Left: Weapon Picker (3 Cols) */}
        <div className="lg:col-span-3 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Selecciona Arma
          </div>
          {weapons.map((w) => {
            const isSelected = activeWeapon.id === w.id;
            const isEquipped = currentWeapon.id === w.id;
            return (
              <button
                key={w.id}
                onClick={() => {
                  sounds.playUiClick();
                  setActiveWeapon(w);
                  onSelectWeapon(w);
                }}
                className={`w-full p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? "bg-zinc-800/90 border-amber-400/80 shadow-lg"
                    : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-zinc-950/60 text-amber-400 uppercase">
                    {w.category}
                  </span>
                  {isEquipped && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      EQUIPADA
                    </span>
                  )}
                </div>
                <div className="font-extrabold text-sm text-white mt-1">{w.name}</div>
                <div className="text-xs text-zinc-400 mt-0.5">{w.currentAmmo} / {w.reserveAmmo} Balas • {w.damageHead} Cabeza</div>
              </button>
            );
          })}
        </div>

        {/* 2. Center: 3D-styled Weapon Inspection Showcase (5 Cols) */}
        <div className="lg:col-span-5 bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between items-center relative overflow-hidden min-h-[420px]">
          
          {/* Top Label */}
          <div className="w-full flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-400">Inspección de Arma 3D</span>
            <span
              className="px-2 py-0.5 rounded-full font-black text-[10px] uppercase border"
              style={{
                borderColor: equippedSkin.colorHex,
                color: equippedSkin.colorHex,
                backgroundColor: `${equippedSkin.colorHex}22`,
              }}
            >
              {equippedSkin.rarity}
            </span>
          </div>

          {/* Animated 3D Stylized Gun Visualizer */}
          <div className="relative my-auto flex flex-col items-center justify-center">
            
            {/* Background Glow */}
            <div
              className="absolute w-56 h-56 rounded-full blur-3xl opacity-30 transition-all duration-500"
              style={{ backgroundColor: equippedSkin.accentHex }}
            />

            {/* Gun Silhouette Simulation with Skin Colors */}
            <div
              className="relative transition-transform duration-300 transform"
              style={{ transform: `rotate(${inspectRotation}deg)` }}
            >
              <div
                className="w-64 h-24 rounded-2xl border-2 flex items-center justify-center p-4 shadow-2xl relative overflow-hidden"
                style={{
                  backgroundColor: equippedSkin.colorHex,
                  borderColor: equippedSkin.accentHex,
                }}
              >
                {/* Visual patterns */}
                {equippedSkin.pattern === "CYBER" && (
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px]" />
                )}
                {equippedSkin.pattern === "GOLD" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-yellow-200/40 to-amber-500/20 animate-pulse" />
                )}
                <div className="text-center z-10">
                  <div className="font-black text-lg text-white drop-shadow-md">{activeWeapon.name}</div>
                  <div className="text-xs font-bold text-white/90">{equippedSkin.name}</div>
                </div>
              </div>
            </div>

            {/* Won Skin Popup Notification */}
            {wonSkin && (
              <div className="mt-4 p-3 bg-zinc-950/90 border border-amber-400 rounded-2xl text-center animate-in zoom-in-95 shadow-xl">
                <div className="text-xs font-bold text-amber-400">¡NUEVA SKIN DESBLOQUEADA!</div>
                <div className="text-sm font-black text-white">{wonSkin.name} ({wonSkin.rarity})</div>
              </div>
            )}
          </div>

          {/* Bottom Inspect Controls */}
          <div className="w-full flex items-center justify-between">
            <button
              onClick={() => {
                sounds.playUiClick();
                setInspectRotation((prev) => prev + 45);
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 flex items-center gap-1.5 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Girar Vista</span>
            </button>
            <div className="text-[11px] text-zinc-500">Presiona 'F' durante el juego para inspeccionar</div>
          </div>

        </div>

        {/* 3. Right: Stats Radar & Skin Inventory (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Stats Box */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Estadísticas de Combate
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between font-bold text-zinc-300 mb-1">
                  <span>Daño a la Cabeza</span>
                  <span className="text-amber-400">{activeWeapon.damageHead} HP</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(activeWeapon.damageHead / 160) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-zinc-300 mb-1">
                  <span>Cadencia de Fuego</span>
                  <span className="text-cyan-400">{activeWeapon.fireRate} rps</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(activeWeapon.fireRate / 14) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-zinc-300 mb-1">
                  <span>Capacidad de Cargador</span>
                  <span className="text-emerald-400">{activeWeapon.magazineSize} proyectiles</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(activeWeapon.magazineSize / 35) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-zinc-300 mb-1">
                  <span>Tiempo de Recarga</span>
                  <span className="text-purple-400">{activeWeapon.reloadTime}s</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(1 - activeWeapon.reloadTime / 3) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Skin Selection Palette */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Colección de Skins para {activeWeapon.name}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {activeWeapon.skins.map((s) => {
                const isEquippedSkin = activeWeapon.equippedSkinId === s.id;
                const isUnlocked = s.unlocked || player.unlockedSkins.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      sounds.playUiClick();
                      if (isUnlocked) {
                        onEquipSkin(activeWeapon.id, s.id);
                      } else {
                        onUnlockSkin(activeWeapon.id, s, 1500);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isEquippedSkin
                        ? "bg-zinc-800 border-amber-400 shadow-md"
                        : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: s.accentHex }}
                      />
                      <span className="text-[10px] font-bold text-zinc-400">{s.rarity}</span>
                    </div>
                    <div className="font-extrabold text-xs text-white truncate">{s.name}</div>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      {isEquippedSkin ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Equipada
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-zinc-400">Desbloqueada</span>
                      ) : (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> 1,500 🪙
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
