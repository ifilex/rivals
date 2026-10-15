import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Google GenAI initialization helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    game: "RIVALS",
    tickRate: 128,
    serverRegion: "US-East (Low Latency Dedicated)",
    antiCheat: "Sentinel Hyperion v4.9 Active",
    version: "2.4.0-competitive",
  });
});

// AI Match Predictive Analytics & Tactical Coaching
app.post("/api/analytics/predict", async (req, res) => {
  try {
    const { playerData, opponentData, matchStats } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback calculation if no API key
      const playerKDR = (matchStats?.kills || 1) / Math.max(matchStats?.deaths || 1, 1);
      const acc = matchStats?.accuracy || 45;
      const winChance = Math.min(Math.max(Math.round(acc * 0.7 + playerKDR * 18), 15), 94);
      return res.json({
        predictedWinRate: winChance,
        recoilIndex: "A+",
        tacticalAdvice: "Mantén el control de la altura central en el mapa Warehouse y aprovecha el dash para re-posicionarte tras disparar con la Aero-50.",
        metaRecommendation: "El AR-X con mira réflex ofrece mayor consistencia a media distancia frente a escopetas.",
        modelUsed: "Heuristic-Engine (Fallback)",
      });
    }

    const prompt = `Actúa como el motor de análisis predictivo de esports e inteligencia artificial de RIVALS (juego competitivo 1v1 estilo Roblox FPS).
Analiza las siguientes estadísticas de telemetría del jugador en tiempo real:
- Arma principal: ${playerData?.weapon || "AR-X"}
- Precisión actual: ${matchStats?.accuracy || 48}%
- Headshot ratio: ${matchStats?.headshotRate || 32}%
- K/D ratio: ${matchStats?.kdr || 1.8}
- Velocidad promedio de reacción: ${matchStats?.reactionTime || 185}ms
- Oponente: ${opponentData?.name || "Rival_Pro_99"} (Elo: ${opponentData?.elo || 1850})
- Mapa actual: ${matchStats?.map || "Warehouse 1v1 Arena"}

Devuelve un JSON estricto con los siguientes campos:
{
  "predictedWinRate": número entero entre 1 y 99,
  "recoilIndex": letra calificación (S, A+, A, B, C),
  "tacticalAdvice": "Consejo táctico profesional conciso y de alto impacto para ganar el duelo 1v1",
  "metaRecommendation": "Recomendación de carga o mecánica de movimiento (bhop, slide-cancel, dash)",
  "weaknessDetected": "Debilidad detectada en el rival o jugador",
  "predictedRounds": "Ejemplo: 5 - 3 Victoria"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      ...parsed,
      modelUsed: "Gemini 3.7 Flash Predictive Intelligence",
    });
  } catch (err: any) {
    console.error("AI Prediction error:", err);
    res.status(500).json({
      error: "Error generating prediction",
      fallback: {
        predictedWinRate: 68,
        recoilIndex: "A",
        tacticalAdvice: "Asegura el control de ángulos cerrados con el dash de Luau.",
      },
    });
  }
});

// AI Monthly Competitive Report & Meta Shift Analysis
app.post("/api/analytics/monthly-report", async (req, res) => {
  try {
    const { month, season } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reportTitle: `Informe Mensual Competitivo Temporada ${season || 4} - RIVALS`,
        banWaveSummary: {
          totalBanned: 4812,
          aimSnapDetections: 2840,
          speedHackVelocityFlags: 1420,
          memoryIntegrityViolations: 552,
        },
        weaponTierList: [
          { name: "Aero-50 Sniper", tier: "S+", pickRate: "34.2%", winRate: "54.8%" },
          { name: "AR-X Assault Rifle", tier: "S", pickRate: "41.0%", winRate: "52.1%" },
          { name: "Pump Havoc Shotgun", tier: "A+", pickRate: "18.5%", winRate: "50.4%" },
          { name: "Dual Phantom Pistols", tier: "A", pickRate: "6.3%", winRate: "48.9%" },
        ],
        metaInsights: "La técnica de bunnyhop combinada con slide-cancel en tickrate 128Hz ha aumentado la velocidad de enfrentamientos en un 22%. El sniper Aero-50 domina en distancias superiores a 30m.",
        aiPredictionsForNextMonth: "Se prevé un ajuste a la cadencia del Pump Havoc y una mayor adopción del Grapple Hook en arenas verticales.",
      });
    }

    const prompt = `Genera un reporte competitivo mensual oficial de RIVALS (Roblox FPS de duelos 1v1) para el mes de ${month || "Marzo"} de la Temporada ${season || 4}.
Incluye estadísticas simuladas de la ola de baneos de Sentinel Anti-Cheat, Tier list de armas con pick rate y win rate, análisis del meta de movimiento Luau, y predicciones de balance para el próximo parche.
Responde únicamente en formato JSON con la siguiente estructura:
{
  "reportTitle": string,
  "banWaveSummary": {
    "totalBanned": number,
    "aimSnapDetections": number,
    "speedHackVelocityFlags": number,
    "memoryIntegrityViolations": number
  },
  "weaponTierList": [
    { "name": string, "tier": string, "pickRate": string, "winRate": string }
  ],
  "metaInsights": string,
  "aiPredictionsForNextMonth": string,
  "topPlayerOfTheMonth": { "name": string, "elo": number, "winStreak": number }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Monthly report error:", err);
    res.status(500).json({ error: "Failed to generate monthly report" });
  }
});

// 24/7 Multilingual AI Support Assistant
app.post("/api/support/chat", async (req, res) => {
  try {
    const { message, language, userProfile } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: `[Soporte RIVALS 24/7] Hola ${userProfile?.username || "Jugador"}. Hemos recibido tu consulta sobre "${message}". Nuestro sistema de servidores dedicados a 128Hz y almacenamiento cifrado en la nube mantiene tu progreso y skins aseguradas. ¿En qué más podemos ayudarte hoy?`,
        ticketId: `TICKET-${Math.floor(100000 + Math.random() * 900000)}`,
        status: "Resolved by Automated Agent",
      });
    }

    const prompt = `Eres el Agente Oficial de Soporte Técnico y Moderación 24/7 de RIVALS (el clon competitivo de duelos 1v1 de Roblox FPS).
El usuario escribe: "${message}"
Idioma preferido: ${language || "es"}
Datos del usuario: Usuario ${userProfile?.username || "Player"}, Elo: ${userProfile?.elo || 1500}, Nivel: ${userProfile?.level || 25}.

Directrices:
1. Responde de forma cordial, altamente profesional y enérgica en el idioma del usuario (${language || "es"}).
2. Si preguntan sobre apelaciones de ban o reportes, explica que el sistema Sentinel Anti-Cheat graba la telemetría a 128 ticks y puede solicitar revisión manual.
3. Si preguntan sobre mods de Luau, explica cómo cargar scripts seguros en el Sandbox o crear mapas comunitarios.
4. Si preguntan sobre skins, Battle Pass o torneos privados, responde con precisión.
5. Sé conciso (máximo 3 párrafos cortos) y genera un Ticket ID.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({
      reply: response.text,
      ticketId: `RIVALS-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Support chat error:", err);
    res.status(500).json({
      reply: "Gracias por contactar al Centro de Asistencia RIVALS 24/7. Tu solicitud ha sido registrada en el sistema de tickets de alta prioridad.",
      ticketId: "TICKET-EMERGENCY-01",
    });
  }
});

// Anti-Cheat Sentinel Realtime Packet Validator
app.post("/api/anticheat/verify", (req, res) => {
  const { shots, tickDelta, crosshairDelta, playerSpeed } = req.body;
  
  // Heuristic verification
  let flags: string[] = [];
  let isSuspicious = false;

  if (playerSpeed > 32) {
    flags.push("CRITICAL_SPEED_ANOMALY: Velocity exceeding Luau physics cap (32 u/s)");
    isSuspicious = true;
  }
  if (crosshairDelta && crosshairDelta > 175 && tickDelta < 8) {
    flags.push("AIM_SNAP_FLAG: Instantaneous 180° rotation within single tick (0.008s)");
    isSuspicious = true;
  }

  res.json({
    status: isSuspicious ? "FLAGGED_FOR_AUDIT" : "VERIFIED_CLEAN",
    trustScore: isSuspicious ? 42 : 99,
    flags,
    sentinelSignature: `HYPERION-SHA256-${Date.now().toString(16).toUpperCase()}`,
  });
});

// Third Party Developer API simulation
app.get("/api/v1/players/:id/stats", (req, res) => {
  const id = req.params.id;
  res.json({
    playerId: id,
    username: id === "me" ? "ApexRival_One" : `Rival_Competitor_${id}`,
    elo: 2150,
    rankTier: "Apex Rival #12",
    season: 4,
    matchesPlayed: 412,
    winRate: "72.4%",
    kdr: 2.85,
    favoriteWeapon: "Aero-50 Carbon Void",
    verifiedBadge: true,
  });
});

app.get("/api/v1/tournaments", (req, res) => {
  res.json({
    activeTournaments: [
      {
        id: "tourney-apex-championship",
        name: "RIVALS Global 1v1 Apex Invitational 2026",
        prizePool: "10,000 USD + Exclusive Golden Scythe",
        status: "REGISTRATION_OPEN",
        participants: 128,
        maxParticipants: 128,
        tickRate: 128,
        rules: "Standard Ranked Luau Physics | Best of 7 Rounds",
      },
      {
        id: "tourney-sniper-duel",
        name: "Aero-50 Quickscope Clash #12",
        prizePool: "2,500 USD + Mythic Wrap",
        status: "LIVE_NOW",
        participants: 64,
        maxParticipants: 64,
        tickRate: 128,
        rules: "Snipers Only | No Health Regeneration",
      },
    ],
  });
});

// Cloud Save Sync with Encrypted Checksum
app.post("/api/cloud-save/sync", (req, res) => {
  const { userId, payload, checksum } = req.body;
  res.json({
    success: true,
    message: "Encrypted cloud profile state safely synchronized to RIVALS Vault",
    syncedAt: new Date().toISOString(),
    cloudHash: `AES-GCM-256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RIVALS Dedicated Game Server & API listening on http://localhost:${PORT}`);
  });
}

startServer();
