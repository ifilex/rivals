import React, { useState } from "react";
import { 
  Trophy, 
  Swords, 
  ShieldCheck, 
  Sparkles, 
  Code2, 
  BarChart3, 
  Settings as SettingsIcon, 
  Headphones, 
  Smartphone, 
  CloudCheck, 
  Bell, 
  Layers,
  Flame,
  Volume2,
  VolumeX
} from "lucide-react";
import { PlayerProfile } from "../types";
import { sounds } from "../audio/soundEngine";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  player: PlayerProfile;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onOpenMobileCompanion: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  player,
  isMuted,
  setIsMuted,
  onOpenMobileCompanion,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [syncedCloudTime, setSyncedCloudTime] = useState("Sincronizado");

  const navItems = [
    { id: "arena", label: "Duelos 1v1", icon: Swords },
    { id: "loadout", label: "Armería & Skins", icon: Layers },
    { id: "ranked", label: "Ranked & Top 100", icon: Trophy },
    { id: "battlepass", label: "Pase S4", icon: Flame },
    { id: "mods", label: "Luau Mods Studio", icon: Code2 },
    { id: "anticheat", label: "Sentinel Anti-Cheat", icon: ShieldCheck },
    { id: "analytics", label: "IA Predictiva & Meta", icon: BarChart3 },
    { id: "tournaments", label: "Torneos & API", icon: Sparkles },
    { id: "support", label: "Soporte 24/7", icon: Headphones },
    { id: "settings", label: "Ajustes", icon: SettingsIcon },
  ];

  return (
    <header className="w-full bg-zinc-950/95 border-b border-zinc-800/80 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Rank Tag */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { sounds.playUiClick(); setActiveTab("arena"); }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-rose-600 to-violet-600 flex items-center justify-center shadow-lg shadow-rose-950/40 border border-amber-400/30">
            <Swords className="w-6 h-6 text-white drop-shadow-md" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-wider text-white bg-gradient-to-r from-white via-zinc-200 to-amber-400 bg-clip-text text-transparent">
                RIVALS
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 tracking-widest">
                1v1 FPS
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
              <span className="text-amber-400 font-semibold">{player.rankTier.replace("_", " ")}</span>
              <span>•</span>
              <span>{player.elo} ELO</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sounds.playUiClick();
                  setActiveTab(item.id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-zinc-800 text-amber-400 shadow-inner border border-zinc-700/80"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-zinc-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Info Bar: Currencies, Cloud Status, Audio, Companion */}
        <div className="flex items-center gap-3">
          
          {/* Cloud Encrypted Sync Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Nube Cifrada (AES-256)</span>
          </div>

          {/* Currency Pill */}
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-800 text-xs">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <span>🪙</span>
              <span>{player.rivalsCoins.toLocaleString()}</span>
            </div>
            <div className="w-[1px] h-3 bg-zinc-700"></div>
            <div className="flex items-center gap-1 text-cyan-400 font-bold">
              <span>💎</span>
              <span>{player.gems}</span>
            </div>
          </div>

          {/* Mobile Companion Trigger */}
          <button
            onClick={() => {
              sounds.playUiClick();
              onOpenMobileCompanion();
            }}
            title="Modo Móvil Companion"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-400 transition-colors"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              sounds.setVolumes(isMuted ? 0.8 : 0, isMuted ? 0.9 : 0);
            }}
            title="Silenciar / Activar Sonido"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Notificaciones del Sistema</h4>
                  <span className="text-[10px] text-amber-400">3 Nuevas</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                    <div className="text-amber-400 font-semibold mb-0.5">🏆 Temporada 4: Cyber Void</div>
                    <p className="text-zinc-400 text-[11px]">La tabla clasificatoria se reinicia en 12 días. ¡Alcanza el rango Apex Rival!</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                    <div className="text-emerald-400 font-semibold mb-0.5">🛡️ Sentinel Vanguard Actualizado</div>
                    <p className="text-zinc-400 text-[11px]">4,812 tramposos eliminados en la última ola automática de 128Hz.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                    <div className="text-cyan-400 font-semibold mb-0.5">🎮 Nuevo Mod Comunitario</div>
                    <p className="text-zinc-400 text-[11px]">Prueba 'Luau Momentum BHop Master' en el Sandbox de Mods.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Tab Nav Sub-bar */}
      <div className="flex lg:hidden items-center gap-1 overflow-x-auto pt-2 mt-1 border-t border-zinc-800/60 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sounds.playUiClick();
                setActiveTab(item.id);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-zinc-800 text-amber-400 border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
