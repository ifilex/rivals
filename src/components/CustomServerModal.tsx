import React, { useState } from "react";
import { Sparkles, Trophy, Plus, Users, Globe, Key, Send, Copy, Check } from "lucide-react";
import { INITIAL_TOURNAMENTS } from "../data/defaultData";
import { TournamentBracket } from "../types";
import { sounds } from "../audio/soundEngine";

export const CustomServerModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"TOURNAMENTS" | "SERVERS" | "API">("TOURNAMENTS");
  const [tournaments, setTournaments] = useState<TournamentBracket[]>(INITIAL_TOURNAMENTS);
  const [copiedKey, setCopiedKey] = useState(false);
  const [apiKey, setApiKey] = useState("rvl_live_8941fba0238e4a91c");
  const [apiResponse, setApiResponse] = useState<string>("");
  const [apiLoading, setApiLoading] = useState(false);

  const [privateServerCode, setPrivateServerCode] = useState("RIVALS-8824");
  const [serverCreated, setServerCreated] = useState(false);
  const [customRules, setCustomRules] = useState({
    gravity: "100%",
    jumpPower: "100%",
    headshotMultiplier: "2.0x",
    snipersOnly: false,
    unlimitedAmmo: false,
    firstToRounds: 5,
  });

  const handleCreateServer = () => {
    sounds.playUiClick();
    const code = `RIVALS-${Math.floor(1000 + Math.random() * 9000)}`;
    setPrivateServerCode(code);
    setServerCreated(true);
  };

  const handleTestApi = async (endpoint: string) => {
    sounds.playUiClick();
    setApiLoading(true);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setApiResponse(JSON.stringify({ error: "Failed to query API endpoint" }));
    } finally {
      setApiLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(privateServerCode);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in select-none">
      
      {/* Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>Servidores Privados, Torneos & API de Desarrolladores</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Torneos Personalizados & API</h1>
          <p className="text-xs md:text-sm text-zinc-400">
            Crea llaves de brackets competitivos, salas privadas con reglas Luau y consume la API oficial de RIVALS
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
          <button
            onClick={() => { sounds.playUiClick(); setActiveTab("TOURNAMENTS"); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "TOURNAMENTS" ? "bg-amber-500 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            Torneos & Brackets
          </button>
          <button
            onClick={() => { sounds.playUiClick(); setActiveTab("SERVERS"); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "SERVERS" ? "bg-amber-500 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            Servidores Privados
          </button>
          <button
            onClick={() => { sounds.playUiClick(); setActiveTab("API"); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "API" ? "bg-amber-500 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            API para Desarrolladores
          </button>
        </div>
      </div>

      {activeTab === "TOURNAMENTS" && (
        /* Tournament Brackets View */
        <div className="space-y-6">
          {tournaments.map((tourney) => (
            <div key={tourney.id} className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                      FASE: {tourney.status}
                    </span>
                    <span className="text-xs text-zinc-400">Tickrate: 128Hz</span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">{tourney.title}</h3>
                  <div className="text-xs text-amber-400 font-bold mt-0.5">Premio: {tourney.prizePool}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200">
                    Reglamento Oficial
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-xs text-white">
                    Entrar a la Sala Live
                  </button>
                </div>
              </div>

              {/* Bracket Tree Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tourney.rounds.map((round, rIdx) => (
                  <div key={rIdx} className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                      <span>{round.roundName}</span>
                    </div>

                    <div className="space-y-3">
                      {round.matches.map((m) => (
                        <div
                          key={m.id}
                          className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 hover:border-zinc-700 transition-colors"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-white">{m.player1.name}</span>
                            <span className="font-mono font-bold text-amber-400">{m.player1.score}</span>
                          </div>
                          <div className="w-full h-[1px] bg-zinc-800"></div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-zinc-300">{m.player2.name}</span>
                            <span className="font-mono font-bold text-zinc-400">{m.player2.score}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500 text-right pt-1">
                            {m.status === "LIVE" ? (
                              <span className="text-rose-500 font-black animate-pulse">● EN VIVO</span>
                            ) : m.status === "FINISHED" ? (
                              <span className="text-emerald-400 font-bold">✓ FINALIZADO</span>
                            ) : (
                              "PROGRAMADO"
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "SERVERS" && (
        /* Private Server Creation */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-black text-white">Configurador de Sala Privada</h3>
            <p className="text-xs text-zinc-400">Personaliza las reglas de física y genera un código de acceso para duelos con amigos o torneos comunitarios.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Rondas para Ganar</label>
                <select
                  value={customRules.firstToRounds}
                  onChange={(e) => setCustomRules({ ...customRules, firstToRounds: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                >
                  <option value={3}>Primero a 3 Rondas (Bo5)</option>
                  <option value={5}>Primero a 5 Rondas (Bo9)</option>
                  <option value={7}>Primero a 7 Rondas (Bo13 - Finales)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCustomRules({ ...customRules, snipersOnly: !customRules.snipersOnly })}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    customRules.snipersOnly ? "bg-amber-500/20 border-amber-400 text-amber-300" : "bg-zinc-950 border-zinc-800 text-zinc-400"
                  }`}
                >
                  {customRules.snipersOnly ? "✓ Solo Snipers (Aero-50)" : "Armas Estándar"}
                </button>

                <button
                  onClick={() => setCustomRules({ ...customRules, unlimitedAmmo: !customRules.unlimitedAmmo })}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    customRules.unlimitedAmmo ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" : "bg-zinc-950 border-zinc-800 text-zinc-400"
                  }`}
                >
                  {customRules.unlimitedAmmo ? "✓ Munición Infinita" : "Munición Limitada"}
                </button>
              </div>

              <button
                onClick={handleCreateServer}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 font-black text-xs text-zinc-950 transition-all shadow-lg mt-2"
              >
                Generar Servidor Dedicado 128Hz
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-center items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">CÓDIGO DE SALA PRIVADA</div>
              <div className="text-3xl font-black text-white font-mono tracking-widest mt-1">
                {privateServerCode}
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white flex items-center gap-2 transition-colors"
            >
              {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey ? "¡Código Copiado!" : "Copiar Código de Sala"}</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === "API" && (
        /* Third-Party Developer API Playground */
        <div className="space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">API REST & Webhooks para Desarrolladores</h3>
                <p className="text-xs text-zinc-400">Integra estadísticas de RIVALS en tus bots de Discord, webs de torneos o dashboards externos.</p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-cyan-400">
                v1.0.4-live
              </span>
            </div>

            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">API Key: {apiKey}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(apiKey);
                  alert("API Key copiada al portapapeles");
                }}
                className="text-amber-400 hover:text-amber-300 font-bold"
              >
                Copiar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => handleTestApi("/api/v1/players/me/stats")}
                className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-left text-xs text-zinc-200 font-mono transition-colors"
              >
                <span className="text-emerald-400 font-bold">GET</span> /api/v1/players/:id/stats
              </button>

              <button
                onClick={() => handleTestApi("/api/v1/tournaments")}
                className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-left text-xs text-zinc-200 font-mono transition-colors"
              >
                <span className="text-emerald-400 font-bold">GET</span> /api/v1/tournaments
              </button>
            </div>

            {apiResponse && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 max-h-60 overflow-y-auto">
                <pre>{apiResponse}</pre>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
