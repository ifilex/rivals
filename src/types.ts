export type GameMode = "RANKED_1V1" | "CASUAL_1V1" | "TRAINING_RANGE" | "BOT_DUEL" | "CUSTOM_TOURNAMENT";

export type MapId = "warehouse" | "cyber_arena" | "temple_ruins" | "neon_courtyard";

export interface Weapon {
  id: string;
  name: string;
  category: "PRIMARY" | "SECONDARY" | "MELEE" | "SPECIAL";
  damageBody: number;
  damageHead: number;
  fireRate: number; // rounds per second
  magazineSize: number;
  currentAmmo: number;
  reserveAmmo: number;
  reloadTime: number; // seconds
  recoil: number;
  spread: number;
  zoomFov: number;
  isAutomatic: boolean;
  pellets?: number;
  description: string;
  iconName: string;
  skins: WeaponSkin[];
  equippedSkinId: string;
  inspectAnimation?: string;
}

export interface WeaponSkin {
  id: string;
  name: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
  colorHex: string;
  accentHex: string;
  glow?: boolean;
  pattern: "SOLID" | "CAMO" | "CYBER" | "GOLD" | "NEON_WAVE" | "VOID";
  seasonExclusive?: number;
  unlocked: boolean;
}

export interface PlayerProfile {
  id: string;
  username: string;
  avatarSeed: string;
  elo: number;
  rankTier: RankTier;
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  rivalsCoins: number;
  gems: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  headshots: number;
  winStreak: number;
  highestElo: number;
  equippedLoadout: {
    primaryId: string;
    secondaryId: string;
    meleeId: string;
    specialId: string;
  };
  unlockedSkins: string[];
  unlockedTitles: string[];
  activeTitle: string;
}

export type RankTier = 
  | "BRONZE_I" | "BRONZE_II" | "BRONZE_III"
  | "SILVER_I" | "SILVER_II" | "SILVER_III"
  | "GOLD_I" | "GOLD_II" | "GOLD_III"
  | "DIAMOND_I" | "DIAMOND_II" | "DIAMOND_III"
  | "MASTER" | "APEX_RIVAL";

export interface GameSettings {
  fov: number;
  viewmodelFov: number;
  mouseSensitivity: number;
  adsSensitivityMultiplier: number;
  masterVolume: number;
  sfxVolume: number;
  hitmarkerSound: "dink" | "bass" | "bell" | "roblox_oof";
  crosshair: {
    color: string;
    size: number;
    thickness: number;
    gap: number;
    dot: boolean;
    dynamicRecoil: boolean;
    opacity: number;
  };
  colorblindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia";
  pixelFilter?: "hd" | "pixel_8bit" | "crt_retro";
  controlScheme?: "QUAKE_KEYBOARD" | "MODERN_WASD";
  keyboardTurnSpeed?: number;
  showFps: boolean;
  showPing: boolean;
  keybinds: {
    forward: string;
    backward: string;
    left: string;
    right: string;
    jump: string;
    crouchSlide: string;
    dash: string;
    reload: string;
    inspect: string;
    primaryWeapon: string;
    secondaryWeapon: string;
    melee: string;
    grapple: string;
  };
}

export interface LuauMod {
  id: string;
  title: string;
  author: string;
  description: string;
  category: "PHYSICS" | "WEAPONS" | "MUTATOR" | "VISUAL";
  scriptCode: string;
  active: boolean;
  downloads: number;
  likes: number;
  version: string;
  parameters: {
    gravityMultiplier?: number;
    jumpPowerMultiplier?: number;
    speedMultiplier?: number;
    bulletVelocityMultiplier?: number;
    unlimitedAmmo?: boolean;
    headshotOnly?: boolean;
    lifestealPercentage?: number;
    slidingFriction?: number;
  };
}

export interface MatchState {
  isActive: boolean;
  isPaused: boolean;
  mode: GameMode;
  mapId: MapId;
  round: number;
  playerScore: number;
  opponentScore: number;
  roundsToWin: number;
  roundTimeLeft: number;
  winner: "player" | "opponent" | null;
  matchOver: boolean;
  opponentName: string;
  opponentElo: number;
  opponentRank: RankTier;
  opponentHp: number;
  opponentMaxHp: number;
  opponentAvatarColor: string;
  playerHp: number;
  playerMaxHp: number;
  stamina: number;
  maxStamina: number;
  isSliding: boolean;
  isDashing: boolean;
  isGrappling: boolean;
  isGrounded: boolean;
  killfeed: KillfeedEntry[];
  damageNumbers: DamagePopup[];
  hitmarker: {
    active: boolean;
    isHeadshot: boolean;
    timestamp: number;
  };
  telemetry: {
    shotsFired: number;
    shotsHit: number;
    headshotHits: number;
    damageDealt: number;
    damageTaken: number;
    maxSpeedReached: number;
    dashCount: number;
    slideCount: number;
    bunnyhopChains: number;
  };
}

export interface KillfeedEntry {
  id: string;
  killer: string;
  victim: string;
  weaponName: string;
  isHeadshot: boolean;
  isWallbang?: boolean;
  timeAgo: number;
}

export interface DamagePopup {
  id: string | number;
  damage: number;
  isHeadshot: boolean;
  position?: { x: number; y: number; z: number };
  x?: number; // screen coords or 3D
  y?: number;
  opacity?: number;
}

export interface LeaderboardEntry {
  userId: string;
  rank: number;
  username: string;
  elo: number;
  rankTier: string;
  winRate: number;
  kdr: number;
  headshotPct: number;
  favoriteWeapon: string;
  winStreak: number;
  verified: boolean;
}

export interface TournamentBracket {
  id: string;
  title: string;
  status: "REGISTRATION" | "ROUND_OF_16" | "QUARTERFINALS" | "SEMIFINALS" | "FINALS" | "COMPLETED";
  prizePool: string;
  rounds: {
    roundName: string;
    matches: {
      id: string;
      player1: { name: string; elo: number; score: number; isWinner?: boolean };
      player2: { name: string; elo: number; score: number; isWinner?: boolean };
      status: "SCHEDULED" | "LIVE" | "FINISHED";
    }[];
  }[];
}

export interface AntiCheatLog {
  id: string;
  timestamp: string;
  player: string;
  reason: string;
  entropyScore: number;
  verdict: "BANNED" | "FLAGGED_FOR_REVIEW" | "CLEARED";
  system: "SENTINEL_HYPERION_V4";
}
