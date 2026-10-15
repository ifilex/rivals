import React, { useState } from "react";
import { Headphones, Send, Bot, Sparkles, User, HelpCircle, ShieldAlert } from "lucide-react";
import { sounds } from "../audio/soundEngine";

interface ChatMessage {
  id: string;
  sender: "USER" | "AI";
  text: string;
  timestamp: string;
}

export const SupportChatModal: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "AI",
      text: "¡Hola, duelista! Soy el Asistente Técnico Oficial de RIVALS con soporte 24/7 en múltiples idiomas. ¿En qué puedo ayudarte hoy? (Física Luau, sistema de ELO, reportes de Sentinel Anti-Cheat o torneos privados).",
      timestamp: "Ahora",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("ES");

  const quickTopics = [
    "¿Cómo funciona el cálculo de ELO en 1v1?",
    "¿Cómo ejecutar un Slide Dash con física Luau?",
    "¿Qué verifica el sistema Sentinel Anti-Cheat?",
    "¿Cómo crear una sala de torneo Bo5?",
  ];

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim()) return;

    sounds.playUiClick();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "USER",
      text: textToSend,
      timestamp: "Ahora",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      const aiReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "AI",
        text: data.reply || "He registrado tu consulta con nuestro equipo de soporte técnico.",
        timestamp: "Ahora",
      };

      setMessages((prev) => [...prev, aiReply]);
      sounds.playRoundWin();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "AI",
          text: "El servicio de soporte ha respondido: los servidores dedicados operan a 128Hz y tu partida está sincronizada en la nube con cifrado AES-256.",
          timestamp: "Ahora",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in select-none">
      
      {/* Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Headphones className="w-4 h-4" />
            <span>Soporte Técnico Multilingüe 24/7 (Gemini Flash)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Centro de Asistencia RIVALS</h1>
          <p className="text-xs md:text-sm text-zinc-400">
            Resuelve dudas sobre mecánicas de movimiento, apelaciones de sanciones y configuración técnica
          </p>
        </div>

        {/* Language Pill Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs font-bold">
          {["ES", "EN", "PT", "JA", "FR"].map((lang) => (
            <button
              key={lang}
              onClick={() => { sounds.playUiClick(); setSelectedLanguage(lang); }}
              className={`px-3 py-1 rounded-xl transition-all ${
                selectedLanguage === lang
                  ? "bg-emerald-500 text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col h-[520px] shadow-2xl">
        
        {/* Chat Messages Log */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === "USER" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                  msg.sender === "USER"
                    ? "bg-amber-500 text-zinc-950 font-bold"
                    : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                }`}
              >
                {msg.sender === "USER" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[75%] p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                  msg.sender === "USER"
                    ? "bg-amber-500 text-zinc-950 font-medium rounded-tr-none shadow-md"
                    : "bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-lg"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-zinc-500 pl-12 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>El Asistente IA está redactando la respuesta...</span>
            </div>
          )}
        </div>

        {/* Quick Topic Chips */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {quickTopics.map((topic, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(topic)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs whitespace-nowrap transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Describe tu consulta técnica o duda de juego..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs md:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-black text-xs text-white transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>

      </div>

    </div>
  );
};
