import React, { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { GameHUD } from "./components/GameHUD";
import { PauseMenuModal } from "./components/PauseMenuModal";
import { MatchmakingModal } from "./components/MatchmakingModal";
import { WeaponLoadoutModal } from "./components/WeaponLoadoutModal";
import { LeaderboardModal } from "./components/LeaderboardModal";
import { BattlePassModal } from "./components/BattlePassModal";
import { LuauModStudio } from "./components/LuauModStudio";
import { AntiCheatModal } from "./components/AntiCheatModal";
import { AnalyticsAiModal } from "./components/AnalyticsAiModal";
import { CustomServerModal } from "./components/CustomServerModal";
import { SupportChatModal } from "./components/SupportChatModal";
import { SettingsModal } from "./components/SettingsModal";
import { MobileInventoryCompanion } from "./components/MobileInventoryCompanion";
import { ThreeGameEngine } from "./game/threeEngine";
import { 
  DEFAULT_PLAYER_PROFILE, 
  DEFAULT_GAME_SETTINGS, 
  INITIAL_MATCH_STATE,
  WEAPONS_CATALOG 
} from "./data/defaultData";
import { 
  PlayerProfile, 
  GameSettings, 
  MatchState, 
  Weapon, 
  LuauMod, 
  MapId, 
  GameMode,
  WeaponSkin 
} from "./types";
import { sounds } from "./audio/soundEngine";
import { Swords, Play, Trophy, Shield, Sparkles, Flame, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";

export function App() {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<ThreeGameEngine | null>(null);

  // Core States
  const [activeTab, setActiveTab] = useState<string>("arena");
  const [player, setPlayer] = useState<PlayerProfile>(DEFAULT_PLAYER_PROFILE);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
  const [weapons, setWeapons] = useState<Weapon[]>(WEAPONS_CATALOG);
  const [currentWeapon, setCurrentWeapon] = useState<Weapon>(WEAPONS_CATALOG[0]);
  const [matchState, setMatchState] = useState<MatchState>(INITIAL_MATCH_STATE);
  const [activeMod, setActiveMod] = useState<LuauMod | null>(null);
  const [selectedMap, setSelectedMap] = useState<MapId>("warehouse");
  
  // Game & Modal States
  const [inGame, setInGame] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showMatchmaking, setShowMatchmaking] = useState<boolean>(false);
  const [showMobileCompanion, setShowMobileCompanion] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAimingState, setIsAimingState] = useState<boolean>(false);
  const [matchResultModal, setMatchResultModal] = useState<{
    show: boolean;
    winner: "YOU" | "OPPONENT";
    eloChange: number;
    coinsEarned: number;
  }>({ show: false, winner: "YOU", eloChange: 25, coinsEarned: 350 });

  // Touch Device Detection
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024);
    };
    checkTouch();
    window.addEventListener("resize", checkTouch);
    return () => window.removeEventListener("resize", checkTouch);
  }, []);

  // Global ESC Key Listener for In-Game Pause
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Escape") {
        if (inGame) {
          setIsPaused((prev) => {
            const next = !prev;
            if (next && engineRef.current) {
              engineRef.current.exitPointerLock();
            }
            return next;
          });
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [inGame]);

  // Initialize Three.js Game Engine
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const engine = new ThreeGameEngine(
      canvasContainerRef.current,
      settings,
      currentWeapon,
      selectedMap,
      {
        onHit: (damage, isHeadshot) => {
          setMatchState((prev) => {
            const newDamageNumbers = [
              ...prev.damageNumbers,
              { id: Date.now() + Math.random(), damage, isHeadshot },
            ];
            return {
              ...prev,
              hitmarker: { active: true, isHeadshot, timestamp: Date.now() },
              damageNumbers: newDamageNumbers,
            };
          });

          setTimeout(() => {
            setMatchState((prev) => ({
              ...prev,
              hitmarker: { ...prev.hitmarker, active: false },
            }));
          }, 150);
        },

        onHealthUpdate: (data) => {
          setMatchState((prev) => ({
            ...prev,
            playerHp: data.playerHp,
            opponentHp: data.opponentHp,
          }));
        },

        onOpponentDamaged: (newHp) => {
          setMatchState((prev) => ({ ...prev, opponentHp: Math.max(0, newHp) }));
        },

        onPlayerDamaged: (newHp) => {
          setMatchState((prev) => ({ ...prev, playerHp: Math.max(0, newHp) }));
        },

        onKill: (isHeadshotOrKiller, victim) => {
          const isHeadshot = typeof isHeadshotOrKiller === "boolean" ? isHeadshotOrKiller : true;
          const feedItem = {
            id: Date.now().toString(),
            killer: isHeadshotOrKiller ? "ApexRival_One" : (victim || "Shadow_Sniper"),
            victim: isHeadshotOrKiller ? (victim || "Shadow_Sniper") : "ApexRival_One",
            weaponName: currentWeapon.name,
            isHeadshot,
            timeAgo: 0,
          };

          setMatchState((prev) => ({
            ...prev,
            killfeed: [feedItem, ...prev.killfeed.slice(0, 4)],
          }));
        },

        onRoundEnded: (winner, isHeadshot) => {
          setMatchState((prev) => {
            const nextPlayerScore = winner === "YOU" ? prev.playerScore + 1 : prev.playerScore;
            const nextOppScore = winner === "OPPONENT" ? prev.opponentScore + 1 : prev.opponentScore;

            if (nextPlayerScore >= prev.roundsToWin) {
              sounds.playRoundWin();
              confetti({ particleCount: 120, spread: 90 });
              setMatchResultModal({
                show: true,
                winner: "YOU",
                eloChange: 32,
                coinsEarned: 500,
              });
              setPlayer((p) => ({
                ...p,
                elo: p.elo + 32,
                rivalsCoins: p.rivalsCoins + 500,
                wins: p.wins + 1,
                kills: p.kills + 1,
                headshots: isHeadshot ? p.headshots + 1 : p.headshots,
                winStreak: p.winStreak + 1,
              }));
            } else if (nextOppScore >= prev.roundsToWin) {
              sounds.playRoundLoss();
              setMatchResultModal({
                show: true,
                winner: "OPPONENT",
                eloChange: -18,
                coinsEarned: 100,
              });
              setPlayer((p) => ({
                ...p,
                elo: Math.max(0, p.elo - 18),
                rivalsCoins: p.rivalsCoins + 100,
                losses: p.losses + 1,
                deaths: p.deaths + 1,
                winStreak: 0,
              }));
            }

            return {
              ...prev,
              playerScore: nextPlayerScore,
              opponentScore: nextOppScore,
              round: prev.round + 1,
            };
          });
        },

        onAmmoChange: (current, reserve) => {
          setCurrentWeapon((prev) => {
            if (prev.currentAmmo === current && prev.reserveAmmo === reserve) return prev;
            return {
              ...prev,
              currentAmmo: current,
              reserveAmmo: reserve,
            };
          });
        },

        onSlideStateChange: (isSliding) => {
          setMatchState((prev) => (prev.isSliding === isSliding ? prev : { ...prev, isSliding }));
        },

        onDashStateChange: (isDashing) => {
          setMatchState((prev) => (prev.isDashing === isDashing ? prev : { ...prev, isDashing }));
        },

        onMovementStateChange: (state) => {
          setMatchState((prev) => {
            if (
              prev.isSliding === state.isSliding &&
              prev.isDashing === state.isDashing &&
              prev.isGrounded === state.isGrounded &&
              prev.stamina === state.stamina &&
              prev.telemetry.maxSpeed >= state.speed
            ) {
              return prev;
            }
            return {
              ...prev,
              isSliding: state.isSliding,
              isDashing: state.isDashing,
              isGrounded: state.isGrounded,
              stamina: state.stamina,
              telemetry: {
                ...prev.telemetry,
                maxSpeed: Math.max(prev.telemetry.maxSpeed, state.speed),
              },
            };
          });
        },

        onTelemetryUpdate: (telem) => {
          setMatchState((prev) => ({
            ...prev,
            telemetry: {
              ...prev.telemetry,
              shotsFired: telem.shotsFired,
              shotsHit: telem.shotsHit,
              headshotHits: telem.headshots,
              maxSpeedReached: telem.maxSpeed,
            },
          }));
        },

        onOpenPauseMenu: () => {
          setIsPaused(true);
        },
      }
    );

    engineRef.current = engine;
    engine.loadMap(selectedMap);
    engine.setWeapon(currentWeapon);

    return () => {
      engine.dispose();
    };
  }, []);

  // Update engine only when weapon identity or skin changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setWeapon(currentWeapon);
    }
  }, [currentWeapon.id, currentWeapon.equippedSkinId]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.loadMap(selectedMap);
    }
  }, [selectedMap]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setMod(activeMod);
    }
  }, [activeMod]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setIsMatchActive(inGame);
    }
  }, [inGame]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSettings(settings);
    }
  }, [settings]);

  // Handle Match Start from Matchmaking
  const handleStartMatch = (mode: GameMode, botDifficulty: "ROOKIE" | "NORMAL" | "APEX" | "CHEATER") => {
    setShowMatchmaking(false);
    setIsPaused(false);
    setInGame(true);
    setActiveTab("arena");

    setMatchState({
      ...INITIAL_MATCH_STATE,
      matchId: `MATCH-${Date.now()}`,
      mode,
      mapId: selectedMap,
      playerHp: 100,
      opponentHp: 100,
    });

    if (engineRef.current) {
      engineRef.current.resetMatch(botDifficulty);
      if (!isTouchDevice) {
        engineRef.current.requestPointerLock();
      }
    }
  };

  const handleResumeMatch = () => {
    setIsPaused(false);
    if (engineRef.current && !isTouchDevice) {
      engineRef.current.requestPointerLock();
    }
  };

  const handleRestartRound = () => {
    setIsPaused(false);
    if (engineRef.current) {
      engineRef.current.resetRound();
      if (!isTouchDevice) {
        engineRef.current.requestPointerLock();
      }
    }
  };

  const handleExitMatch = () => {
    setInGame(false);
    setIsPaused(false);
    if (engineRef.current) {
      engineRef.current.setIsMatchActive(false);
      engineRef.current.exitPointerLock();
    }
  };

  const handleSelectWeapon = (w: Weapon) => {
    setCurrentWeapon(w);
  };

  const handleEquipSkin = (weaponId: string, skinId: string) => {
    setWeapons((prev) =>
      prev.map((w) => (w.id === weaponId ? { ...w, equippedSkinId: skinId } : w))
    );
    if (currentWeapon.id === weaponId) {
      setCurrentWeapon((prev) => ({ ...prev, equippedSkinId: skinId }));
    }
  };

  const handleUnlockSkin = (weaponId: string, skin: WeaponSkin, cost: number) => {
    if (player.rivalsCoins < cost) return;

    setPlayer((prev) => ({
      ...prev,
      rivalsCoins: prev.rivalsCoins - cost,
      unlockedSkins: [...prev.unlockedSkins, skin.id],
    }));

    handleEquipSkin(weaponId, skin.id);
  };

  return (
    <div id="game-app-root" className="w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden font-sans">
      
      {/* 3D Game Canvas Container (Always Mounted in background) */}
      <div
        id="three-canvas-container"
        ref={canvasContainerRef}
        onClick={() => {
          if (inGame && !isPaused && !isTouchDevice && engineRef.current) {
            engineRef.current.requestPointerLock();
          }
        }}
        className={`absolute inset-0 w-full h-full z-0 transition-opacity duration-300 ${
          inGame ? "opacity-100 cursor-crosshair pointer-events-auto" : "opacity-40 blur-[2px] pointer-events-none"
        }`}
      />

      {/* Top Navbar (Hidden during active in-game match) */}
      {!inGame && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          player={player}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          onOpenMobileCompanion={() => setShowMobileCompanion(true)}
        />
      )}

      {/* IN-GAME HUD (Rendered when playing 1v1 match) */}
      {inGame && (
        <GameHUD
          matchState={matchState}
          currentWeapon={currentWeapon}
          settings={settings}
          isTouchDevice={isTouchDevice}
          onOpenPauseMenu={() => {
            setIsPaused(true);
            engineRef.current?.exitPointerLock();
          }}
          onTouchMove={(v) => engineRef.current?.setVirtualMoveVector(v)}
          onTouchLook={(dx, dy) => engineRef.current?.applyTouchLook(dx, dy)}
          onTouchFireStart={() => engineRef.current?.setFiringHeld(true)}
          onTouchFireEnd={() => engineRef.current?.setFiringHeld(false)}
          onTouchJump={() => engineRef.current?.jump()}
          onTouchSlide={() => engineRef.current?.startSlide()}
          onTouchDash={() => engineRef.current?.performDash()}
          onTouchReload={() => engineRef.current?.reload()}
          onTouchAimToggle={() => {
            setIsAimingState((prev) => !prev);
          }}
          onTouchSwitchWeapon={() => {
            const nextIndex = (weapons.findIndex((w) => w.id === currentWeapon.id) + 1) % weapons.length;
            setCurrentWeapon(weapons[nextIndex]);
          }}
          isAiming={isAimingState}
        />
      )}

      {/* PAUSE / ESC MENU MODAL */}
      <PauseMenuModal
        isOpen={isPaused && inGame}
        onResume={handleResumeMatch}
        onRestartRound={handleRestartRound}
        onExitToMenu={handleExitMatch}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
        matchState={matchState}
      />

      {/* NON-GAME MENU TABS */}
      {!inGame && (
        <main className="flex-1 z-10 overflow-y-auto pb-12">
          
          {/* 1. ARENA 1V1 HOME LOBBY TAB */}
          {activeTab === "arena" && (
            <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in select-none">
              
              {/* Hero Banner with Launch Button */}
              <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 p-6 sm:p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 backdrop-blur-md">
                <div className="space-y-3 z-10 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs uppercase tracking-widest border border-amber-500/30">
                      RIVALS DUELS 1V1
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">128 Ticks • Física Luau</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                    Domina el 1v1. <br />
                    <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 bg-clip-text text-transparent">
                      Supera a tu Rival.
                    </span>
                  </h1>
                  <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                    Combates tácticos de alta velocidad inspirados en Rivals Roblox. Motor de movimiento 128Hz con Bunnyhopping fluido, Slide continuo, IA enemiga adaptativa con navegación en enjambre y soporte táctil capacitivo completo.
                  </p>
                </div>

                <div className="z-10 shrink-0 flex flex-col gap-3 w-full md:w-auto">
                  <button
                    id="btn-play-instant"
                    onClick={() => {
                      sounds.playUiClick();
                      handleStartMatch("RANKED_1V1", "APEX");
                    }}
                    className="w-full md:w-auto px-8 py-4.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:opacity-95 font-black text-base text-white shadow-2xl shadow-rose-950/50 active:scale-98 hover:scale-102 transition-all flex items-center justify-center gap-3"
                  >
                    <Play className="w-6 h-6 fill-white" />
                    <span>JUGAR AHORA (DUELO INSTANTÁNEO)</span>
                  </button>

                  <button
                    id="btn-open-matchmaking"
                    onClick={() => {
                      sounds.playUiClick();
                      setShowMatchmaking(true);
                    }}
                    className="w-full md:w-auto px-6 py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 font-bold text-xs text-zinc-200 hover:text-amber-400 active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <Swords className="w-4 h-4 text-amber-400" />
                    <span>MODOS & SELECCIONAR MAPA</span>
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>1,429 Jugadores en Cola Global • 18ms</span>
                  </div>
                </div>
              </div>

              {/* Quick Feature Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div
                  id="card-loadout"
                  onClick={() => { sounds.playUiClick(); setActiveTab("loadout"); }}
                  className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/60 cursor-pointer transition-all shadow-xl space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-white">Armería & Skins</h3>
                  <p className="text-xs text-zinc-400">Personaliza tus armas (AR-X, Aero-50, Pump Havoc) con camuflajes y miras réflex.</p>
                </div>

                <div
                  id="card-mods"
                  onClick={() => { sounds.playUiClick(); setActiveTab("mods"); }}
                  className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-cyan-500/60 cursor-pointer transition-all shadow-xl space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Swords className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-white">Luau Scripting Studio</h3>
                  <p className="text-xs text-zinc-400">Modifica la física de salto, gravedad y velocidad usando scripts reales en Luau.</p>
                </div>

                <div
                  id="card-anticheat"
                  onClick={() => { sounds.playUiClick(); setActiveTab("anticheat"); }}
                  className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-rose-500/60 cursor-pointer transition-all shadow-xl space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-white">Sentinel Anti-Cheat</h3>
                  <p className="text-xs text-zinc-400">Auditoría en tiempo real con entropía de ángulos y protección de memoria.</p>
                </div>

              </div>

            </div>
          )}

          {/* 2. LOADOUT TAB */}
          {activeTab === "loadout" && (
            <WeaponLoadoutModal
              weapons={weapons}
              currentWeapon={currentWeapon}
              player={player}
              onSelectWeapon={handleSelectWeapon}
              onEquipSkin={handleEquipSkin}
              onUnlockSkin={handleUnlockSkin}
            />
          )}

          {/* 3. RANKED & TOP 100 TAB */}
          {activeTab === "ranked" && <LeaderboardModal />}

          {/* 4. BATTLE PASS TAB */}
          {activeTab === "battlepass" && (
            <BattlePassModal
              player={player}
              onUpdatePlayer={(updated) => setPlayer((p) => ({ ...p, ...updated }))}
            />
          )}

          {/* 5. LUAU MODS STUDIO TAB */}
          {activeTab === "mods" && (
            <LuauModStudio activeMod={activeMod} onApplyMod={setActiveMod} />
          )}

          {/* 6. ANTICHEAT SENTINEL TAB */}
          {activeTab === "anticheat" && <AntiCheatModal />}

          {/* 7. AI ANALYTICS & PREDICTOR TAB */}
          {activeTab === "analytics" && (
            <AnalyticsAiModal player={player} currentWeapon={currentWeapon} />
          )}

          {/* 8. TOURNAMENTS & API TAB */}
          {activeTab === "tournaments" && <CustomServerModal />}

          {/* 9. 24/7 SUPPORT TAB */}
          {activeTab === "support" && <SupportChatModal />}

          {/* 10. SETTINGS & CROSSHAIR TAB */}
          {activeTab === "settings" && (
            <SettingsModal
              settings={settings}
              onUpdateSettings={(newSettings) => setSettings((s) => ({ ...s, ...newSettings }))}
            />
          )}

        </main>
      )}

      {/* MATCHMAKING MODAL */}
      {showMatchmaking && (
        <MatchmakingModal
          player={player}
          selectedMap={selectedMap}
          onSelectMap={setSelectedMap}
          onStartMatch={handleStartMatch}
          onClose={() => setShowMatchmaking(false)}
        />
      )}

      {/* MOBILE INVENTORY COMPANION MODAL */}
      {showMobileCompanion && (
        <MobileInventoryCompanion
          player={player}
          weapons={weapons}
          currentWeapon={currentWeapon}
          onSelectWeapon={handleSelectWeapon}
          onClose={() => setShowMobileCompanion(false)}
        />
      )}

      {/* MATCH RESULT POPUP */}
      {matchResultModal.show && (
        <div id="match-result-overlay" className="fixed inset-0 bg-zinc-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="text-4xl">
              {matchResultModal.winner === "YOU" ? "🏆" : "💀"}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {matchResultModal.winner === "YOU" ? "¡VICTORIA EN EL DUELO!" : "DERROTA"}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Duelo 1v1 Finalizado</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div>
                <div className="text-[10px] text-zinc-500">Puntaje ELO</div>
                <div className={`text-base font-black ${matchResultModal.eloChange > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {matchResultModal.eloChange > 0 ? `+${matchResultModal.eloChange}` : matchResultModal.eloChange} ELO
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Recompensa</div>
                <div className="text-base font-black text-amber-400">
                  +{matchResultModal.coinsEarned} 🪙
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                id="btn-result-menu"
                onClick={() => {
                  setMatchResultModal({ ...matchResultModal, show: false });
                  setInGame(false);
                }}
                className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 active:scale-98 transition-all"
              >
                Volver al Menú
              </button>
              <button
                id="btn-result-rematch"
                onClick={() => {
                  setMatchResultModal({ ...matchResultModal, show: false });
                  handleStartMatch("RANKED_1V1", "APEX");
                }}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-zinc-950 active:scale-98 transition-all"
              >
                Revancha 1v1
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
