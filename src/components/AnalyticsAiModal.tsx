import React, { useState } from "react";
import { BarChart3, Brain, Sparkles, TrendingUp, Target, Shield, FileText, Zap, Award } from "lucide-react";
import { PlayerProfile, Weapon } from "../types";
import { sounds } from "../audio/soundEngine";

interface AnalyticsAiModalProps {
  player: PlayerProfile;
  currentWeapon: Weapon;
}

export const AnalyticsAiModal: React.FC<AnalyticsAiModalProps> = ({ player, currentWeapon }) => {
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<any>({
    predictedWinRate: 74,
    recoilIndex: "S-Tier",
    tacticalAdvice: "Tu control de strafe aéreo con bunnyhop te otorga ventaja en Warehouse. Aprovecha el retroceso inicial de 4 balas del AR-X antes de reiniciar la ráfaga.",
    metaRecommendation: "Combina el Slide con la escopeta Pump Havoc en esquinas cerradas para infligir hasta 176 de daño a la cabeza.",
    weaknessDetected: "Tiempo de reacción en disparos de larga distancia con Sniper (195ms)",
    predictedRounds: "5 - 2 Victoria",
    modelUsed: "Gemini 3.7 Flash Predictive Intelligence",
  });

  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const handleRunAiAnalysis = async () => {
    sounds.playUiClick();
    setLoadingPrediction(true);
    try {
      const res = await fetch("/api/analytics/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerData: { weapon: currentWeapon.name, elo: player.elo },
          opponentData: { name: "Shadow_Sniper", elo: 1910 },
          matchStats: {
            accuracy: Math.round((player.kills / Math.max(player.matchesPlayed * 8, 1)) * 100),
            headshotRate: Math.round((player.headshots / Math.max(player.kills, 1)) * 100),
            kdr: Math.round((player.kills / Math.max(player.deaths, 1)) * 10) / 10,
            reactionTime: 175,
            map: "Warehouse 1v1 Arena",
          },
        }),
      });
      const data = await res.json();
      setAiPrediction(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrediction(false);
    }
  };

  const handleGenerateMonthlyReport = async () => {
    sounds.playUiClick();
    setLoadingReport(true);
    try {
      const res = await fetch("/api/analytics/monthly-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: "Marzo 2026", season: 4 }),
      });
      const data = await res.json();
      setMonthlyReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReport(false);
    }
  };

  const accuracyRate = Math.round((player.kills / Math.max(player.matchesPlayed * 8, 1)) * 100);
  const headshotRate = Math.round((player.headshots / Math.max(player.kills, 1)) * 100);
  const kdr = (player.kills / Math.max(player.deaths, 1)).toFixed(2);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in select-none">
      
      {/* Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Brain className="w-4 h-4" />
            <span>Inteligencia Artificial Gemini 3.7 Flash</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Análisis Predictivo & Metagame</h1>
          <p className="text-xs md:text-sm text-zinc-400">
            Predicción de victorias en tiempo real, optimización de puntería y reportes mensuales generados por IA
          </p>
        </div>

        <button
          onClick={handleRunAiAnalysis}
          disabled={loadingPrediction}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 font-black text-xs text-white shadow-xl shadow-violet-950/40 transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loadingPrediction ? "Analizando Telemetría..." : "Recalcular Predicción IA"}</span>
        </button>
      </div>

      {/* Top 4 Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <div className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>K/D Ratio Global</span>
          </div>
          <div className="text-2xl font-black text-white">{kdr}</div>
          <p className="text-[11px] text-zinc-500">{player.kills} kills / {player.deaths} deaths</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <div className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-400" />
            <span>Ratio de Headshots</span>
          </div>
          <div className="text-2xl font-black text-amber-400">{headshotRate}%</div>
          <p className="text-[11px] text-zinc-500">{player.headshots} disparos a la cabeza</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <div className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Racha de Victorias</span>
          </div>
          <div className="text-2xl font-black text-cyan-400">{player.winStreak} Partidas</div>
          <p className="text-[11px] text-zinc-500">Record personal: 14 victorias</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <div className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Índice de Control de Recoil</span>
          </div>
          <div className="text-2xl font-black text-purple-400">{aiPrediction.recoilIndex || "S-Tier"}</div>
          <p className="text-[11px] text-zinc-500">Calibrado a 128 ticks</p>
        </div>
      </div>

      {/* Grid: Left AI Tactical Coach, Right Monthly Report Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: AI Win Prediction & Coaching (7 Cols) */}
        <div className="lg:col-span-7 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              <h3 className="font-extrabold text-base text-white">Coaching Táctico Predictivo</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
              {aiPrediction.modelUsed || "Gemini Flash"}
            </span>
          </div>

          {/* Win Probability Bar */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
            <div className="flex justify-between text-xs font-black">
              <span className="text-zinc-300">PROBABILIDAD PREDICTIVA DE VICTORIA (VS DIAMOND III)</span>
              <span className="text-emerald-400 text-sm font-black">{aiPrediction.predictedWinRate}%</span>
            </div>
            <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${aiPrediction.predictedWinRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-500">
              <span>Pronóstico: {aiPrediction.predictedRounds || "5 - 2 Victoria"}</span>
              <span>Confianza: 94.2%</span>
            </div>
          </div>

          {/* Insights Cards */}
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
              <div className="font-bold text-amber-400">💡 Consejo Táctico Profesional</div>
              <p className="text-zinc-300 leading-relaxed">{aiPrediction.tacticalAdvice}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
              <div className="font-bold text-cyan-400">⚡ Recomendación de Movimiento Luau</div>
              <p className="text-zinc-300 leading-relaxed">{aiPrediction.metaRecommendation}</p>
            </div>

            {aiPrediction.weaknessDetected && (
              <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-rose-900/40 space-y-1">
                <div className="font-bold text-rose-400">⚠️ Área de Mejora Detectada</div>
                <p className="text-zinc-300 leading-relaxed">{aiPrediction.weaknessDetected}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Monthly Advanced Report Generator (5 Cols) */}
        <div className="lg:col-span-5 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-base text-white">Reporte Mensual Avanzado</h3>
            </div>
          </div>
          <p className="text-xs text-zinc-400">
            Genera un informe completo con balance de armas, estadísticas de baneos y predicciones de metagame para torneos.
          </p>

          {!monthlyReport ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <button
                onClick={handleGenerateMonthlyReport}
                disabled={loadingReport}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs transition-all shadow-lg"
              >
                {loadingReport ? "Generando Reporte con Gemini..." : "Generar Reporte Mensual S4"}
              </button>
              <span className="text-[11px] text-zinc-500">Incluye análisis de oleadas de Sentinel Vanguard</span>
            </div>
          ) : (
            <div className="space-y-3 text-xs animate-in fade-in">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="font-bold text-white mb-1">{monthlyReport.reportTitle}</div>
                <div className="text-zinc-400 text-[11px] leading-relaxed">{monthlyReport.metaInsights}</div>
              </div>

              {monthlyReport.banWaveSummary && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="font-bold text-rose-400 mb-1">Resumen de Baneos de Trampas</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
                    <div>Total Baneados: <span className="font-bold text-white">{monthlyReport.banWaveSummary.totalBanned}</span></div>
                    <div>Aimbots: <span className="font-bold text-white">{monthlyReport.banWaveSummary.aimSnapDetections}</span></div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setMonthlyReport(null)}
                className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
              >
                Cerrar Reporte
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
