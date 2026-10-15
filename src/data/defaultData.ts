import { GameSettings, LuauMod, PlayerProfile, TournamentBracket, AntiCheatLog, MatchState, LeaderboardEntry } from "../types";
import { INITIAL_WEAPONS } from "./weaponsData";

export const DEFAULT_PLAYER_PROFILE: PlayerProfile = {
  id: "rival-user-778",
  username: "ApexRival_One",
  avatarSeed: "neon_knight",
  elo: 1885,
  rankTier: "DIAMOND_II",
  level: 38,
  currentXp: 3420,
  xpToNextLevel: 5000,
  rivalsCoins: 14250,
  gems: 480,
  matchesPlayed: 284,
  wins: 204,
  losses: 80,
  kills: 1420,
  deaths: 580,
  headshots: 462,
  winStreak: 6,
  highestElo: 1940,
  equippedLoadout: {
    primaryId: "ar-x",
    secondaryId: "dual-phantoms",
    meleeId: "katana",
    specialId: "grapple-gun",
  },
  unlockedSkins: ["ar-default", "ar-cyber", "aero-default", "aero-ice", "pump-default", "pump-sentinel", "dual-default", "dual-neon", "katana-default", "katana-void", "grapple-default"],
  unlockedTitles: ["Aero Master", "Duelist Prime", "Apex Challenger", "Sentinel Enforcer"],
  activeTitle: "Duelist Prime",
};

export const DEFAULT_PLAYER = DEFAULT_PLAYER_PROFILE;

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  fov: 90,
  viewmodelFov: 75,
  mouseSensitivity: 1.8,
  adsSensitivityMultiplier: 0.85,
  masterVolume: 0.8,
  sfxVolume: 0.9,
  hitmarkerSound: "dink",
  crosshair: {
    color: "#22c55e", // tactical green
    size: 6,
    thickness: 2,
    gap: 3,
    dot: true,
    dynamicRecoil: true,
    opacity: 0.95,
  },
  colorblindMode: "none",
  pixelFilter: "pixel_8bit",
  controlScheme: "QUAKE_KEYBOARD",
  keyboardTurnSpeed: 2.8,
  showFps: true,
  showPing: true,
  keybinds: {
    forward: "KeyW",
    backward: "KeyS",
    left: "KeyA",
    right: "KeyD",
    jump: "Space",
    crouchSlide: "KeyC",
    dash: "KeyQ",
    reload: "KeyR",
    inspect: "KeyF",
    primaryWeapon: "Digit1",
    secondaryWeapon: "Digit2",
    melee: "Digit3",
    grapple: "KeyE",
  },
};

export const DEFAULT_SETTINGS = DEFAULT_GAME_SETTINGS;

export const WEAPONS_CATALOG = INITIAL_WEAPONS;

export const INITIAL_MATCH_STATE: MatchState = {
  isActive: true,
  isPaused: false,
  mode: "RANKED_1V1",
  mapId: "warehouse",
  round: 1,
  playerScore: 0,
  opponentScore: 0,
  roundsToWin: 5,
  roundTimeLeft: 90,
  winner: null,
  matchOver: false,
  opponentName: "Shadow_Sniper",
  opponentElo: 1910,
  opponentRank: "DIAMOND_III",
  opponentHp: 100,
  opponentMaxHp: 100,
  opponentAvatarColor: "#ef4444",
  playerHp: 100,
  playerMaxHp: 100,
  stamina: 100,
  maxStamina: 100,
  isSliding: false,
  isDashing: false,
  isGrappling: false,
  isGrounded: true,
  killfeed: [
    { id: "kf1", killer: "ApexRival_One", victim: "Shadow_Sniper", weaponName: "AR-X", isHeadshot: true, timeAgo: 10 },
  ],
  damageNumbers: [],
  hitmarker: {
    active: false,
    isHeadshot: false,
    timestamp: 0,
  },
  telemetry: {
    shotsFired: 0,
    shotsHit: 0,
    headshotHits: 0,
    damageDealt: 0,
    damageTaken: 0,
    maxSpeedReached: 16.5,
    dashCount: 0,
    slideCount: 0,
    bunnyhopChains: 0,
  },
};

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { userId: "u1", rank: 1, username: "Kore_Quickscope", elo: 2480, rankTier: "APEX_RIVAL", winRate: 86.4, kdr: 4.12, headshotPct: 62, favoriteWeapon: "Aero-50", winStreak: 18, verified: true },
  { userId: "u2", rank: 2, username: "Apex_Phantom", elo: 2410, rankTier: "APEX_RIVAL", winRate: 83.1, kdr: 3.85, headshotPct: 58, favoriteWeapon: "AR-X", winStreak: 12, verified: true },
  { userId: "u3", rank: 3, username: "Zeta_Movement", elo: 2360, rankTier: "APEX_RIVAL", winRate: 80.9, kdr: 3.60, headshotPct: 51, favoriteWeapon: "Pump Havoc", winStreak: 9, verified: true },
  { userId: "u4", rank: 4, username: "Shadow_Sniper", elo: 2290, rankTier: "APEX_RIVAL", winRate: 78.5, kdr: 3.42, headshotPct: 55, favoriteWeapon: "Aero-50", winStreak: 7, verified: true },
  { userId: "u5", rank: 5, username: "Vortex_AimGod", elo: 2210, rankTier: "APEX_RIVAL", winRate: 76.2, kdr: 3.15, headshotPct: 49, favoriteWeapon: "AR-X", winStreak: 5, verified: true },
  { userId: "u12", rank: 12, username: "ApexRival_One (Tú)", elo: 1885, rankTier: "DIAMOND_II", winRate: 71.8, kdr: 2.45, headshotPct: 32, favoriteWeapon: "AR-X", winStreak: 6, verified: true },
  { userId: "u13", rank: 13, username: "Crono_FPS", elo: 1860, rankTier: "DIAMOND_II", winRate: 69.4, kdr: 2.30, headshotPct: 30, favoriteWeapon: "Dual Phantoms", winStreak: 3, verified: false },
  { userId: "u14", rank: 14, username: "NeonFlick", elo: 1790, rankTier: "DIAMOND_I", winRate: 67.0, kdr: 2.18, headshotPct: 28, favoriteWeapon: "Pump Havoc", winStreak: 2, verified: false },
  { userId: "u15", rank: 15, username: "Viper_Blade", elo: 1750, rankTier: "DIAMOND_I", winRate: 65.5, kdr: 2.05, headshotPct: 24, favoriteWeapon: "Obsidian Katana", winStreak: 1, verified: false },
];

export const MAP_CONFIGS = [
  {
    id: "warehouse",
    name: "Warehouse 1v1",
    theme: "Industrial Container Depot",
    description: "Mapa simétrico de 2 plantas con pasillos de tiro largo y cajas para acrobacias de bunnyhop.",
    bgColor: "#1e1e24",
    gridColor: "#3b82f6",
  },
  {
    id: "cyber_arena",
    name: "Cyber Grid Arena",
    theme: "Neo-Tokyo Hologram",
    description: "Plataformas elevadas con neones flotantes, rampas de salto y visibilidad cristalina.",
    bgColor: "#0f172a",
    gridColor: "#ec4899",
  },
  {
    id: "temple_ruins",
    name: "Temple of Apex",
    theme: "Ancient Stone Arena",
    description: "Pilares masivos para wallbouncing, alta cobertura y zona central elevada para duelos de sniper.",
    bgColor: "#1c1917",
    gridColor: "#eab308",
  },
  {
    id: "neon_courtyard",
    name: "Neon Courtyard",
    theme: "Futuristic Rooftop",
    description: "Campo abierto con pads de aceleración, túneles laterales y líneas de visión perfectas.",
    bgColor: "#09090b",
    gridColor: "#10b981",
  },
];

export const INITIAL_LUAU_MODS: LuauMod[] = [
  {
    id: "mod-bhop-pro",
    title: "Luau Momentum BHop Master",
    author: "RivalCoder_99",
    description: "Incrementa la aceleración por strafe aéreo en 1.5x y elimina la pérdida de fricción al encadenar saltos perfectos.",
    category: "PHYSICS",
    scriptCode: `-- RIVALS Luau Physics Engine: Strafe Air Acceleration
local PhysicsService = game:GetService("PhysicsService")
local Player = game.Players.LocalPlayer

local STRAFE_ACCEL = 1.45
local FRICTION_FLOOR = 0.05
local AIR_CAP_SPEED = 28.0

function OnPlayerJump(char)
    local hrp = char:FindFirstChild("HumanoidRootPart")
    if hrp then
        hrp.AssemblyLinearVelocity = hrp.AssemblyLinearVelocity * Vector3.new(1.15, 1.0, 1.15)
        print("[Luau Physics] BHop Momentum Chained! Velocity:", hrp.AssemblyLinearVelocity.Magnitude)
    end
end`,
    active: true,
    downloads: 14200,
    likes: 3820,
    version: "2.1.0",
    parameters: {
      speedMultiplier: 1.25,
      jumpPowerMultiplier: 1.1,
      slidingFriction: 0.7,
    },
  },
  {
    id: "mod-sniper-instagib",
    title: "Instagib Railgun Mutator",
    author: "HyperionTeam",
    description: "Todas las armas disparan rayos láser instantáneos con daño mortal de 1 disparo y munición infinita.",
    category: "MUTATOR",
    scriptCode: `-- RIVALS Railgun Instagib Mod
local WeaponService = require(game.ReplicatedStorage.WeaponService)

WeaponService.OverrideDamage(function(hitPart, attacker)
    return 999 -- Instant Elimination
end)
WeaponService.SetUnlimitedAmmo(true)`,
    active: false,
    downloads: 8900,
    likes: 2150,
    version: "1.4.0",
    parameters: {
      bulletVelocityMultiplier: 3.0,
      unlimitedAmmo: true,
      headshotOnly: false,
    },
  },
  {
    id: "mod-vampire-siphon",
    title: "Vampiric Siphon (Lifesteal)",
    author: "VanguardEsports",
    description: "Restaura el 40% del daño infligido al oponente directamente a tu barra de vida.",
    category: "MUTATOR",
    scriptCode: `-- Vampiric Health Siphon
local Players = game:GetService("Players")

Players.LocalPlayer.OnDamageDealt:Connect(function(damageAmount)
    local lifesteal = damageAmount * 0.40
    Players.LocalPlayer.Humanoid.Health = math.min(100, Players.LocalPlayer.Humanoid.Health + lifesteal)
end)`,
    active: false,
    downloads: 6400,
    likes: 1890,
    version: "1.0.2",
    parameters: {
      lifestealPercentage: 40,
    },
  },
  {
    id: "mod-low-gravity-moon",
    title: "Moon Gravity Duel (0.4x Gravity)",
    author: "SpaceRobloxian",
    description: "Gravedad reducida al estilo lunar con impulso de salto duplicado para duelos aéreos con sniper.",
    category: "PHYSICS",
    scriptCode: `-- Moon Gravity Override
workspace.Gravity = 196.2 * 0.42
print("[Luau Physics] Gravity altered to 82.4 studs/s^2")`,
    active: false,
    downloads: 5120,
    likes: 1340,
    version: "1.2.0",
    parameters: {
      gravityMultiplier: 0.42,
      jumpPowerMultiplier: 1.6,
    },
  },
];

export const INITIAL_TOURNAMENTS: TournamentBracket[] = [
  {
    id: "tourney-apex-4",
    title: "Apex Rivals Champions League - Season 4",
    status: "SEMIFINALS",
    prizePool: "15,000 RIVALS Coins + 'Sovereign Emperor' Title",
    rounds: [
      {
        roundName: "Cuartos de Final (Bo3)",
        matches: [
          { id: "m1", player1: { name: "ApexRival_One (Tú)", elo: 1885, score: 2, isWinner: true }, player2: { name: "Vortex_AimGod", elo: 1840, score: 1 }, status: "FINISHED" },
          { id: "m2", player1: { name: "Shadow_Sniper", elo: 1910, score: 2, isWinner: true }, player2: { name: "NeonFlick", elo: 1790, score: 0 }, status: "FINISHED" },
          { id: "m3", player1: { name: "Kore_Quickscope", elo: 1950, score: 2, isWinner: true }, player2: { name: "PhantomRogue", elo: 1820, score: 1 }, status: "FINISHED" },
          { id: "m4", player1: { name: "Zeta_Movement", elo: 1890, score: 2, isWinner: true }, player2: { name: "Crono_FPS", elo: 1860, score: 0 }, status: "FINISHED" },
        ],
      },
      {
        roundName: "Semifinales (Bo5)",
        matches: [
          { id: "m5", player1: { name: "ApexRival_One (Tú)", elo: 1885, score: 0 }, player2: { name: "Shadow_Sniper", elo: 1910, score: 0 }, status: "LIVE" },
          { id: "m6", player1: { name: "Kore_Quickscope", elo: 1950, score: 0 }, player2: { name: "Zeta_Movement", elo: 1890, score: 0 }, status: "SCHEDULED" },
        ],
      },
      {
        roundName: "Gran Final (Bo7)",
        matches: [
          { id: "m7", player1: { name: "TBD", elo: 0, score: 0 }, player2: { name: "TBD", elo: 0, score: 0 }, status: "SCHEDULED" },
        ],
      },
    ],
  },
];

export const INITIAL_ANTISHEAT_LOGS: AntiCheatLog[] = [
  { id: "LOG-9921", timestamp: "Hace 2 min", player: "SilentAimbot_x9", reason: "Ángulo de mira instantáneo 180.0° en 1 tick (0.008s)", entropyScore: 0.99, verdict: "BANNED", system: "SENTINEL_HYPERION_V4" },
  { id: "LOG-9920", timestamp: "Hace 8 min", player: "GhostSpeed_99", reason: "Velocidad horizontal excedida: 74.2 studs/s (Límite: 32)", entropyScore: 0.96, verdict: "BANNED", system: "SENTINEL_HYPERION_V4" },
  { id: "LOG-9919", timestamp: "Hace 14 min", player: "Shadow_Sniper", reason: "Flick de 45° a la cabeza en 120ms verificado como movimiento de mouse humano orgánico", entropyScore: 0.12, verdict: "CLEARED", system: "SENTINEL_HYPERION_V4" },
  { id: "LOG-9918", timestamp: "Hace 22 min", player: "WallScan_User", reason: "Disparos a través de geometría sin línea de visión previa", entropyScore: 0.88, verdict: "FLAGGED_FOR_REVIEW", system: "SENTINEL_HYPERION_V4" },
  { id: "LOG-9917", timestamp: "Hace 31 min", player: "DesyncLagSwitch", reason: "Manipulación de paquetes TCP/UDP - Desconexión simulada en 1v1", entropyScore: 0.94, verdict: "BANNED", system: "SENTINEL_HYPERION_V4" },
];

export const LEADERBOARD_PLAYERS = [
  { rank: 1, name: "Kore_Quickscope", elo: 2480, tier: "APEX_RIVAL", winRate: "86.4%", kdr: 4.12, favoriteWeapon: "Aero-50", verified: true },
  { rank: 2, name: "Apex_Phantom", elo: 2410, tier: "APEX_RIVAL", winRate: "83.1%", kdr: 3.85, favoriteWeapon: "AR-X", verified: true },
  { rank: 3, name: "Zeta_Movement", elo: 2360, tier: "APEX_RIVAL", winRate: "80.9%", kdr: 3.60, favoriteWeapon: "Pump Havoc", verified: true },
  { rank: 4, name: "Shadow_Sniper", elo: 2290, tier: "APEX_RIVAL", winRate: "78.5%", kdr: 3.42, favoriteWeapon: "Aero-50", verified: true },
  { rank: 5, name: "Vortex_AimGod", elo: 2210, tier: "APEX_RIVAL", winRate: "76.2%", kdr: 3.15, favoriteWeapon: "AR-X", verified: true },
  { rank: 12, name: "ApexRival_One (Tú)", elo: 1885, tier: "DIAMOND_II", winRate: "71.8%", kdr: 2.45, favoriteWeapon: "AR-X", verified: true },
  { rank: 13, name: "Crono_FPS", elo: 1860, tier: "DIAMOND_II", winRate: "69.4%", kdr: 2.30, favoriteWeapon: "Dual Phantoms", verified: false },
  { rank: 14, name: "NeonFlick", elo: 1790, tier: "DIAMOND_I", winRate: "67.0%", kdr: 2.18, favoriteWeapon: "Pump Havoc", verified: false },
  { rank: 15, name: "Viper_Blade", elo: 1750, tier: "DIAMOND_I", winRate: "65.5%", kdr: 2.05, favoriteWeapon: "Obsidian Katana", verified: false },
];

export const BATTLE_PASS_TIERS = Array.from({ length: 25 }, (_, i) => {
  const tier = i + 1;
  const isFree = tier % 2 === 1;
  let rewardName = `500 RIVALS Coins`;
  let rewardType: "COINS" | "GEMS" | "SKIN" | "TITLE" | "CRATE" = "COINS";
  let rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC" = "COMMON";
  let skinPreview = "";

  if (tier === 5) {
    rewardName = "Aero-50 Glacial Skin";
    rewardType = "SKIN";
    rarity = "RARE";
    skinPreview = "#0e7490";
  } else if (tier === 10) {
    rewardName = "Cyber Void Crate";
    rewardType = "CRATE";
    rarity = "EPIC";
  } else if (tier === 15) {
    rewardName = "150 Gems";
    rewardType = "GEMS";
    rarity = "RARE";
  } else if (tier === 20) {
    rewardName = "Dragonfire Core AR-X";
    rewardType = "SKIN";
    rarity = "LEGENDARY";
    skinPreview = "#7f1d1d";
  } else if (tier === 25) {
    rewardName = "Master Gold Sovereign Finisher";
    rewardType = "SKIN";
    rarity = "MYTHIC";
    skinPreview = "#ca8a04";
  }

  return {
    tier,
    isFree,
    rewardName,
    rewardType,
    rarity,
    skinPreview,
    unlocked: tier <= 8,
    claimed: tier <= 6,
  };
});
