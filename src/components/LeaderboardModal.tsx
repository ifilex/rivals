import React, { useState } from "react";
import { Trophy, Search, Medal, Shield, Swords, Flame, Crown } from "lucide-react";
import { INITIAL_LEADERBOARD } from "../data/defaultData";
import { LeaderboardEntry } from "../types";
import { sounds } from "../audio/soundEngine";

export const LeaderboardModal: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);

  const filteredEntries = entries.filter(
    (e) =>
      e.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.rankTier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in select-none">
      
      {/* Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>Temporada 4: Cyber Void (Finaliza en 12 días)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Tabla Clasificatoria Global Top 100</h1>
          <p className="text-xs md:text-sm text-zinc-400">
            Los mejores duelistas de 1v1 clasificados por el sistema de MMR competitivo a 128 Ticks
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar jugador o rango..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {entries.slice(0, 3).map((topPlayer, idx) => (
          <div
            key={topPlayer.userId}
            className={`p-6 rounded-3xl border flex flex-col justify-between relative overflow-hidden ${
              idx === 0
                ? "bg-gradient-to-b from-amber-500/20 via-zinc-900 to-zinc-950 border-amber-400/60 shadow-xl shadow-amber-950/30"
                : idx === 1
                ? "bg-gradient-to-b from-slate-400/20 via-zinc-900 to-zinc-950 border-slate-400/40"
                : "bg-gradient-to-b from-amber-700/20 via-zinc-900 to-zinc-950 border-amber-700/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {idx === 0 && <Crown className="w-6 h-6 text-amber-400" />}
                {idx === 1 && <Medal className="w-6 h-6 text-slate-300" />}
                {idx === 2 && <Medal className="w-6 h-6 text-amber-600" />}
                <span className="font-black text-lg text-white">#{topPlayer.rank}</span>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-zinc-950/80 text-amber-400 border border-amber-400/30">
                {topPlayer.rankTier.replace("_", " ")}
              </span>
            </div>

            <div className="my-4">
              <div className="text-xl font-black text-white">{topPlayer.username}</div>
              <div className="text-sm font-bold text-amber-400 mt-0.5">{topPlayer.elo} ELO</div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800 text-center text-xs">
              <div>
                <div className="text-zinc-500 text-[10px]">Winrate</div>
                <div className="font-bold text-emerald-400">{topPlayer.winRate}%</div>
              </div>
              <div>
                <div className="text-zinc-500 text-[10px]">KDR</div>
                <div className="font-bold text-white">{topPlayer.kdr}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-[10px]">Arma Fav</div>
                <div className="font-bold text-cyan-400 truncate">{topPlayer.favoriteWeapon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Rango</th>
                <th className="px-6 py-4">Jugador</th>
                <th className="px-6 py-4">ELO</th>
                <th className="px-6 py-4">Winrate</th>
                <th className="px-6 py-4">KDR</th>
                <th className="px-6 py-4">Headshot %</th>
                <th className="px-6 py-4">Arma Favorita</th>
                <th className="px-6 py-4">Racha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {filteredEntries.map((row) => (
                <tr key={row.userId} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-6 py-4 font-black text-amber-400">#{row.rank}</td>
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300">
                      {row.username.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{row.username}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-amber-400">{row.elo}</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">{row.winRate}%</td>
                  <td className="px-6 py-4 text-zinc-300">{row.kdr}</td>
                  <td className="px-6 py-4 text-zinc-400">{row.headshotPct}%</td>
                  <td className="px-6 py-4 text-cyan-400 font-mono">{row.favoriteWeapon}</td>
                  <td className="px-6 py-4 font-bold text-rose-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{row.winStreak}W</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
