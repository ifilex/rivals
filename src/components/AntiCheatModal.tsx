import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, Activity, UserX, FileText, CheckCircle2, Lock, Terminal } from "lucide-react";
import { INITIAL_ANTISHEAT_LOGS } from "../data/defaultData";
import { AntiCheatLog } from "../types";
import { sounds } from "../audio/soundEngine";

export const AntiCheatModal: React.FC = () => {
  const [logs, setLogs] = useState<AntiCheatLog[]>(INITIAL_ANTISHEAT_LOGS);
  const [reportedPlayer, setReportedPlayer] = useState("");
  const [reportReason, setReportReason] = useState("AIMBOT");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [liveScanStatus, setLiveScanStatus] = useState("SISTEMA ACTIVO (128Hz SEGURO)");

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportedPlayer.trim()) return;

    sounds.playUiClick();
    const newLog: AntiCheatLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: "Ahora mismo",
      player: reportedPlayer,
      reason: `Reporte de usuario: ${reportReason}. Telemetría enviada a auditoría de IA.`,
      entropyScore: 0.85,
      verdict: "FLAGGED_FOR_REVIEW",
      system: "SENTINEL_HYPERION_V4",
    };

    setLogs([newLog, ...logs]);
    setReportSubmitted(true);
    setReportedPlayer("");
    setTimeout(() => setReportSubmitted(false), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in select-none">
      
      {/* Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Sistema Antitrampas a Nivel Servidor</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Sentinel Vanguard & Hyperion</h1>
          <p className="text-xs md:text-sm text-zinc-400">
            Detección de entropía en ángulos de mira, verificación de integridad de memoria y velocidad de movimiento Luau
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{liveScanStatus}</span>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <div className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Frecuencia de Muestreo</span>
          </div>
          <div className="text-2xl font-black text-white">128 Ticks/s</div>
          <p className="text-[11px] text-zinc-500">Sin pérdida de paquetes en tiempo real</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <div className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
            <UserX className="w-4 h-4 text-rose-400" />
            <span>Baneos Automáticos (Mes)</span>
          </div>
          <div className="text-2xl font-black text-rose-400">4,812</div>
          <p className="text-[11px] text-zinc-500">99.8% de precisión en veredictos</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <div className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Verificación de Integridad</span>
          </div>
          <div className="text-2xl font-black text-cyan-400">SHA-256 HMAC</div>
          <p className="text-[11px] text-zinc-500">Bloqueo de inyecciones dll externas</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <div className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Límite de Velocidad Luau</span>
          </div>
          <div className="text-2xl font-black text-amber-400">32.0 studs/s</div>
          <p className="text-[11px] text-zinc-500">Clamping automático en desyncs</p>
        </div>
      </div>

      {/* Grid: Left Live Feed, Right Player Report Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Left: Live Telemetry Logs (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
            <span>Feed Global de Detección & Baneos</span>
            <span className="text-emerald-400">En Vivo</span>
          </div>

          <div className="space-y-2.5">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400">
                      {log.id}
                    </span>
                    <span className="font-extrabold text-sm text-white">{log.player}</span>
                    <span className="text-[11px] text-zinc-500">• {log.timestamp}</span>
                  </div>
                  <p className="text-xs text-zinc-300">{log.reason}</p>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${
                      log.verdict === "BANNED"
                        ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                        : log.verdict === "CLEARED"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {log.verdict}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Right: Submit Report Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Reportar Jugador Sospechoso</span>
            </div>
            <p className="text-xs text-zinc-400">
              Nuestro motor de telemetría extraerá los últimos 60 segundos de clips de repetición del duelo 1v1 para análisis de IA.
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Nombre del Jugador</label>
                <input
                  type="text"
                  placeholder="Ej. Target_Rival_99"
                  value={reportedPlayer}
                  onChange={(e) => setReportedPlayer(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Motivo de la Infracción</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="AIMBOT">Aimbot / Lock de mira instantáneo</option>
                  <option value="SPEEDHACK">Speedhack / Velocidad anormal</option>
                  <option value="WALLHACK">Wallhack / Disparos a través de paredes</option>
                  <option value="LAGSWITCH">Lagswitch / Abuso de desincronización</option>
                </select>
              </div>

              {reportSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reporte enviado con telemetría de 128Hz al auditor Sentinel.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 font-black text-xs text-white uppercase tracking-wider transition-colors shadow-lg shadow-rose-950/40"
              >
                Enviar Reporte a Sentinel Vanguard
              </button>
            </form>
          </div>

          {/* Verification Hash Badge */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>FIRMA DEL SERVIDOR:</span>
            <span className="text-emerald-400 font-bold">HYPERION-OK-77F8</span>
          </div>
        </div>

      </div>

    </div>
  );
};
