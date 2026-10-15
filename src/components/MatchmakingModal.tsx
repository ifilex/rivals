import React, { useState, useEffect, useRef } from "react";
import { Swords, Globe, Shield, RefreshCw, Zap, Bot, Trophy, CheckCircle2 } from "lucide-react";
import { GameMode, MapId, PlayerProfile } from "../types";
import { MAP_CONFIGS } from "../data/defaultData";
import { sounds } from "../audio/soundEngine";

interface MatchmakingModalProps {
  player: PlayerProfile;
  selectedMap: MapId;
  onSelectMap: (mapId: MapId) => void;
  onStartMatch: (mode: GameMode, botDifficulty: "ROOKIE" | "NORMAL" | "APEX" | "CHEATER") => void;
  onClose: () => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  player,
  selectedMap,
  onSelectMap,
  onStartMatch,
  onClose,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [matchFound, setMatchFound] = useState(false);
  const [opponent, setOpponent] = useState({
    name: "Shadow_Sniper",
    elo: 1910,
    rank: "DIAMOND_III",
    ping: 22,
  });
  const [gameMode, setGameMode] = useState<GameMode>("RANKED_1V1");
  const [botDifficulty, setBotDifficulty] = useState<"ROOKIE" | "NORMAL" | "APEX" | "CHEATER">("APEX");

  const onStartMatchRef = useRef(onStartMatch);
  useEffect(() => {
    onStartMatchRef.current = onStartMatch;
  }, [onStartMatch]);

  useEffect(() => {
    let timer: any;
    let matchTimeout: any;
    if (isSearching && !matchFound) {
      timer = setInterval(() => {
        setSearchTime((prev) => {
          if (prev >= 3) {
            setMatchFound(true);
            sounds.playRoundWin();
            matchTimeout = setTimeout(() => {
              onStartMatchRef.current(gameMode, botDifficulty);
            }, 2500);
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(timer);
      clearTimeout(matchTimeout);
    };
  }, [isSearching, matchFound, gameMode, botDifficulty]);

  const handleStartSearch = () => {
    sounds.playUiClick();
    if (gameMode === "BOT_DUEL" || gameMode === "TRAINING_RANGE") {
      onStartMatch(gameMode, botDifficulty);
    } else {
      setIsSearching(true);
      setSearchTime(0);
      setMatchFound(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Centro de Duelos 1v1</h2>
              <p className="text-xs text-zinc-400">Matchmaking basado en habilidad (SBMM) a 128 Ticks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {!isSearching && !matchFound ? (
          <div className="space-y-5">
            
            {/* Mode Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
                Selecciona Modo de Juego
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => { sounds.playUiClick(); setGameMode("RANKED_1V1"); }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    gameMode === "RANKED_1V1"
                      ? "bg-amber-500/15 border-amber-500/80 text-white shadow-lg shadow-amber-950/30"
                      : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      ELO ACTIVO
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-white">Ranked 1v1</div>
                  <div className="text-[11px] text-zinc-400">Duelos competitivos Bo5</div>
                </button>

                <button
                  onClick={() => { sounds.playUiClick(); setGameMode("BOT_DUEL"); }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    gameMode === "BOT_DUEL"
                      ? "bg-cyan-500/15 border-cyan-500/80 text-white shadow-lg shadow-cyan-950/30"
                      : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Bot className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                      PRÁCTICA
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-white">Duelo vs Bot IA</div>
                  <div className="text-[11px] text-zinc-400">Elige dificultad de IA</div>
                </button>

                <button
                  onClick={() => { sounds.playUiClick(); setGameMode("TRAINING_RANGE"); }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    gameMode === "TRAINING_RANGE"
                      ? "bg-emerald-500/15 border-emerald-500/80 text-white shadow-lg shadow-emerald-950/30"
                      : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      SOLO
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-white">Campo de Tiro</div>
                  <div className="text-[11px] text-zinc-400">Aim Lab & Calentamiento</div>
                </button>
              </div>
            </div>

            {/* If Bot Duel: Difficulty Selector */}
            {gameMode === "BOT_DUEL" && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
                  Dificultad del Rival IA (Luau Aim Engine)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["ROOKIE", "NORMAL", "APEX", "CHEATER"] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => { sounds.playUiClick(); setBotDifficulty(diff); }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        botDifficulty === diff
                          ? "bg-zinc-800 border-amber-400 text-amber-400 shadow-md"
                          : "bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {diff === "ROOKIE" && "Novato"}
                      {diff === "NORMAL" && "Normal (Silver)"}
                      {diff === "APEX" && "Apex Predator"}
                      {diff === "CHEATER" && "Aimbot God ⚡"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Map Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
                Selecciona Arena 1v1
              </label>
              <div className="grid grid-cols-2 gap-3">
                {MAP_CONFIGS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { sounds.playUiClick(); onSelectMap(m.id as MapId); }}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      selectedMap === m.id
                        ? "bg-zinc-800/90 border-amber-400/90 shadow-md"
                        : "bg-zinc-950/50 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="font-extrabold text-sm text-white flex items-center justify-between">
                      <span>{m.name}</span>
                      {selectedMap === m.id && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{m.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Server Details */}
            <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Servidor: US-East (Virginia) • 18ms</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Tickrate: 128Hz Dedicado</span>
              </div>
            </div>

            {/* Start Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  sounds.playUiClick();
                  onStartMatch(gameMode, botDifficulty);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>INICIAR AHORA (SIN ESPERA)</span>
              </button>

              <button
                onClick={handleStartSearch}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-violet-600 hover:opacity-90 font-black text-sm text-white shadow-xl shadow-rose-950/40 transition-all flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4" />
                <span>{gameMode === "RANKED_1V1" ? "BUSCAR CON SBMM (COLA)" : "ENTRAR A LA ARENA"}</span>
              </button>
            </div>

          </div>
        ) : isSearching && !matchFound ? (
          /* Searching Screen */
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-5">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-zinc-800 border-t-amber-400 animate-spin flex items-center justify-center"></div>
              <Swords className="w-10 h-10 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">Buscando Rival Digno...</h3>
              <p className="text-xs text-zinc-400 mt-1">Filtrando por rango: {player.rankTier} (Elo ± 75)</p>
            </div>

            <div className="text-sm font-mono font-bold text-amber-400 bg-zinc-950 px-4 py-1.5 rounded-full border border-zinc-800">
              Tiempo en cola: 00:0{searchTime}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  sounds.playUiClick();
                  onStartMatch(gameMode, botDifficulty);
                }}
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-zinc-950 transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-zinc-950" />
                <span>Entrar a la Arena Ya</span>
              </button>

              <button
                onClick={() => { sounds.playUiClick(); setIsSearching(false); }}
                className="px-6 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors"
              >
                Cancelar Búsqueda
              </button>
            </div>
          </div>
        ) : (
          /* Match Found Screen */
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95">
            <div className="px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs uppercase tracking-widest animate-pulse">
              ¡DUELO ENCONTRADO!
            </div>

            <div className="w-full grid grid-cols-2 gap-4">
              {/* You */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-cyan-600 flex items-center justify-center text-xl font-black text-white mb-2">
                  YOU
                </div>
                <div className="font-extrabold text-sm text-white">{player.username}</div>
                <div className="text-xs text-amber-400 font-bold">{player.elo} ELO</div>
                <div className="text-[11px] text-zinc-500 mt-1">Ping: 18ms</div>
              </div>

              {/* Opponent */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-rose-900/60 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center text-xl font-black text-white mb-2">
                  RIVAL
                </div>
                <div className="font-extrabold text-sm text-white">{opponent.name}</div>
                <div className="text-xs text-rose-400 font-bold">{opponent.elo} ELO</div>
                <div className="text-[11px] text-zinc-500 mt-1">Ping: {opponent.ping}ms</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => {
                  sounds.playUiClick();
                  onStartMatch(gameMode, botDifficulty);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-xs font-black text-white shadow-lg transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Entrar a la Arena Ahora Mismo</span>
              </button>
              <div className="text-[11px] text-zinc-400">
                Iniciando automáticamente en 2 segundos...
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
