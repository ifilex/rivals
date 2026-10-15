import * as THREE from "three";

// Cache created textures to prevent re-creation
const textureCache = new Map<string, THREE.CanvasTexture>();

function createPixelTexture(
  name: string,
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture {
  if (textureCache.has(name)) {
    return textureCache.get(name)!;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    drawFn(ctx, width, height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set(name, texture);
  return texture;
}

// 1. Stone Bricks (Minecraft / Roblox Castle Brick)
export function getStoneBrickTexture(): THREE.CanvasTexture {
  return createPixelTexture("stone_brick", 32, 32, (ctx, w, h) => {
    // Base stone grey
    ctx.fillStyle = "#64748b";
    ctx.fillRect(0, 0, w, h);

    // Random stone speckles
    for (let x = 0; x < w; x += 2) {
      for (let y = 0; y < h; y += 2) {
        const noise = (Math.random() - 0.5) * 30;
        const base = 100 + noise;
        ctx.fillStyle = `rgb(${base}, ${base + 5}, ${base + 12})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Brick mortar lines (Row 1: 0..15, Row 2: 16..31)
    ctx.fillStyle = "#334155";
    ctx.fillRect(0, 15, w, 2);
    ctx.fillRect(0, 30, w, 2);
    ctx.fillRect(15, 0, 2, 16);
    ctx.fillRect(7, 16, 2, 16);
    ctx.fillRect(23, 16, 2, 16);

    // Highlight top-left of bricks
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    ctx.fillRect(0, 0, w, 1);
    ctx.fillRect(0, 17, w, 1);
  });
}

// 1b. Minecraft Cobblestone Texture
export function getCobblestoneTexture(): THREE.CanvasTexture {
  return createPixelTexture("cobblestone", 32, 32, (ctx, w, h) => {
    ctx.fillStyle = "#475569";
    ctx.fillRect(0, 0, w, h);

    // Cobble patches
    const patches = [
      { x: 0, y: 0, w: 10, h: 10, c: "#64748b" },
      { x: 12, y: 2, w: 18, h: 8, c: "#334155" },
      { x: 2, y: 12, w: 14, h: 10, c: "#94a3b8" },
      { x: 18, y: 12, w: 12, h: 10, c: "#475569" },
      { x: 4, y: 24, w: 14, h: 7, c: "#334155" },
      { x: 20, y: 22, w: 11, h: 9, c: "#64748b" },
    ];
    patches.forEach(p => {
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x, p.y, p.w, p.h);
    });
  });
}

// 1c. Minecraft Grass Top & Dirt Side Texture
export function getGrassTopTexture(): THREE.CanvasTexture {
  return createPixelTexture("grass_top", 32, 32, (ctx, w, h) => {
    ctx.fillStyle = "#15803d"; // Vibrant Minecraft grass green
    ctx.fillRect(0, 0, w, h);

    for (let x = 0; x < w; x += 2) {
      for (let y = 0; y < h; y += 2) {
        const r = 21 + Math.floor(Math.random() * 20);
        const g = 128 + Math.floor(Math.random() * 45);
        const b = 61 + Math.floor(Math.random() * 20);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }
  });
}

export function getDirtSideTexture(): THREE.CanvasTexture {
  return createPixelTexture("dirt_side", 32, 32, (ctx, w, h) => {
    // Dirt base
    ctx.fillStyle = "#78350f";
    ctx.fillRect(0, 0, w, h);

    for (let x = 0; x < w; x += 2) {
      for (let y = 0; y < h; y += 2) {
        const val = 90 + Math.floor((Math.random() - 0.5) * 30);
        ctx.fillStyle = `rgb(${val + 20}, ${val}, ${Math.floor(val * 0.3)})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Top grass overhang
    ctx.fillStyle = "#16a34a";
    ctx.fillRect(0, 0, w, 5);
    for (let x = 0; x < w; x += 4) {
      const drop = Math.floor(Math.random() * 5);
      ctx.fillRect(x, 5, 3, drop);
    }
  });
}

// 1d. Minecraft Diamond Ore Block
export function getDiamondOreTexture(): THREE.CanvasTexture {
  return createPixelTexture("diamond_ore", 32, 32, (ctx, w, h) => {
    ctx.fillStyle = "#475569";
    ctx.fillRect(0, 0, w, h);

    for (let x = 0; x < w; x += 2) {
      for (let y = 0; y < h; y += 2) {
        const noise = (Math.random() - 0.5) * 20;
        const val = Math.floor(75 + noise);
        ctx.fillStyle = `rgb(${val}, ${val + 5}, ${val + 10})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Cyan Diamond gems embedded
    const gemCoords = [
      [6, 6], [10, 8], [8, 12],
      [20, 18], [24, 20], [22, 24],
      [22, 6], [8, 22]
    ];
    gemCoords.forEach(([gx, gy]) => {
      ctx.fillStyle = "#06b6d4";
      ctx.fillRect(gx, gy, 4, 4);
      ctx.fillStyle = "#a5f3fc";
      ctx.fillRect(gx + 1, gy + 1, 2, 2);
      ctx.fillStyle = "#0891b2";
      ctx.fillRect(gx + 3, gy + 3, 1, 1);
    });
  });
}

// 1e. Minecraft TNT Block
export function getTntTexture(): THREE.CanvasTexture {
  return createPixelTexture("tnt_side", 32, 32, (ctx, w, h) => {
    // Red dynamite sticks
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(0, 0, w, h);

    // Individual sticks
    for (let x = 0; x < w; x += 4) {
      ctx.fillStyle = "#b91c1c";
      ctx.fillRect(x, 0, 1, h);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(x + 1, 0, 2, h);
    }

    // White paper band with TNT letters
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 10, w, 12);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 9px monospace";
    ctx.fillText("TNT", 6, 19);
  });
}

// 1f. Slime Jump Pad (Minecraft Slime Block)
export function getSlimeBlockTexture(): THREE.CanvasTexture {
  return createPixelTexture("slime_block", 32, 32, (ctx, w, h) => {
    // Slime core
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(0, 0, w, h);

    // Translucent jelly outer rim
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(2, 2, w - 4, h - 4);

    ctx.fillStyle = "#15803d";
    ctx.fillRect(8, 8, 16, 16);

    ctx.fillStyle = "#86efac";
    ctx.fillRect(9, 9, 6, 6);

    // Hazard yellow-black border
    ctx.fillStyle = "#facc15";
    ctx.fillRect(0, 0, w, 2);
    ctx.fillRect(0, h - 2, w, 2);
    ctx.fillRect(0, 0, 2, h);
    ctx.fillRect(w - 2, 0, 2, h);
  });
}

// 2. Wooden Crate (Minecraft Oak / Roblox Supply Box)
export function getWoodCrateTexture(): THREE.CanvasTexture {
  return createPixelTexture("wood_crate", 32, 32, (ctx, w, h) => {
    // Wood plank background
    ctx.fillStyle = "#b45309";
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const shade = Math.floor(160 + (Math.random() - 0.5) * 40);
        ctx.fillStyle = `rgb(${shade}, ${Math.floor(shade * 0.55)}, ${Math.floor(shade * 0.2)})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Dark border frame
    ctx.fillStyle = "#78350f";
    ctx.fillRect(0, 0, w, 3);
    ctx.fillRect(0, h - 3, w, 3);
    ctx.fillRect(0, 0, 3, h);
    ctx.fillRect(w - 3, 0, 3, h);

    // Diagonal brace
    ctx.beginPath();
    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 3;
    ctx.moveTo(3, 3);
    ctx.lineTo(w - 3, h - 3);
    ctx.stroke();

    // Corner metal brackets with screws
    ctx.fillStyle = "#475569";
    ctx.fillRect(0, 0, 6, 6);
    ctx.fillRect(w - 6, 0, 6, 6);
    ctx.fillRect(0, h - 6, 6, 6);
    ctx.fillRect(w - 6, h - 6, 6, 6);

    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(2, 2, 2, 2);
    ctx.fillRect(w - 4, 2, 2, 2);
    ctx.fillRect(2, h - 4, 2, 2);
    ctx.fillRect(w - 4, h - 4, 2, 2);
  });
}

// 3. Shipping Container Texture (Corrugated Metal)
export function getContainerTexture(colorHex: string): THREE.CanvasTexture {
  return createPixelTexture(`container_${colorHex}`, 32, 32, (ctx, w, h) => {
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, w, h);

    // Vertical corrugated stripes
    for (let x = 0; x < w; x += 4) {
      // Highlight stripe
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.fillRect(x, 0, 1, h);
      // Shadow groove
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(x + 2, 0, 2, h);
    }

    // Top and bottom heavy steel rims
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, w, 3);
    ctx.fillRect(0, h - 3, w, 3);

    // Stencil logo / hazard stripe
    ctx.fillStyle = "#facc15";
    ctx.fillRect(10, 12, 12, 8);
    ctx.fillStyle = "#000000";
    ctx.fillRect(12, 14, 8, 4);
  });
}

// 4. Cyber Obsidian Neon Grid (Neo-Tokyo / Minecraft Obsidian)
export function getCyberGridTexture(neonColorHex: string): THREE.CanvasTexture {
  return createPixelTexture(`cyber_grid_${neonColorHex}`, 32, 32, (ctx, w, h) => {
    // Obsidian dark purple-grey
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, w, h);

    for (let x = 0; x < w; x += 2) {
      for (let y = 0; y < h; y += 2) {
        const val = Math.floor(12 + Math.random() * 10);
        ctx.fillStyle = `rgb(${val}, ${val}, ${val + 4})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Glowing border lines
    ctx.strokeStyle = neonColorHex;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);

    // Center micro circuit dot
    ctx.fillStyle = neonColorHex;
    ctx.fillRect(14, 14, 4, 4);
  });
}

// 5. Jump Pad Texture (Glowing launch pad)
export function getJumpPadTexture(): THREE.CanvasTexture {
  return createPixelTexture("jump_pad", 32, 32, (ctx, w, h) => {
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, w, h);

    // Outer hazard rim
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(0, 0, w, 3);
    ctx.fillRect(0, h - 3, w, 3);
    ctx.fillRect(0, 0, 3, h);
    ctx.fillRect(w - 3, 0, 3, h);

    // Inner bright cyan energy core
    ctx.fillStyle = "#06b6d4";
    ctx.fillRect(6, 6, 20, 20);

    // Upward arrow chevrons
    ctx.fillStyle = "#ffffff";
    // Arrow 1
    ctx.beginPath();
    ctx.moveTo(16, 8);
    ctx.lineTo(24, 16);
    ctx.lineTo(20, 16);
    ctx.lineTo(20, 22);
    ctx.lineTo(12, 22);
    ctx.lineTo(12, 16);
    ctx.lineTo(8, 16);
    ctx.closePath();
    ctx.fill();
  });
}

// 6. Classic Roblox Stud Texture (Embossed Stud Logo)
export function getRobloxStudTexture(colorHex = "#facc15"): THREE.CanvasTexture {
  return createPixelTexture(`roblox_stud_${colorHex}`, 64, 64, (ctx, w, h) => {
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, w, h);

    // Embossed circular stud rim
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.arc(32, 32, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colorHex;
    ctx.beginPath();
    ctx.arc(32, 33, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.arc(32, 34, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colorHex;
    ctx.beginPath();
    ctx.arc(32, 32, 17, 0, Math.PI * 2);
    ctx.fill();

    // Center Roblox Logo Square (Classic Tilt)
    ctx.save();
    ctx.translate(32, 32);
    ctx.rotate(0.25);
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillRect(-7, -7, 14, 14);
    ctx.fillStyle = colorHex;
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();
  });
}

// 7. Iconic Roblox Character Face (Winning Smile / Rivals Cyber Visor)
export function getRobloxFaceTexture(isBot = false): THREE.CanvasTexture {
  return createPixelTexture(`roblox_face_${isBot ? "bot" : "player"}`, 128, 128, (ctx, w, h) => {
    if (isBot) {
      // -------------------------------------------------------------
      // ROBOTIC / CYBER VISOR ROBLOX RIVALS BOT
      // -------------------------------------------------------------
      // Dark cybernetic chassis head
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, w, h);

      // Carbon fibre / bevel head plate
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(10, 10, w - 20, h - 20);

      // Glowing Neon Crimson Visor Screen
      const visorGrad = ctx.createLinearGradient(0, 36, 0, 84);
      visorGrad.addColorStop(0, "#ef4444");
      visorGrad.addColorStop(0.5, "#f87171");
      visorGrad.addColorStop(1, "#991b1b");
      ctx.fillStyle = visorGrad;

      ctx.beginPath();
      ctx.moveTo(18, 42);
      ctx.lineTo(110, 42);
      ctx.lineTo(102, 80);
      ctx.lineTo(26, 80);
      ctx.closePath();
      ctx.fill();

      // Visor Glow Line & Target Crosshair
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(24, 46, 80, 4);

      // Visor Optical Eye HUD
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(42, 60, 8, 0, Math.PI * 2);
      ctx.arc(86, 60, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(42, 60, 4, 0, Math.PI * 2);
      ctx.arc(86, 60, 4, 0, Math.PI * 2);
      ctx.fill();

      // Tactical Audio Grille / Mouth Vent
      ctx.fillStyle = "#020617";
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(40 + i * 10, 96, 6, 12);
      }

      // Headset side earcups indicators
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(2, 45, 8, 38);
      ctx.fillRect(w - 10, 45, 8, 38);
    } else {
      // -------------------------------------------------------------
      // CLASSIC ICONIC ROBLOX WINNING SMILE / "CHECK IT" FACE
      // -------------------------------------------------------------
      // Iconic Roblox Bright Yellow Skin
      ctx.fillStyle = "#facc15";
      ctx.fillRect(0, 0, w, h);

      // Subtle plastic bevel sheen
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fillRect(4, 4, w - 8, 16);

      // Eyebrows (Dynamic confident angle)
      ctx.fillStyle = "#1e293b";
      // Left eyebrow
      ctx.beginPath();
      ctx.moveTo(26, 36);
      ctx.lineTo(54, 30);
      ctx.lineTo(54, 38);
      ctx.lineTo(26, 42);
      ctx.closePath();
      ctx.fill();

      // Right eyebrow
      ctx.beginPath();
      ctx.moveTo(74, 30);
      ctx.lineTo(102, 36);
      ctx.lineTo(102, 42);
      ctx.lineTo(74, 38);
      ctx.closePath();
      ctx.fill();

      // Iconic Roblox Eyes (Smooth curved cartoon ovals with sparkle)
      // Left Eye
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.ellipse(40, 56, 12, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Left Eye Shine
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(37, 50, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(43, 62, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Right Eye
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.ellipse(88, 56, 12, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Right Eye Shine
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(85, 50, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(91, 62, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Iconic Roblox Smirk Smile
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(64, 76, 30, 0.25 * Math.PI, 0.75 * Math.PI, false);
      ctx.stroke();

      // Confident Cheek Smirk dimple
      ctx.beginPath();
      ctx.arc(88, 92, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();
    }
  });
}

// 8. Iconic Roblox Torso Texture (Tactical Blox R Emblem & Ammo Rig)
export function getShirtTexture(colorHex: string, isBot = false): THREE.CanvasTexture {
  return createPixelTexture(`roblox_torso_${colorHex}_${isBot ? "bot" : "player"}`, 128, 128, (ctx, w, h) => {
    // Base Torso Body Color
    ctx.fillStyle = colorHex || "#0284c7";
    ctx.fillRect(0, 0, w, h);

    // Plastic top bevel highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fillRect(0, 0, w, 8);
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, h - 8, w, 8);

    if (isBot) {
      // Cyber Armor Plate for Bot
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(16, 16, 96, 96);

      // Crimson Energy Core in Center
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(48, 48, 32, 32);
      ctx.fillStyle = "#fecaca";
      ctx.fillRect(56, 56, 16, 16);

      // Armor plating lines
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, 88, 88);
      ctx.strokeRect(34, 34, 60, 60);

      // Warning hazard stripes at waist
      ctx.fillStyle = "#f59e0b";
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(20 + i * 16, 98, 8, 14);
      }
    } else {
      // Tactical Roblox Combat Vest with Famous "R" / Blox Logo
      // Tactical chest rig vest
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(16, 20, 96, 88);

      // Vest Neck opening revealing yellow skin
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(48, 0);
      ctx.lineTo(80, 0);
      ctx.lineTo(64, 20);
      ctx.closePath();
      ctx.fill();

      // Iconic Roblox "R" Emblem
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(24, 28, 28, 28);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(28, 32, 20, 20);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(34, 38, 8, 8);

      // Tactical Magazine Pouches
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(24, 66, 24, 34);
      ctx.fillRect(52, 66, 24, 34);
      ctx.fillRect(80, 66, 24, 34);

      // Ammo Pouch clips
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(32, 70, 8, 4);
      ctx.fillRect(60, 70, 8, 4);
      ctx.fillRect(88, 70, 8, 4);

      // Shoulder Straps
      ctx.fillStyle = "#020617";
      ctx.fillRect(20, 0, 16, 24);
      ctx.fillRect(92, 0, 16, 24);
    }
  });
}

// 9. Iconic Roblox Pants / Legs Texture
export function getPantsTexture(colorHex: string, isBot = false): THREE.CanvasTexture {
  return createPixelTexture(`roblox_pants_${colorHex}_${isBot ? "bot" : "player"}`, 128, 128, (ctx, w, h) => {
    // Base Pant Color
    ctx.fillStyle = colorHex || "#1e3a8a";
    ctx.fillRect(0, 0, w, h);

    // Tactical Belt at top
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, w, 18);
    // Belt Buckle (Gold/Silver)
    ctx.fillStyle = isBot ? "#ef4444" : "#f59e0b";
    ctx.fillRect(52, 2, 24, 14);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(58, 6, 12, 6);

    // Tactical Knee Pads
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(20, 52, 88, 28);
    ctx.strokeStyle = isBot ? "#ef4444" : "#38bdf8";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 54, 84, 24);

    // Roblox Sneakers / Combat Boots
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 94, w, 34);

    // White / Neon sneaker sole rim
    ctx.fillStyle = isBot ? "#38bdf8" : "#ffffff";
    ctx.fillRect(0, 118, w, 10);
  });
}

