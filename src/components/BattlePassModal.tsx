import React, { useState } from "react";
import { Flame, Sparkles, Gift, Check, Lock, Star, Trophy, Crown } from "lucide-react";
import { PlayerProfile } from "../types";
import { sounds } from "../audio/soundEngine";
import confetti from "canvas-confetti";

interface BattlePassModalProps {
  player: PlayerProfile;
  onUpdatePlayer: (updated: Partial<PlayerProfile>) => void;
}

export const BattlePassModal: React.FC<BattlePassModalProps> = ({ player, onUpdatePlayer }) => {
  const [claimedTiers, setClaimedTiers] = useState<number[]>([1, 2]);
  const [hasPremiumPass, setHasPremiumPass] = useState(false);

  const tiers = Array.from({ length: 20 }, (_, i) => {
    const tierNum = i + 1;
    let rewardName = `${1000 * tierNum} RIVALS Coins`;
    let rewardType: "COINS" | "GEMS" | "SKIN" | "TITLE" = "COINS";
    let rewardIcon = "🪙";

    if (tierNum % 5 === 0) {
      rewardName = `${50 * tierNum} Diamantes`;
      rewardType = "GEMS";
      rewardIcon = "💎";
    } else if (tierNum === 10) {
      rewardName = "Skin Épica: Sub-9 Glacial Frost";
      rewardType = "SKIN";
      rewardIcon = "🔫";
    } else if (tierNum === 20) {
      rewardName = "Skin Legendaria: AR-X Void Singularity";
      rewardType = "SKIN";
      rewardIcon = "👑";
    }

    return {
      tier: tierNum,
      xpRequired: tierNum * 500,
      rewardName,
      rewardType,
      rewardIcon,
      isPremiumOnly: tierNum % 2 === 0,
    };
  });

  const handleClaim = (tierNum: number, rewardType: string) => {
    sounds.playUiClick();
    if (claimedTiers.includes(tierNum)) return;

    setClaimedTiers([...claimedTiers, tierNum]);
    sounds.playRoundWin();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });

    if (rewardType === "COINS") {
      onUpdatePlayer({ rivalsCoins: player.rivalsCoins + 2500 });
    } else if (rewardType === "GEMS") {
      onUpdatePlayer({ gems: player.gems + 100 });
    }
  };

  const handleBuyPremium = () => {
    if (player.gems < 450) {
      alert("Necesitas 450 Gemas para el Pase Premium Cyber Void.");
      return;
    }
    sounds.playRoundWin();
    setHasPremiumPass(true);
    onUpdatePlayer({ gems: player.gems - 450 });
    confetti({ particleCount: 100, spread: 80 });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in select-none">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-r from-purple-950 via-zinc-900 to-rose-950 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-extrabold text-xs uppercase tracking-widest border border-rose-500/30">
              TEMPORADA 4 ACTIVA
            </span>
            <span className="text-xs text-zinc-400 font-medium">Finaliza en 12 días</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">Cyber Void Battle Pass</h1>
          <p className="text-xs md:text-sm text-zinc-300 max-w-xl">
            Sube de nivel en partidas 1v1 competitivas y desbloquea 20 niveles de skins legendarias, gemas y títulos exclusivos.
          </p>

          {/* Current Level Bar */}
          <div className="pt-2">
            <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
              <span>Nivel Actual: 4 (1,850 / 2,000 XP)</span>
              <span className="text-amber-400">92%</span>
            </div>
            <div className="w-72 h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
              <div className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full" style={{ width: "92%" }} />
            </div>
          </div>
        </div>

        <div className="z-10 shrink-0">
          {!hasPremiumPass ? (
            <button
              onClick={handleBuyPremium}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-950/40 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>Desbloquear Pase Premium (450 💎)</span>
            </button>
          ) : (
            <div className="px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>PASE PREMIUM CYBER VOID ACTIVO</span>
            </div>
          )}
        </div>
      </div>

      {/* Rewards Grid Track */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Ruta de Recompensas de Temporada
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {tiers.map((t) => {
            const isUnlocked = t.tier <= 4;
            const isClaimed = claimedTiers.includes(t.tier);
            const isLockedPremium = t.isPremiumOnly && !hasPremiumPass;

            return (
              <div
                key={t.tier}
                className={`p-4 rounded-2xl border flex flex-col justify-between relative transition-all ${
                  isClaimed
                    ? "bg-zinc-950/60 border-zinc-800/80 opacity-70"
                    : isUnlocked && !isLockedPremium
                    ? "bg-zinc-900/90 border-amber-400/80 shadow-lg shadow-amber-950/20"
                    : "bg-zinc-950/40 border-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-black text-white">Nivel {t.tier}</span>
                  {t.isPremiumOnly && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-black text-[9px] uppercase">
                      PREMIUM
                    </span>
                  )}
                </div>

                <div className="my-4 text-center">
                  <div className="text-3xl mb-1">{t.rewardIcon}</div>
                  <div className="font-extrabold text-xs text-white leading-tight">{t.rewardName}</div>
                </div>

                <div>
                  {isClaimed ? (
                    <div className="w-full py-1.5 rounded-xl bg-zinc-900 text-zinc-500 font-bold text-center text-xs flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Reclamado
                    </div>
                  ) : isUnlocked && !isLockedPremium ? (
                    <button
                      onClick={() => handleClaim(t.tier, t.rewardType)}
                      className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs transition-colors shadow-md"
                    >
                      Reclamar
                    </button>
                  ) : (
                    <div className="w-full py-1.5 rounded-xl bg-zinc-900/80 text-zinc-500 font-bold text-center text-xs flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" /> {isLockedPremium ? "Requiere Pase" : "Bloqueado"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
