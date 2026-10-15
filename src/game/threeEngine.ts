import * as THREE from "three";
import { GameSettings, LuauMod, MapId, Weapon } from "../types";
import { sounds } from "../audio/soundEngine";
import {
  getStoneBrickTexture,
  getCobblestoneTexture,
  getGrassTopTexture,
  getDirtSideTexture,
  getDiamondOreTexture,
  getTntTexture,
  getSlimeBlockTexture,
  getWoodCrateTexture,
  getContainerTexture,
  getCyberGridTexture,
  getJumpPadTexture,
  getRobloxFaceTexture,
  getShirtTexture,
  getPantsTexture,
  getRobloxStudTexture,
} from "./voxelTextures";
import { VoxelParticleSystem } from "./voxelEffects";

export interface GameEngineCallbacks {
  onHit: (damage: number, isHeadshot: boolean, screenX?: number, screenY?: number) => void;
  onKill: (killerOrHeadshot: boolean | string, victim?: string, isHeadshot?: boolean) => void;
  onPlayerDamaged?: (newHp: number, damage: number) => void;
  onOpponentDamaged?: (newHp: number, damage: number, isHeadshot: boolean) => void;
  onHealthUpdate?: (data: { playerHp: number; opponentHp: number; lastDamage: number; isPlayerVictim: boolean; isHeadshot: boolean }) => void;
  onRoundEnded?: (winner: "YOU" | "OPPONENT", isHeadshot: boolean) => void;
  onAmmoChange: (currentAmmo: number, reserveAmmo: number) => void;
  onMovementStateChange?: (state: { isSliding: boolean; isDashing: boolean; isGrounded: boolean; speed: number; stamina: number }) => void;
  onTelemetryUpdate?: (data: { shotsFired: number; shotsHit: number; headshots: number; maxSpeed: number }) => void;
  onPlayerTakeDamage?: (damage: number) => void;
  onSlideStateChange?: (isSliding: boolean) => void;
  onDashStateChange?: (isDashing: boolean) => void;
  onSpeedUpdate?: (speed: number) => void;
  onOpenPauseMenu?: () => void;
}

interface JumpPad {
  position: THREE.Vector3;
  radius: number;
  power: number;
  lastUsedTime: number;
}

interface WaypointNode {
  pos: THREE.Vector3;
  type: "COVER" | "HIGH_GROUND" | "JUMP_PAD" | "FLANK_LANE" | "CENTER";
  connections: number[];
}

export class ThreeGameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private callbacks: GameEngineCallbacks;
  private settings: GameSettings;
  private currentMod: LuauMod | null = null;
  private animationFrameId: number | null = null;

  // Viewmodel Dual-Camera Rig
  private viewmodelScene: THREE.Scene;
  private viewmodelCamera: THREE.PerspectiveCamera;
  private viewmodelRoot: THREE.Group;
  private currentWeaponMesh: THREE.Group | null = null;
  private muzzleFlashLight: THREE.PointLight | null = null;
  private muzzleFlashMesh: THREE.Mesh | null = null;

  // Particle System
  private particles: VoxelParticleSystem;

  // Authoritative Health
  private playerHp: number = 100;
  private opponentHp: number = 100;
  private isRoundEnding: boolean = false;

  // Player physics state (Luau Momentum Controller)
  private playerPos = new THREE.Vector3(0, 1.6, 14);
  private playerVel = new THREE.Vector3(0, 0, 0);
  private playerRotation = { pitch: 0, yaw: 0 };
  private isGrounded = false;
  private isSliding = false;
  private isDashing = false;
  private isAiming = false;
  private isReloading = false;
  private isInspecting = false;
  private stamina = 100;
  private maxSpeedReached = 0;

  // Controls input state
  private keys: Record<string, boolean> = {};
  private virtualMoveVector = { x: 0, z: 0 };
  private isPointerLocked = false;
  private isFiringHeld = false;

  // Weapon & Combat
  private currentWeapon: Weapon;
  private lastShotTime = 0;
  private recoilPitch = 0;
  private recoilYaw = 0;
  private currentMapId: MapId = "warehouse";

  // Opponent Bot Entity (Minecraft / Roblox Voxel Rig with Articulated IK)
  private opponentGroup: THREE.Group;
  private botHeadPivot: THREE.Group;
  private botTorso: THREE.Mesh;
  private botRightArmPivot: THREE.Group;
  private botLeftArmPivot: THREE.Group;
  private botRightLegPivot: THREE.Group;
  private botLeftLegPivot: THREE.Group;
  private botGunMesh: THREE.Group;
  private botMuzzleFlashLight: THREE.PointLight | null = null;
  private botMuzzleFlashMesh: THREE.Mesh | null = null;

  private opponentPos = new THREE.Vector3(0, 1.6, -14);
  private opponentVel = new THREE.Vector3(0, 0, 0);
  private opponentRotation = 0;
  private opponentName = "Shadow_Sniper";
  private opponentDifficulty: "ROOKIE" | "NORMAL" | "APEX" | "CHEATER" = "NORMAL";
  private opponentShootCooldown = 0;
  private opponentIsDead = false;
  private opponentIsGrounded = true;
  private opponentIsSliding = false;
  private botWalkPhase = 0;
  private botRecoilKick = 0;
  private botStrafeTimer = 0;
  private botStrafeDirection = 1;
  private botJumpTimer = 0;
  private botCurrentState: "PATROL" | "FLANK" | "COMBAT" | "RETREAT" | "RUSH" = "COMBAT";
  private botCurrentWaypointIdx = 0;
  private botWaypointChangeTimer = 0;
  private botAimedPos = new THREE.Vector3(0, 1.6, 14);

  // Advanced Bot Navigation & Anti-Stuck State
  private botLastStuckPos = new THREE.Vector3(0, 1.6, -14);
  private botStuckTimer = 0;
  private botUnstickTimer = 0;
  private botUnstickDirection = new THREE.Vector3(1, 0, 0);
  private botBurstShotsRemaining = 0;
  private botBurstDelayTimer = 0;
  private botPeekTimer = 0;
  private botIsPeeking = false;
  private botFlinchTimer = 0;

  // Jump Pads, Colliders & Waypoints
  private jumpPads: JumpPad[] = [];
  private colliders: THREE.Box3[] = [];
  private waypoints: WaypointNode[] = [];
  private mapGroup: THREE.Group;

  // Telemetry
  private telemetry = {
    shotsFired: 0,
    shotsHit: 0,
    headshots: 0,
    maxSpeed: 0,
  };

  private lastMovementCallbackTime = 0;
  private isMatchActive: boolean = false;
  private ambientAngle: number = 0;

  // Tracers, Grapple & FX
  private bulletTracers: { line: THREE.Line; age: number; maxAge: number }[] = [];
  private grappleLine: THREE.Line | null = null;
  private grappleTarget: THREE.Vector3 | null = null;
  private lastFrameTime = 0;

  // Mouse & Touch Tracking
  private lastMousePos = { x: 0, y: 0 };
  private isMouseDown = false;

  constructor(container: HTMLElement, settings: GameSettings, weapon: Weapon, mapId: MapId, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.settings = settings;
    this.currentWeapon = weapon;
    this.currentMapId = mapId;
    this.callbacks = callbacks;

    // 1. Setup Main World Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.015);

    const aspect = container.clientWidth / container.clientHeight || 1;
    this.camera = new THREE.PerspectiveCamera(settings.fov, aspect, 0.1, 150);
    this.camera.position.set(this.playerPos.x, this.playerPos.y, this.playerPos.z);

    // 2. Viewmodel Dual-Camera (prevents weapon clipping into walls)
    this.viewmodelScene = new THREE.Scene();
    this.viewmodelCamera = new THREE.PerspectiveCamera(settings.viewmodelFov || 75, aspect, 0.01, 10);
    this.viewmodelRoot = new THREE.Group();
    this.viewmodelScene.add(this.viewmodelRoot);

    // 3. WebGL Renderer with 8-Bit Pixelation & HD Filter Modes
    this.renderer = new THREE.WebGLRenderer({
      antialias: settings.pixelFilter === "hd",
      alpha: false,
      powerPreference: "high-performance",
    });
    this.applyResolutionAndFilter();
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.autoClear = false;
    container.appendChild(this.renderer.domElement);

    // 4. Particle System Initialization
    this.particles = new VoxelParticleSystem(this.scene);

    // 5. Lighting Rig
    this.setupLighting();

    // 6. Map & Opponent Entity
    this.mapGroup = new THREE.Group();
    this.scene.add(this.mapGroup);

    this.opponentGroup = new THREE.Group();
    this.scene.add(this.opponentGroup);
    this.buildRobloxOpponentModel();

    // 7. Generate Level Architecture & Waypoints
    this.buildMap(this.currentMapId);

    // 8. Assemble Viewmodel Weapon
    this.buildViewmodelWeapon();

    // 9. Event Listeners
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("contextmenu", this.onContextMenu);
    window.addEventListener("resize", this.onResize);

    document.addEventListener("pointerlockchange", () => {
      const lockEl = document.pointerLockElement;
      this.isPointerLocked = !!lockEl && (
        lockEl === this.container || 
        lockEl === this.renderer.domElement ||
        (this.container && this.container.contains(lockEl))
      );
    });
    document.addEventListener("pointerlockerror", () => {
      this.isPointerLocked = false;
    });

    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  /**
   * Apply 8-bit retro pixelated rendering or HD 1080p
   */
  private applyResolutionAndFilter() {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    const is8Bit = this.settings.pixelFilter === "pixel_8bit" || this.settings.pixelFilter === "crt_retro";
    const scaleFactor = is8Bit ? 0.38 : 1.0;

    const renderW = Math.max(160, Math.floor(width * scaleFactor));
    const renderH = Math.max(90, Math.floor(height * scaleFactor));

    this.renderer.setSize(renderW, renderH, false);
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";

    if (is8Bit) {
      this.renderer.domElement.style.imageRendering = "pixelated";
      this.renderer.setPixelRatio(1);
    } else {
      this.renderer.domElement.style.imageRendering = "auto";
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }

  private setupLighting() {
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x0f172a, 0.75);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.25);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 120;
    const d = 35;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    this.scene.add(dirLight);

    const vmHemi = new THREE.HemisphereLight(0xffffff, 0x475569, 0.95);
    this.viewmodelScene.add(vmHemi);
    const vmDir = new THREE.DirectionalLight(0xfffbeb, 1.15);
    vmDir.position.set(2, 4, 3);
    this.viewmodelScene.add(vmDir);
  }

  // -------------------------------------------------------------
  // Public Controls & API
  // -------------------------------------------------------------
  public setIsMatchActive(active: boolean) {
    this.isMatchActive = active;
    if (this.viewmodelRoot) {
      this.viewmodelRoot.visible = active;
    }
    if (active) {
      this.resetRound();
    } else {
      this.exitPointerLock();
    }
  }

  public setSettings(settings: GameSettings) {
    const filterChanged = this.settings.pixelFilter !== settings.pixelFilter;
    this.settings = settings;
    if (this.camera) {
      this.camera.fov = settings.fov;
      this.camera.updateProjectionMatrix();
    }
    if (filterChanged) {
      this.applyResolutionAndFilter();
    }
  }

  public setMod(mod: LuauMod | null) {
    this.currentMod = mod;
  }

  public setWeapon(weapon: Weapon) {
    this.currentWeapon = { ...weapon };
    this.buildViewmodelWeapon();
    this.callbacks.onAmmoChange(this.currentWeapon.currentAmmo, this.currentWeapon.reserveAmmo);
  }

  public loadMap(mapId: MapId) {
    this.currentMapId = mapId;
    this.buildMap(mapId);
    this.resetRound();
  }

  public resetMatch(botDifficulty: "ROOKIE" | "NORMAL" | "APEX" | "CHEATER" = "NORMAL") {
    this.opponentDifficulty = botDifficulty;
    this.opponentName = botDifficulty === "CHEATER" ? "X_SpinBot_99" : botDifficulty === "APEX" ? "Viper_Apex" : "Shadow_Sniper";
    this.telemetry = { shotsFired: 0, shotsHit: 0, headshots: 0, maxSpeed: 0 };
    this.isRoundEnding = false;
    this.resetRound();
  }

  public requestPointerLock() {
    try {
      const el = this.renderer?.domElement || this.container;
      if (el && typeof el.requestPointerLock === "function") {
        const req = el.requestPointerLock();
        if (req && typeof (req as any).catch === "function") {
          (req as any).catch(() => {});
        }
      }
    } catch {}
  }

  public exitPointerLock() {
    try {
      if (document.exitPointerLock) {
        document.exitPointerLock();
      }
    } catch {}
  }

  public setVirtualMoveVector(vector: { x: number; z: number }) {
    this.virtualMoveVector = vector;
  }

  public applyTouchLook(deltaX: number, deltaY: number) {
    const sens = this.settings.mouseSensitivity * 0.0035;
    this.playerRotation.yaw -= deltaX * sens;
    this.playerRotation.pitch -= deltaY * sens;
    this.playerRotation.pitch = Math.max(-1.55, Math.min(1.55, this.playerRotation.pitch));
  }

  public setFiringHeld(held: boolean) {
    this.isFiringHeld = held;
    if (held) {
      this.shoot();
    }
  }

  public jump() {
    if (!this.isMatchActive || !this.isGrounded) return;
    let jumpPower = 9.8;
    if (this.currentMod?.parameters.jumpPowerMultiplier) {
      jumpPower *= this.currentMod.parameters.jumpPowerMultiplier;
    }
    this.playerVel.y = jumpPower;
    this.isGrounded = false;
    sounds.playMovement("JUMP");
  }

  public startSlide() {
    if (!this.isMatchActive || !this.isGrounded || this.isSliding || this.stamina < 20) return;
    this.isSliding = true;
    this.stamina = Math.max(0, this.stamina - 20);
    sounds.playMovement("SLIDE");
    this.callbacks.onSlideStateChange?.(true);

    // Slide impulse in facing direction
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerRotation.yaw);
    this.playerVel.x += forward.x * 14.5;
    this.playerVel.z += forward.z * 14.5;

    setTimeout(() => {
      this.isSliding = false;
      this.callbacks.onSlideStateChange?.(false);
    }, 600);
  }

  public performDash() {
    if (!this.isMatchActive || this.isDashing || this.stamina < 30) return;
    this.isDashing = true;
    this.stamina = Math.max(0, this.stamina - 30);
    sounds.playMovement("DASH");
    this.callbacks.onDashStateChange?.(true);

    const moveDir = new THREE.Vector3(0, 0, 0);
    const isW = this.keys["w"] || this.keys["arrowup"] || this.keys["keyw"];
    const isS = this.keys["s"] || this.keys["arrowdown"] || this.keys["keys"];
    const isA = this.keys["a"] || this.keys["arrowleft"] || this.keys["keya"];
    const isD = this.keys["d"] || this.keys["arrowright"] || this.keys["keyd"];

    if (isW) moveDir.z -= 1;
    if (isS) moveDir.z += 1;
    if (isA) moveDir.x -= 1;
    if (isD) moveDir.x += 1;

    if (this.virtualMoveVector.x !== 0 || this.virtualMoveVector.z !== 0) {
      moveDir.x = this.virtualMoveVector.x;
      moveDir.z = this.virtualMoveVector.z;
    }

    if (moveDir.lengthSq() === 0) moveDir.z = -1;
    moveDir.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerRotation.yaw);

    this.playerVel.x = moveDir.x * 22.0;
    this.playerVel.z = moveDir.z * 22.0;
    this.playerVel.y = Math.max(this.playerVel.y, 4.0);

    setTimeout(() => {
      this.isDashing = false;
      this.callbacks.onDashStateChange?.(false);
    }, 350);
  }

  public reload() {
    if (!this.isMatchActive || this.isReloading || this.currentWeapon.currentAmmo === this.currentWeapon.magazineSize) return;
    if (this.currentWeapon.reserveAmmo <= 0) return;

    this.isReloading = true;
    sounds.playReload();

    setTimeout(() => {
      const needed = this.currentWeapon.magazineSize - this.currentWeapon.currentAmmo;
      const amount = Math.min(needed, this.currentWeapon.reserveAmmo);
      this.currentWeapon.currentAmmo += amount;
      this.currentWeapon.reserveAmmo -= amount;
      this.isReloading = false;
      this.callbacks.onAmmoChange(this.currentWeapon.currentAmmo, this.currentWeapon.reserveAmmo);
    }, this.currentWeapon.reloadTime * 1000);
  }

  public inspectWeapon() {
    this.isInspecting = true;
    setTimeout(() => {
      this.isInspecting = false;
    }, 1500);
  }

  public resetRound(playerSpawnPos = new THREE.Vector3(0, 1.6, 14), opponentSpawnPos = new THREE.Vector3(0, 1.6, -14)) {
    this.playerHp = 100;
    this.opponentHp = 100;
    this.isRoundEnding = false;

    this.playerPos.copy(playerSpawnPos);
    this.playerVel.set(0, 0, 0);
    this.playerRotation.pitch = 0;
    this.playerRotation.yaw = Math.PI; // Face opponent
    this.isGrounded = true;
    this.isSliding = false;
    this.isDashing = false;
    this.stamina = 100;

    this.opponentPos.copy(opponentSpawnPos);
    this.opponentVel.set(0, 0, 0);
    this.opponentRotation = 0; // Face player
    this.opponentIsDead = false;
    this.opponentIsSliding = false;
    this.opponentGroup.visible = true;
    this.opponentGroup.position.copy(this.opponentPos);
    this.updateOpponentBillboard();

    this.currentWeapon.currentAmmo = this.currentWeapon.magazineSize;
    this.callbacks.onAmmoChange(this.currentWeapon.currentAmmo, this.currentWeapon.reserveAmmo);
    this.callbacks.onHealthUpdate?.({
      playerHp: 100,
      opponentHp: 100,
      lastDamage: 0,
      isPlayerVictim: false,
      isHeadshot: false,
    });
    this.callbacks.onOpponentDamaged?.(100, 0, false);
    this.callbacks.onPlayerDamaged?.(100, 0);
  }

  // -------------------------------------------------------------
  // Minecraft & Voxel Architecture Level Generation
  // -------------------------------------------------------------
  private buildMap(mapId: MapId) {
    while (this.mapGroup.children.length > 0) {
      this.mapGroup.remove(this.mapGroup.children[0]);
    }
    this.colliders = [];
    this.jumpPads = [];
    this.waypoints = [];

    // Base materials with Minecraft style crisp pixel textures
    const stoneBrickTex = getStoneBrickTexture();
    const cobblestoneTex = getCobblestoneTexture();
    const grassTopTex = getGrassTopTexture();
    const dirtSideTex = getDirtSideTexture();

    const stoneBrickMat = new THREE.MeshStandardMaterial({ map: stoneBrickTex, roughness: 0.65 });
    const cobbleMat = new THREE.MeshStandardMaterial({ map: cobblestoneTex, roughness: 0.75 });
    
    // Minecraft Grass Block multi-material
    const grassMaterials = [
      new THREE.MeshStandardMaterial({ map: dirtSideTex, roughness: 0.8 }), // right
      new THREE.MeshStandardMaterial({ map: dirtSideTex, roughness: 0.8 }), // left
      new THREE.MeshStandardMaterial({ map: grassTopTex, roughness: 0.7 }),  // top
      new THREE.MeshStandardMaterial({ map: dirtSideTex, roughness: 0.8 }), // bottom
      new THREE.MeshStandardMaterial({ map: dirtSideTex, roughness: 0.8 }), // front
      new THREE.MeshStandardMaterial({ map: dirtSideTex, roughness: 0.8 }), // back
    ];

    const cyberGridTex = getCyberGridTexture("#38bdf8");
    cyberGridTex.repeat.set(15, 15);
    const cyberFloorMat = new THREE.MeshStandardMaterial({ map: cyberGridTex, roughness: 0.35, metalness: 0.4 });

    // Main Floor
    const floorGeo = new THREE.BoxGeometry(64, 2, 64);
    const floorMat = mapId === "cyber_arena" ? cyberFloorMat : mapId === "neon_courtyard" ? grassMaterials : stoneBrickMat;
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, -1, 0);
    floor.receiveShadow = true;
    this.mapGroup.add(floor);
    this.colliders.push(new THREE.Box3().setFromObject(floor));

    // Outer Perimeter Voxel Walls (64x64 Arena)
    const wallConfigs = [
      { size: [64, 10, 2], pos: [0, 5, -32] },
      { size: [64, 10, 2], pos: [0, 5, 32] },
      { size: [2, 10, 64], pos: [-32, 5, 0] },
      { size: [2, 10, 64], pos: [32, 5, 0] },
    ];

    wallConfigs.forEach((c) => {
      const wGeo = new THREE.BoxGeometry(c.size[0], c.size[1], c.size[2]);
      const wall = new THREE.Mesh(wGeo, cobbleMat);
      wall.position.set(c.pos[0], c.pos[1], c.pos[2]);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.mapGroup.add(wall);
      this.colliders.push(new THREE.Box3().setFromObject(wall));
    });

    if (mapId === "warehouse") {
      this.buildWarehouseMap();
    } else if (mapId === "cyber_arena") {
      this.buildCyberArenaMap();
    } else if (mapId === "temple_ruins") {
      this.buildTempleMap();
    } else {
      this.buildNeonCourtyardMap();
    }
  }

  private buildWarehouseMap() {
    // 1. Colorful Shipping Containers (Voxel Blocks)
    this.createVoxelContainer(0, 2, 0, 7, 4, 12, "#2563eb", 0); // Center blue hub
    this.createVoxelContainer(-12, 2, -10, 8, 4, 4, "#dc2626", 0); // Red container
    this.createVoxelContainer(12, 2, 10, 8, 4, 4, "#16a34a", 0); // Green container
    this.createVoxelContainer(-14, 2, 12, 6, 4, 4, "#ca8a04", 0); // Yellow container
    this.createVoxelContainer(14, 2, -12, 6, 4, 4, "#9333ea", 0); // Purple container

    // 2. Central Elevated Catwalk (Minecraft Steel Bridge)
    const bridgeGeo = new THREE.BoxGeometry(26, 0.6, 7);
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.set(0, 4.3, 0);
    bridge.castShadow = true;
    bridge.receiveShadow = true;
    this.mapGroup.add(bridge);
    this.colliders.push(new THREE.Box3().setFromObject(bridge));

    // Bridge Guardrails
    const railMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
    const rail1 = new THREE.Mesh(new THREE.BoxGeometry(26, 0.8, 0.2), railMat);
    rail1.position.set(0, 5.0, 3.4);
    this.mapGroup.add(rail1);
    const rail2 = new THREE.Mesh(new THREE.BoxGeometry(26, 0.8, 0.2), railMat);
    rail2.position.set(0, 5.0, -3.4);
    this.mapGroup.add(rail2);

    // 3. Wooden Cover Crates & TNT Blocks
    this.createVoxelCrate(-5, 1, 8, 2, 2, 2);
    this.createVoxelCrate(-7, 1, 8, 2, 2, 2);
    this.createVoxelCrate(5, 1, -8, 2, 2, 2);
    this.createVoxelCrate(7, 1, -8, 2, 2, 2);
    this.createTntBlock(0, 1, 9);
    this.createTntBlock(0, 1, -9);

    // 4. Slime Jump Pads
    this.createJumpPad(-12, 0.1, 0, 16.5);
    this.createJumpPad(12, 0.1, 0, 16.5);

    // 5. Waypoints for Tactical Bot Graph
    this.waypoints = [
      { pos: new THREE.Vector3(0, 1.6, -14), type: "COVER", connections: [1, 2, 5] },
      { pos: new THREE.Vector3(-12, 1.6, -10), type: "COVER", connections: [0, 3, 5] },
      { pos: new THREE.Vector3(12, 1.6, -10), type: "COVER", connections: [0, 4, 5] },
      { pos: new THREE.Vector3(-12, 0.1, 0), type: "JUMP_PAD", connections: [1, 5, 7] },
      { pos: new THREE.Vector3(12, 0.1, 0), type: "JUMP_PAD", connections: [2, 5, 8] },
      { pos: new THREE.Vector3(0, 1.6, 0), type: "CENTER", connections: [0, 1, 2, 3, 4, 6] },
      { pos: new THREE.Vector3(0, 5.0, 0), type: "HIGH_GROUND", connections: [3, 4, 5] },
      { pos: new THREE.Vector3(-12, 1.6, 10), type: "FLANK_LANE", connections: [3, 9] },
      { pos: new THREE.Vector3(12, 1.6, 10), type: "FLANK_LANE", connections: [4, 9] },
      { pos: new THREE.Vector3(0, 1.6, 14), type: "COVER", connections: [7, 8, 5] },
    ];
  }

  private buildCyberArenaMap() {
    this.createNeonPillar(-10, 4, -10, 0xec4899);
    this.createNeonPillar(10, 4, -10, 0x06b6d4);
    this.createNeonPillar(-10, 4, 10, 0x06b6d4);
    this.createNeonPillar(10, 4, 10, 0xec4899);

    const daisGeo = new THREE.BoxGeometry(10, 3, 10);
    const daisMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.9 });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.set(0, 1.5, 0);
    dais.castShadow = true;
    dais.receiveShadow = true;
    this.mapGroup.add(dais);
    this.colliders.push(new THREE.Box3().setFromObject(dais));

    this.createJumpPad(0, 0.1, 10, 17);
    this.createJumpPad(0, 0.1, -10, 17);
    this.createJumpPad(-16, 0.1, 0, 18);
    this.createJumpPad(16, 0.1, 0, 18);

    this.waypoints = [
      { pos: new THREE.Vector3(0, 1.6, -14), type: "COVER", connections: [1, 2, 4] },
      { pos: new THREE.Vector3(-10, 1.6, -10), type: "COVER", connections: [0, 4] },
      { pos: new THREE.Vector3(10, 1.6, -10), type: "COVER", connections: [0, 4] },
      { pos: new THREE.Vector3(0, 0.1, -10), type: "JUMP_PAD", connections: [0, 5] },
      { pos: new THREE.Vector3(-16, 0.1, 0), type: "JUMP_PAD", connections: [1, 5] },
      { pos: new THREE.Vector3(0, 3.5, 0), type: "HIGH_GROUND", connections: [3, 4, 6] },
      { pos: new THREE.Vector3(0, 1.6, 14), type: "COVER", connections: [5] },
    ];
  }

  private buildTempleMap() {
    const cobbleMat = new THREE.MeshStandardMaterial({ map: getCobblestoneTexture(), roughness: 0.8 });
    const diamondMat = new THREE.MeshStandardMaterial({ map: getDiamondOreTexture(), roughness: 0.5 });

    const columnCoords = [
      [-12, -12], [0, -14], [12, -12],
      [-14, 0], [14, 0],
      [-12, 12], [0, 14], [12, 12],
    ];

    columnCoords.forEach(([cx, cz]) => {
      const colGeo = new THREE.BoxGeometry(3.5, 10, 3.5);
      const colMesh = new THREE.Mesh(colGeo, cobbleMat);
      colMesh.position.set(cx, 5, cz);
      colMesh.castShadow = true;
      colMesh.receiveShadow = true;
      this.mapGroup.add(colMesh);
      this.colliders.push(new THREE.Box3().setFromObject(colMesh));
    });

    // Diamond Altar in center
    const altarBase = new THREE.Mesh(new THREE.BoxGeometry(12, 2.5, 12), diamondMat);
    altarBase.position.set(0, 1.25, 0);
    altarBase.castShadow = true;
    altarBase.receiveShadow = true;
    this.mapGroup.add(altarBase);
    this.colliders.push(new THREE.Box3().setFromObject(altarBase));

    this.createJumpPad(-12, 0.1, 0, 16);
    this.createJumpPad(12, 0.1, 0, 16);

    this.waypoints = [
      { pos: new THREE.Vector3(0, 1.6, -14), type: "COVER", connections: [1, 2] },
      { pos: new THREE.Vector3(-12, 1.6, -12), type: "COVER", connections: [0, 3] },
      { pos: new THREE.Vector3(12, 1.6, -12), type: "COVER", connections: [0, 4] },
      { pos: new THREE.Vector3(-12, 0.1, 0), type: "JUMP_PAD", connections: [1, 5] },
      { pos: new THREE.Vector3(12, 0.1, 0), type: "JUMP_PAD", connections: [2, 5] },
      { pos: new THREE.Vector3(0, 2.8, 0), type: "HIGH_GROUND", connections: [3, 4] },
      { pos: new THREE.Vector3(0, 1.6, 14), type: "COVER", connections: [5] },
    ];
  }

  private buildNeonCourtyardMap() {
    this.createVoxelContainer(-8, 2, -6, 6, 4, 4, "#0284c7", 0);
    this.createVoxelContainer(8, 2, 6, 6, 4, 4, "#e11d48", 0);

    this.createVoxelCrate(-4, 1.5, 4, 3, 3, 3);
    this.createVoxelCrate(4, 1.5, -4, 3, 3, 3);

    this.createJumpPad(0, 0.1, 0, 18);

    this.waypoints = [
      { pos: new THREE.Vector3(0, 1.6, -14), type: "COVER", connections: [1, 2] },
      { pos: new THREE.Vector3(-8, 1.6, -6), type: "COVER", connections: [0, 3] },
      { pos: new THREE.Vector3(8, 1.6, 6), type: "COVER", connections: [0, 3] },
      { pos: new THREE.Vector3(0, 0.1, 0), type: "JUMP_PAD", connections: [1, 2] },
      { pos: new THREE.Vector3(0, 1.6, 14), type: "COVER", connections: [3] },
    ];
  }

  private createVoxelContainer(x: number, y: number, z: number, w: number, h: number, d: number, colorHex: string, rotY: number) {
    const tex = getContainerTexture(colorHex);
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3, metalness: 0.5 });
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    (mesh as any).voxelType = "metal";
    this.mapGroup.add(mesh);
    this.colliders.push(new THREE.Box3().setFromObject(mesh));
  }

  private createVoxelCrate(x: number, y: number, z: number, w: number, h: number, d: number) {
    const tex = getWoodCrateTexture();
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    (mesh as any).voxelType = "wood";
    this.mapGroup.add(mesh);
    this.colliders.push(new THREE.Box3().setFromObject(mesh));
  }

  private createTntBlock(x: number, y: number, z: number) {
    const tex = getTntTexture();
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
    const geo = new THREE.BoxGeometry(2, 2, 2);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    (mesh as any).voxelType = "wood";
    this.mapGroup.add(mesh);
    this.colliders.push(new THREE.Box3().setFromObject(mesh));
  }

  private createNeonPillar(x: number, h: number, z: number, neonColor: number) {
    const geo = new THREE.BoxGeometry(3.5, h * 2, 3.5);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: neonColor,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    (mesh as any).voxelType = "neon";
    this.mapGroup.add(mesh);
    this.colliders.push(new THREE.Box3().setFromObject(mesh));
  }

  private createJumpPad(x: number, y: number, z: number, power = 16.0) {
    const padTex = getSlimeBlockTexture();
    const padGeo = new THREE.BoxGeometry(2.4, 0.2, 2.4);
    const padMat = new THREE.MeshStandardMaterial({ map: padTex, roughness: 0.3, emissive: 0x22c55e, emissiveIntensity: 0.35 });
    const mesh = new THREE.Mesh(padGeo, padMat);
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    this.mapGroup.add(mesh);

    this.jumpPads.push({
      position: new THREE.Vector3(x, y, z),
      radius: 1.4,
      power,
      lastUsedTime: 0,
    });
  }

  // -------------------------------------------------------------
  // Authentic Roblox R6 Character Rig (Studs, Headset, Armor & IK)
  // -------------------------------------------------------------
  private buildRobloxOpponentModel() {
    while (this.opponentGroup.children.length > 0) {
      this.opponentGroup.remove(this.opponentGroup.children[0]);
    }

    const skinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.3 }); // Dark Cyber Bot skin
    const shirtTex = getShirtTexture("#0f172a", true);
    const shirtMat = new THREE.MeshStandardMaterial({ map: shirtTex, roughness: 0.4 });
    const pantsTex = getPantsTexture("#1e293b", true);
    const pantsMat = new THREE.MeshStandardMaterial({ map: pantsTex, roughness: 0.5 });
    const studTex = getRobloxStudTexture("#ef4444");
    const studMat = new THREE.MeshStandardMaterial({ map: studTex, roughness: 0.3, emissive: 0xef4444, emissiveIntensity: 0.4 });

    // 1. Roblox Blocky Torso (1.2 x 1.2 x 0.6)
    const torsoGeo = new THREE.BoxGeometry(1.2, 1.2, 0.6);
    this.botTorso = new THREE.Mesh(torsoGeo, shirtMat);
    this.botTorso.position.set(0, 0.6, 0);
    this.botTorso.castShadow = true;
    this.opponentGroup.add(this.botTorso);

    // 1b. Roblox Shoulder Studs on Torso Top (Classic Roblox Aesthetic)
    const shoulderStudGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
    const leftShoulderStud = new THREE.Mesh(shoulderStudGeo, studMat);
    leftShoulderStud.position.set(-0.42, 0.64, 0);
    this.botTorso.add(leftShoulderStud);

    const rightShoulderStud = new THREE.Mesh(shoulderStudGeo, studMat);
    rightShoulderStud.position.set(0.42, 0.64, 0);
    this.botTorso.add(rightShoulderStud);

    // 1c. Tactical Cyber Backpack / Booster on Back of Torso
    const packGeo = new THREE.BoxGeometry(0.8, 0.9, 0.28);
    const packMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.3, metalness: 0.8 });
    const packMesh = new THREE.Mesh(packGeo, packMat);
    packMesh.position.set(0, 0, -0.42);
    this.botTorso.add(packMesh);

    // Backpack glowing thruster exhausts
    const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.15, 12);
    const exhaustMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.8 });
    const leftExhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    leftExhaust.position.set(-0.24, -0.38, -0.45);
    this.botTorso.add(leftExhaust);

    const rightExhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    rightExhaust.position.set(0.24, -0.38, -0.45);
    this.botTorso.add(rightExhaust);

    // 2. Head Pivot & Mesh with Pixel Face Texture & Top Stud
    this.botHeadPivot = new THREE.Group();
    this.botHeadPivot.position.set(0, 1.25, 0);

    const headFaceTex = getRobloxFaceTexture(true);
    const headFaceMat = new THREE.MeshStandardMaterial({ map: headFaceTex, roughness: 0.4 });
    const headMats = [
      skinMat, skinMat, skinMat, skinMat,
      headFaceMat, // Front Face
      skinMat,     // Back
    ];
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), headMats);
    headMesh.position.set(0, 0.4, 0);
    headMesh.castShadow = true;
    this.botHeadPivot.add(headMesh);

    // 2b. Iconic Roblox Head Cylinder Stud on Top!
    const headStudGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 16);
    const headStud = new THREE.Mesh(headStudGeo, studMat);
    headStud.position.set(0, 0.88, 0);
    headStud.castShadow = true;
    this.botHeadPivot.add(headStud);

    // 2c. Roblox Gamer Headset (Headband + Earcups with Neon Accents)
    const headsetBandGeo = new THREE.TorusGeometry(0.44, 0.04, 8, 16, Math.PI);
    const headsetMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9, roughness: 0.2 });
    const headsetBand = new THREE.Mesh(headsetBandGeo, headsetMat);
    headsetBand.rotation.x = Math.PI / 2;
    headsetBand.position.set(0, 0.44, 0);
    this.botHeadPivot.add(headsetBand);

    const earcupGeo = new THREE.BoxGeometry(0.12, 0.34, 0.34);
    const earcupMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0xef4444,
      emissiveIntensity: 0.5,
      roughness: 0.3,
    });
    const leftEarcup = new THREE.Mesh(earcupGeo, earcupMat);
    leftEarcup.position.set(-0.46, 0.4, 0);
    this.botHeadPivot.add(leftEarcup);

    const rightEarcup = new THREE.Mesh(earcupGeo, earcupMat);
    rightEarcup.position.set(0.46, 0.4, 0);
    this.botHeadPivot.add(rightEarcup);

    this.opponentGroup.add(this.botHeadPivot);

    // 3. Right Arm Pivot (Holds Weapon Grip)
    this.botRightArmPivot = new THREE.Group();
    this.botRightArmPivot.position.set(0.85, 1.15, 0);
    const armGeo = new THREE.BoxGeometry(0.48, 1.1, 0.48);
    const rightArmMesh = new THREE.Mesh(armGeo, skinMat);
    rightArmMesh.position.set(0, -0.55, 0);
    rightArmMesh.castShadow = true;
    this.botRightArmPivot.add(rightArmMesh);

    // Tactical Roblox Rifle with Details & Neon Energy Channel
    this.botGunMesh = new THREE.Group();
    const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.9), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 }));
    gunBody.position.set(0, -0.4, 0.4);
    
    // Neon Energy Line on Gun
    const gunRail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.6), new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.8 }));
    gunRail.position.set(0, -0.26, 0.4);
    this.botGunMesh.add(gunRail);

    const gunBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 }));
    gunBarrel.rotation.x = Math.PI / 2;
    gunBarrel.position.set(0, -0.38, 0.95);

    const gunScope = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.3), new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9 }));
    gunScope.position.set(0, -0.22, 0.3);

    this.botGunMesh.add(gunBody);
    this.botGunMesh.add(gunBarrel);
    this.botGunMesh.add(gunScope);

    // Bot Muzzle Flash
    const botFlashGeo = new THREE.OctahedronGeometry(0.16);
    const botFlashMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0 });
    this.botMuzzleFlashMesh = new THREE.Mesh(botFlashGeo, botFlashMat);
    this.botMuzzleFlashMesh.position.set(0, -0.38, 1.2);
    this.botGunMesh.add(this.botMuzzleFlashMesh);

    this.botMuzzleFlashLight = new THREE.PointLight(0xf59e0b, 0, 5);
    this.botMuzzleFlashLight.position.set(0, -0.38, 1.2);
    this.botGunMesh.add(this.botMuzzleFlashLight);

    rightArmMesh.add(this.botGunMesh);
    this.opponentGroup.add(this.botRightArmPivot);

    // 4. Left Arm Pivot (Dual-Hand Grip Supporting Front Handguard)
    this.botLeftArmPivot = new THREE.Group();
    this.botLeftArmPivot.position.set(-0.85, 1.15, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, skinMat);
    leftArmMesh.position.set(0, -0.55, 0);
    leftArmMesh.castShadow = true;
    this.botLeftArmPivot.add(leftArmMesh);
    this.opponentGroup.add(this.botLeftArmPivot);

    // 5. Right Leg Pivot (Roblox Blocky Leg)
    this.botRightLegPivot = new THREE.Group();
    this.botRightLegPivot.position.set(0.32, 0.0, 0);
    const legGeo = new THREE.BoxGeometry(0.52, 1.1, 0.52);
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.position.set(0, -0.55, 0);
    rightLegMesh.castShadow = true;
    this.botRightLegPivot.add(rightLegMesh);
    this.opponentGroup.add(this.botRightLegPivot);

    // 6. Left Leg Pivot (Roblox Blocky Leg)
    this.botLeftLegPivot = new THREE.Group();
    this.botLeftLegPivot.position.set(-0.32, 0.0, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.position.set(0, -0.55, 0);
    leftLegMesh.castShadow = true;
    this.botLeftLegPivot.add(leftLegMesh);
    this.opponentGroup.add(this.botLeftLegPivot);

    // Health Billboard above head
    this.createOpponentBillboard();
  }

  private createOpponentBillboard() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(8, 38, 240, 18);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px monospace";
    ctx.fillText(`${this.opponentName} [100 HP]`, 12, 28);

    const tex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.name = "billboard";
    sprite.position.set(0, 2.7, 0);
    sprite.scale.set(2.4, 0.6, 1);
    this.opponentGroup.add(sprite);
  }

  private updateOpponentBillboard() {
    const sprite = this.opponentGroup.getObjectByName("billboard") as THREE.Sprite;
    if (!sprite || !sprite.material.map) return;

    const canvas = sprite.material.map.image as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, 256, 64);
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(0, 0, 256, 64);

    const hpPct = Math.max(0, this.opponentHp / 100);
    ctx.fillStyle = hpPct > 0.4 ? "#22c55e" : "#ef4444";
    ctx.fillRect(8, 38, 240 * hpPct, 18);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px monospace";
    ctx.fillText(`${this.opponentName} [${Math.round(this.opponentHp)} HP]`, 12, 28);

    sprite.material.map.needsUpdate = true;
  }

  // -------------------------------------------------------------
  // Viewmodel Weapon Rig (Roblox Yellow Hand & Tactical Sleeve)
  // -------------------------------------------------------------
  private buildViewmodelWeapon() {
    while (this.viewmodelRoot.children.length > 0) {
      this.viewmodelRoot.remove(this.viewmodelRoot.children[0]);
    }

    const skin = this.currentWeapon.skins?.find((s) => s.id === this.currentWeapon.equippedSkinId);
    const primaryColor = skin ? parseInt(skin.colorHex.replace("#", "0x")) : 0x2563eb;
    const accentColor = skin ? parseInt(skin.accentHex.replace("#", "0x")) : 0xf59e0b;

    const weaponGroup = new THREE.Group();

    const gunMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      metalness: skin?.pattern === "CYBER" ? 0.9 : 0.6,
      roughness: 0.3,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: skin?.glow ? accentColor : 0x000000,
      emissiveIntensity: skin?.glow ? 0.6 : 0,
      metalness: 0.8,
      roughness: 0.2,
    });

    // Authentic Classic Roblox Yellow Skin for Hands
    const robloxHandMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
    const sleeveMat = new THREE.MeshStandardMaterial({ map: getShirtTexture("#0284c7", false), roughness: 0.5 });

    if (this.currentWeapon.id === "sub-striker") {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.45), gunMat);
      weaponGroup.add(body);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8), accentMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.32);
      weaponGroup.add(barrel);

      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.08), accentMat);
      mag.position.set(0, -0.12, -0.05);
      weaponGroup.add(mag);

      // Right Arm (Sleeve + Yellow Roblox Hand)
      const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.32), sleeveMat);
      rightArm.position.set(0.18, -0.14, 0.14);
      const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.12), robloxHandMat);
      rightHand.position.set(0, 0, -0.2);
      rightArm.add(rightHand);
      weaponGroup.add(rightArm);

      // Left Arm (Sleeve + Yellow Roblox Hand supporting front)
      const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.28), sleeveMat);
      leftArm.position.set(-0.14, -0.08, -0.16);
      const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.12), robloxHandMat);
      leftHand.position.set(0, 0, -0.18);
      leftArm.add(leftHand);
      weaponGroup.add(leftArm);

      weaponGroup.position.set(0.22, -0.2, -0.42);
    } else if (this.currentWeapon.id === "aero-50") {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.15, 0.95), gunMat);
      weaponGroup.add(body);

      const longBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 8), accentMat);
      longBarrel.rotation.x = Math.PI / 2;
      longBarrel.position.set(0, 0.03, -0.75);
      weaponGroup.add(longBarrel);

      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.35, 12), accentMat);
      scope.rotation.x = Math.PI / 2;
      scope.position.set(0, 0.14, -0.1);
      weaponGroup.add(scope);

      // Right Arm (Sleeve + Yellow Roblox Hand)
      const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.4), sleeveMat);
      rightArm.position.set(0.18, -0.16, 0.18);
      const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.12), robloxHandMat);
      rightHand.position.set(0, 0, -0.22);
      rightArm.add(rightHand);
      weaponGroup.add(rightArm);

      weaponGroup.position.set(0.2, -0.22, -0.45);
    } else {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.55), gunMat);
      weaponGroup.add(body);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), accentMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.4);
      weaponGroup.add(barrel);

      // Right Arm (Sleeve + Yellow Roblox Hand)
      const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.32), sleeveMat);
      rightArm.position.set(0.18, -0.14, 0.12);
      const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.12), robloxHandMat);
      rightHand.position.set(0, 0, -0.18);
      rightArm.add(rightHand);
      weaponGroup.add(rightArm);

      // Left Arm
      const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.28), sleeveMat);
      leftArm.position.set(-0.14, -0.09, -0.18);
      const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.12), robloxHandMat);
      leftHand.position.set(0, 0, -0.18);
      leftArm.add(leftHand);
      weaponGroup.add(leftArm);

      weaponGroup.position.set(0.22, -0.2, -0.42);
    }

    // Muzzle flash on viewmodel
    const flashGeo = new THREE.OctahedronGeometry(0.08);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0 });
    this.muzzleFlashMesh = new THREE.Mesh(flashGeo, flashMat);
    this.muzzleFlashMesh.position.set(0, 0.02, -0.6);
    weaponGroup.add(this.muzzleFlashMesh);

    this.muzzleFlashLight = new THREE.PointLight(0xf59e0b, 0, 3);
    this.muzzleFlashLight.position.set(0, 0.02, -0.6);
    weaponGroup.add(this.muzzleFlashLight);

    this.currentWeaponMesh = weaponGroup;
    this.viewmodelRoot.add(weaponGroup);
  }

  // -------------------------------------------------------------
  // Combat & Wall-Collision Raycasting (FIXED NO WALL PENETRATION)
  // -------------------------------------------------------------
  public shoot() {
    if (!this.isMatchActive || this.isReloading || this.isRoundEnding) return;
    const now = performance.now();
    const fireInterval = 1000 / this.currentWeapon.fireRate;
    if (now - this.lastShotTime < fireInterval) return;

    if (this.currentWeapon.currentAmmo <= 0) {
      sounds.playUiClick();
      this.reload();
      return;
    }

    this.lastShotTime = now;
    this.currentWeapon.currentAmmo--;
    this.callbacks.onAmmoChange(this.currentWeapon.currentAmmo, this.currentWeapon.reserveAmmo);

    // Audio & Recoil
    sounds.playGunshot(this.currentWeapon.id === "aero-50" ? "SNIPER" : this.currentWeapon.id === "pump-havoc" ? "SHOTGUN" : "AR");

    const recoilFactor = this.currentWeapon.recoil;
    this.recoilPitch = Math.min(this.recoilPitch + recoilFactor * 0.045, 0.25);
    this.recoilYaw += (Math.random() - 0.5) * recoilFactor * 0.02;

    if (this.currentWeaponMesh) {
      this.currentWeaponMesh.position.z += 0.06;
      this.currentWeaponMesh.rotation.x -= 0.08;
    }

    // Trigger Viewmodel Muzzle Flash
    if (this.muzzleFlashMesh && this.muzzleFlashLight) {
      (this.muzzleFlashMesh.material as THREE.MeshBasicMaterial).opacity = 1.0;
      this.muzzleFlashLight.intensity = 2.5;
      setTimeout(() => {
        if (this.muzzleFlashMesh && this.muzzleFlashLight) {
          (this.muzzleFlashMesh.material as THREE.MeshBasicMaterial).opacity = 0;
          this.muzzleFlashLight.intensity = 0;
        }
      }, 50);
    }

    this.telemetry.shotsFired++;
    this.callbacks.onTelemetryUpdate?.(this.telemetry);

    // Raycast hit detection against BOTH Map Objects and Opponent
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    const testObjects: THREE.Object3D[] = [];
    
    // 1. Add all map geometry (walls, crates, containers, platforms)
    this.mapGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        testObjects.push(child);
      }
    });

    // 2. Add opponent meshes
    this.opponentGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name !== "billboard") {
        testObjects.push(child);
      }
    });

    const intersects = raycaster.intersectObjects(testObjects, true);

    const muzzleWorldPos = this.camera.position.clone().add(new THREE.Vector3(0.2, -0.15, -0.4).applyQuaternion(this.camera.quaternion));
    let hitPoint = muzzleWorldPos.clone().add(raycaster.ray.direction.clone().multiplyScalar(60));

    if (intersects.length > 0) {
      const hit = intersects[0];
      hitPoint = hit.point;

      // Check if the closest hit object is part of the Opponent
      let isOpponentHit = false;
      let obj: THREE.Object3D | null = hit.object;
      while (obj) {
        if (obj === this.opponentGroup) {
          isOpponentHit = true;
          break;
        }
        obj = obj.parent;
      }

      if (isOpponentHit) {
        // DIRECT HIT ON ENEMY (No wall in between!)
        const headWorldPos = new THREE.Vector3();
        this.botHeadPivot.getWorldPosition(headWorldPos);
        const isHeadshot = hit.point.distanceTo(headWorldPos) < 0.65;

        const damage = isHeadshot ? this.currentWeapon.damageHead : this.currentWeapon.damageBody;

        this.opponentHp = Math.max(0, this.opponentHp - damage);
        this.updateOpponentBillboard();

        this.telemetry.shotsHit++;
        if (isHeadshot) this.telemetry.headshots++;
        this.callbacks.onTelemetryUpdate?.(this.telemetry);

        // Frenetic hit sparks
        this.particles.spawnHitSparks(hit.point, isHeadshot);

        sounds.playHitmarker(isHeadshot, this.settings.hitmarkerSound);
        this.callbacks.onHit?.(damage, isHeadshot, window.innerWidth / 2, window.innerHeight / 2);
        this.callbacks.onOpponentDamaged?.(this.opponentHp, damage, isHeadshot);
        this.callbacks.onHealthUpdate?.({
          playerHp: this.playerHp,
          opponentHp: this.opponentHp,
          lastDamage: damage,
          isPlayerVictim: false,
          isHeadshot,
        });

        this.botRecoilKick = 0.45;
        this.botFlinchTimer = 0.35;

        // Bot reactive jump or slide upon taking damage
        if (this.opponentIsGrounded && Math.random() < 0.7) {
          if (Math.random() < 0.5) {
            this.opponentIsSliding = true;
            this.particles.spawnSlideDust(this.opponentPos);
            setTimeout(() => { this.opponentIsSliding = false; }, 450);
          } else {
            this.opponentVel.y = 9.4;
            this.opponentIsGrounded = false;
          }
        }

        // Check Bot Elimination & Round Victory
        if (this.opponentHp <= 0 && !this.opponentIsDead && !this.isRoundEnding) {
          this.opponentIsDead = true;
          this.isRoundEnding = true;
          this.opponentGroup.visible = false;
          sounds.playRobloxOof();
          sounds.playRoundWin();
          this.callbacks.onKill?.(isHeadshot, this.opponentName, isHeadshot);
          this.callbacks.onRoundEnded?.("YOU", isHeadshot);

          setTimeout(() => {
            if (this.isMatchActive) {
              this.resetRound();
            }
          }, 1800);
        }
      } else {
        // BULLET HIT A WALL / CRATE / OBSTACLE (DO NOT DAMAGE OPPONENT!)
        const normal = hit.face ? hit.face.normal.clone().applyQuaternion(hit.object.quaternion) : new THREE.Vector3(0, 1, 0);
        const voxelType = (hit.object as any).voxelType || "stone";
        this.particles.spawnWallImpact(hit.point, normal, voxelType);
      }
    }

    this.createBulletTracer(muzzleWorldPos, hitPoint);
  }

  private createBulletTracer(from: THREE.Vector3, to: THREE.Vector3) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = new THREE.LineBasicMaterial({
      color: 0xfef08a,
      linewidth: 2,
      transparent: true,
      opacity: 0.95,
    });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.bulletTracers.push({ line, age: 0, maxAge: 0.08 });
  }

  // -------------------------------------------------------------
  // Simulation Loop (128Hz Physics & Smooth Rendering)
  // -------------------------------------------------------------
  private loop = () => {
    this.animationFrameId = requestAnimationFrame(this.loop);

    const now = performance.now();
    const dt = Math.min((now - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = now;

    if (!this.isMatchActive) {
      this.ambientAngle += dt * 0.12;
      this.camera.position.set(
        Math.sin(this.ambientAngle) * 24,
        10 + Math.sin(this.ambientAngle * 0.5) * 2,
        Math.cos(this.ambientAngle) * 24
      );
      this.camera.lookAt(0, 1.8, 0);

      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      return;
    }

    // Auto-fire while holding button/mouse
    if (this.isFiringHeld && this.currentWeapon.isAutomatic) {
      this.shoot();
    }

    // 1. Player Luau Physics Simulation
    this.updatePlayerPhysics(dt);

    // 2. Opponent AI Movement, Jumps & Tactical Wall-Aware Shooting
    this.updateOpponentAI(dt);

    // 3. Jump Pads Trigger Check
    this.updateJumpPads();

    // 4. Viewmodel Smooth Animations
    this.updateViewmodel(dt);

    // 5. Particles & Tracers
    this.particles.update(dt);
    this.updateTracers(dt);

    // 6. Dual-Scene Render
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.renderer.clearDepth();
    this.renderer.render(this.viewmodelScene, this.viewmodelCamera);
  };

  private updatePlayerPhysics(dt: number) {
    this.stamina = Math.min(100, this.stamina + 25 * dt);

    // Gravity
    let gravity = 24.0;
    if (this.currentMod?.parameters.gravityMultiplier) {
      gravity *= this.currentMod.parameters.gravityMultiplier;
    }
    this.playerVel.y -= gravity * dt;

    // -----------------------------------------------------------------
    // Classic Quake 1 Keyboard Look & Turn Mechanics (No Mouse Needed!)
    // -----------------------------------------------------------------
    const isAltHeld = !!(this.keys["alt"] || this.keys["altleft"] || this.keys["altright"]);
    const isShiftHeld = !!(this.keys["shift"] || this.keys["shiftleft"] || this.keys["shiftright"]);
    const isArrowLeft = !!this.keys["arrowleft"];
    const isArrowRight = !!this.keys["arrowright"];
    const isArrowUp = !!(this.keys["arrowup"] || this.keys["w"] || this.keys["keyw"] || (this.settings.keybinds.forward && this.keys[this.settings.keybinds.forward.toLowerCase()]));
    const isArrowDown = !!(this.keys["arrowdown"] || this.keys["s"] || this.keys["keys"] || (this.settings.keybinds.backward && this.keys[this.settings.keybinds.backward.toLowerCase()]));

    const isLookUp = !!(this.keys["pageup"] || this.keys["insert"] || this.keys["home"] || this.keys["numpad9"]);
    const isLookDown = !!(this.keys["pagedown"] || this.keys["delete"] || this.keys["numpad3"]);
    const isCenterView = !!(this.keys["end"] || this.keys["numpad5"] || this.keys["k"] || this.keys["keyk"]);

    // Keyboard Yaw Turning (Left / Right Arrows when Alt is NOT held)
    let turnSpeed = this.settings.keyboardTurnSpeed || 2.8;
    if (isShiftHeld) turnSpeed *= 1.45; // Fast keyboard turn

    if (isArrowLeft && !isAltHeld) {
      this.playerRotation.yaw += turnSpeed * dt;
    }
    if (isArrowRight && !isAltHeld) {
      this.playerRotation.yaw -= turnSpeed * dt;
    }

    // Keyboard Pitch Tilting (PageUp / PageDown or Home/End)
    let pitchSpeed = 2.4;
    if (isShiftHeld) pitchSpeed *= 1.45;

    if (isLookUp) {
      this.playerRotation.pitch = Math.min(1.5, this.playerRotation.pitch + pitchSpeed * dt);
    }
    if (isLookDown) {
      this.playerRotation.pitch = Math.max(-1.5, this.playerRotation.pitch - pitchSpeed * dt);
    }
    if (isCenterView) {
      this.playerRotation.pitch = THREE.MathUtils.lerp(this.playerRotation.pitch, 0, dt * 18);
    }

    // -----------------------------------------------------------------
    // Movement Input Vector & Quake 1 Strafing (+strafe / A/D / Alt+Arrows)
    // -----------------------------------------------------------------
    const moveVector = new THREE.Vector3(0, 0, 0);

    if (isArrowUp) moveVector.z -= 1;
    if (isArrowDown) moveVector.z += 1;

    // Strafe Left: A key, comma, or Alt + Left Arrow
    const isStrafeLeft = (isArrowLeft && isAltHeld) || !!this.keys["a"] || !!this.keys["keya"] || !!this.keys[","] || !!this.keys["<"] || (this.settings.keybinds.left && !!this.keys[this.settings.keybinds.left.toLowerCase()]);
    // Strafe Right: D key, period, or Alt + Right Arrow
    const isStrafeRight = (isArrowRight && isAltHeld) || !!this.keys["d"] || !!this.keys["keyd"] || !!this.keys["."] || !!this.keys[">"] || (this.settings.keybinds.right && !!this.keys[this.settings.keybinds.right.toLowerCase()]);

    if (isStrafeLeft) moveVector.x -= 1;
    if (isStrafeRight) moveVector.x += 1;

    if (this.virtualMoveVector.x !== 0 || this.virtualMoveVector.z !== 0) {
      moveVector.x += this.virtualMoveVector.x;
      moveVector.z += this.virtualMoveVector.z;
    }

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
    }

    moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerRotation.yaw);

    let speed = 9.5;
    if (this.currentMod?.parameters.speedMultiplier) {
      speed *= this.currentMod.parameters.speedMultiplier;
    }
    if (this.isAiming) speed *= 0.6;

    if (this.isGrounded) {
      if (!this.isSliding && !this.isDashing) {
        this.playerVel.x = THREE.MathUtils.lerp(this.playerVel.x, moveVector.x * speed, dt * 15);
        this.playerVel.z = THREE.MathUtils.lerp(this.playerVel.z, moveVector.z * speed, dt * 15);
      } else if (this.isSliding) {
        const friction = this.currentMod?.parameters.slidingFriction || 0.88;
        this.playerVel.x *= Math.pow(friction, dt * 60);
        this.playerVel.z *= Math.pow(friction, dt * 60);
      }
    } else {
      const airAccel = 16.0;
      this.playerVel.x += moveVector.x * airAccel * dt;
      this.playerVel.z += moveVector.z * airAccel * dt;
    }

    // Proposed new position
    const nextX = this.playerPos.x + this.playerVel.x * dt;
    const nextY = this.playerPos.y + this.playerVel.y * dt;
    const nextZ = this.playerPos.z + this.playerVel.z * dt;

    // Obstacle Collisions
    const playerRadius = 0.55;
    let allowedX = nextX;
    let allowedZ = nextZ;
    let groundY = 1.6;

    for (const box of this.colliders) {
      if (nextX >= box.min.x - playerRadius && nextX <= box.max.x + playerRadius &&
          nextZ >= box.min.z - playerRadius && nextZ <= box.max.z + playerRadius) {
        if (this.playerPos.y >= box.max.y + 1.2 && nextY <= box.max.y + 1.6) {
          groundY = Math.max(groundY, box.max.y + 1.6);
        }
      }

      if (nextY < box.max.y + 0.2 && nextY > box.min.y) {
        if (nextX + playerRadius > box.min.x && nextX - playerRadius < box.max.x &&
            this.playerPos.z + playerRadius > box.min.z && this.playerPos.z - playerRadius < box.max.z) {
          allowedX = this.playerPos.x;
          this.playerVel.x = 0;
        }
        if (this.playerPos.x + playerRadius > box.min.x && this.playerPos.x - playerRadius < box.max.x &&
            nextZ + playerRadius > box.min.z && nextZ - playerRadius < box.max.z) {
          allowedZ = this.playerPos.z;
          this.playerVel.z = 0;
        }
      }
    }

    this.playerPos.x = allowedX;
    this.playerPos.z = allowedZ;
    this.playerPos.y = nextY;

    if (this.playerPos.y <= groundY) {
      this.playerPos.y = groundY;
      this.playerVel.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    this.playerPos.x = Math.max(-28, Math.min(28, this.playerPos.x));
    this.playerPos.z = Math.max(-28, Math.min(28, this.playerPos.z));

    const eyeHeight = this.isSliding ? 0.85 : 1.6;
    this.camera.position.set(this.playerPos.x, this.playerPos.y - (1.6 - eyeHeight), this.playerPos.z);

    this.recoilPitch = THREE.MathUtils.lerp(this.recoilPitch, 0, dt * 10);
    this.recoilYaw = THREE.MathUtils.lerp(this.recoilYaw, 0, dt * 10);

    const euler = new THREE.Euler(this.playerRotation.pitch + this.recoilPitch, this.playerRotation.yaw + this.recoilYaw, 0, "YXZ");
    this.camera.quaternion.setFromEuler(euler);

    const currentSpeed = Math.hypot(this.playerVel.x, this.playerVel.z);
    if (currentSpeed > this.maxSpeedReached) {
      this.maxSpeedReached = currentSpeed;
      this.telemetry.maxSpeed = Math.round(currentSpeed);
      this.callbacks.onTelemetryUpdate?.(this.telemetry);
    }

    const now = performance.now();
    if (now - this.lastMovementCallbackTime > 80) {
      this.lastMovementCallbackTime = now;
      this.callbacks.onSpeedUpdate?.(currentSpeed);
      this.callbacks.onMovementStateChange?.({
        isSliding: this.isSliding,
        isDashing: this.isDashing,
        isGrounded: this.isGrounded,
        speed: Math.round(currentSpeed * 10) / 10,
        stamina: Math.round(this.stamina),
      });
    }
  }

  // -------------------------------------------------------------
  // Dynamic Roblox Bot AI (Spatial Whiskers, Unstick Engine, Jiggle Peek & IK)
  // -------------------------------------------------------------
  private updateOpponentAI(dt: number) {
    if (this.opponentIsDead || !this.opponentGroup.visible) return;

    const toPlayer = this.playerPos.clone().sub(this.opponentPos);
    const distToPlayer = Math.hypot(toPlayer.x, toPlayer.z);

    // 1. Behavior State Evaluation (Decision Tree)
    this.botWaypointChangeTimer += dt;
    this.botPeekTimer += dt;
    this.botFlinchTimer = Math.max(0, this.botFlinchTimer - dt);

    if (this.opponentHp < 30 && distToPlayer < 16) {
      this.botCurrentState = "RETREAT";
    } else if (distToPlayer > 24) {
      this.botCurrentState = "FLANK";
    } else if (this.playerHp < 35 || this.opponentDifficulty === "APEX" || this.opponentDifficulty === "CHEATER") {
      this.botCurrentState = "RUSH";
    } else {
      this.botCurrentState = "COMBAT";
    }

    // 2. Tactical Navigation / Waypoint Routing & Jump Pad Seek
    let targetGoalPos = this.playerPos.clone();

    // Check if a Jump Pad is close by to execute an Aerial Strike!
    let nearbyJumpPad: JumpPad | null = null;
    for (const pad of this.jumpPads) {
      const padDist = pad.position.distanceTo(this.opponentPos);
      if (padDist < 8.0 && this.opponentPos.y < pad.position.y + 1.0) {
        nearbyJumpPad = pad;
        break;
      }
    }

    if (nearbyJumpPad && Math.random() < 0.4 && this.opponentIsGrounded) {
      targetGoalPos = nearbyJumpPad.position.clone();
    } else if (this.waypoints.length > 0) {
      if (this.botCurrentState === "RETREAT") {
        let bestDist = 0;
        this.waypoints.forEach((wp, idx) => {
          if (wp.type === "COVER") {
            const d = wp.pos.distanceTo(this.playerPos);
            if (d > bestDist) {
              bestDist = d;
              this.botCurrentWaypointIdx = idx;
            }
          }
        });
        targetGoalPos = this.waypoints[this.botCurrentWaypointIdx].pos;
      } else if (this.botCurrentState === "FLANK" && this.botWaypointChangeTimer > 2.0) {
        this.botWaypointChangeTimer = 0;
        const flankNodes = this.waypoints.filter((w) => w.type === "FLANK_LANE" || w.type === "JUMP_PAD" || w.type === "HIGH_GROUND");
        if (flankNodes.length > 0) {
          const chosen = flankNodes[Math.floor(Math.random() * flankNodes.length)];
          targetGoalPos = chosen.pos;
        }
      }
    }

    // 3. Evasive Tactical Movement, Jumps, Slides & Jiggle Peeking
    this.botStrafeTimer += dt;
    this.botJumpTimer += dt;

    if (this.botStrafeTimer > 0.5 + Math.random() * 0.4) {
      this.botStrafeTimer = 0;
      this.botStrafeDirection *= -1;

      // Dynamic evasive jumps and tactical slides
      const evasionChance = this.opponentDifficulty === "APEX" ? 0.65 : this.opponentDifficulty === "CHEATER" ? 0.85 : 0.4;
      if (Math.random() < evasionChance && this.opponentIsGrounded) {
        if (Math.random() < 0.5) {
          this.opponentIsSliding = true;
          this.particles.spawnSlideDust(this.opponentPos);
          setTimeout(() => { this.opponentIsSliding = false; }, 500);
        } else {
          this.opponentVel.y = 9.6; // High jump
          this.opponentIsGrounded = false;
        }
      }
    }

    // Bunnyhopping chains when rushing
    if (this.botCurrentState === "RUSH" && this.opponentIsGrounded && this.botJumpTimer > 0.9) {
      this.botJumpTimer = 0;
      this.opponentVel.y = 9.2;
      this.opponentIsGrounded = false;
    }

    // Jiggle Peeking Logic (Step out, burst fire, step back into cover)
    if (this.botCurrentState === "COMBAT" && distToPlayer < 22) {
      if (this.botPeekTimer > 1.8) {
        this.botIsPeeking = !this.botIsPeeking;
        this.botPeekTimer = 0;
        if (this.botIsPeeking) {
          // Trigger a rapid 3-round burst
          this.botBurstShotsRemaining = 3;
          this.botBurstDelayTimer = 0;
        }
      }
    }

    const forwardDir = new THREE.Vector3(targetGoalPos.x - this.opponentPos.x, 0, targetGoalPos.z - this.opponentPos.z).normalize();
    const strafeDir = new THREE.Vector3(-forwardDir.z, 0, forwardDir.x);

    let moveX = 0;
    let moveZ = 0;

    // Movement calculation
    if (this.botCurrentState === "RUSH") {
      moveX = forwardDir.x * 10.0 + strafeDir.x * 4.0 * this.botStrafeDirection;
      moveZ = forwardDir.z * 10.0 + strafeDir.z * 4.0 * this.botStrafeDirection;
    } else if (this.botCurrentState === "RETREAT") {
      moveX = forwardDir.x * 8.5 + strafeDir.x * 5.0 * this.botStrafeDirection;
      moveZ = forwardDir.z * 8.5 + strafeDir.z * 5.0 * this.botStrafeDirection;
    } else {
      if (this.botIsPeeking) {
        // Peeking out to shoot
        moveX = strafeDir.x * 7.5 * this.botStrafeDirection;
        moveZ = strafeDir.z * 7.5 * this.botStrafeDirection;
      } else if (distToPlayer > 15) {
        moveX = forwardDir.x * 8.0 + strafeDir.x * 5.5 * this.botStrafeDirection;
        moveZ = forwardDir.z * 8.0 + strafeDir.z * 5.5 * this.botStrafeDirection;
      } else if (distToPlayer < 6) {
        moveX = -forwardDir.x * 7.0 + strafeDir.x * 7.5 * this.botStrafeDirection;
        moveZ = -forwardDir.z * 7.0 + strafeDir.z * 7.5 * this.botStrafeDirection;
      } else {
        moveX = strafeDir.x * 8.5 * this.botStrafeDirection;
        moveZ = strafeDir.z * 8.5 * this.botStrafeDirection;
      }
    }

    if (this.opponentIsSliding) {
      moveX *= 1.45;
      moveZ *= 1.45;
    }

    // 4. Multi-Ray Spatial Whisker Navigation & Auto-Step
    const kneePos = this.opponentPos.clone().add(new THREE.Vector3(0, 0.35, 0));
    const waistPos = this.opponentPos.clone().add(new THREE.Vector3(0, 0.85, 0));
    const headPos = this.opponentPos.clone().add(new THREE.Vector3(0, 1.4, 0));

    const kneeRay = new THREE.Raycaster(kneePos, forwardDir, 0.1, 2.5);
    const waistRay = new THREE.Raycaster(waistPos, forwardDir, 0.1, 2.5);
    const headRay = new THREE.Raycaster(headPos, forwardDir, 0.1, 2.5);

    const kneeHits = kneeRay.intersectObjects(this.mapGroup.children, true);
    const waistHits = waistRay.intersectObjects(this.mapGroup.children, true);
    const headHits = headRay.intersectObjects(this.mapGroup.children, true);

    // If knee hits but head is clear -> Obstacle/Crate in front, AUTO-JUMP OVER IT!
    if (kneeHits.length > 0 && headHits.length === 0) {
      if (this.opponentIsGrounded) {
        this.opponentVel.y = 9.8; // High step-over jump
        this.opponentIsGrounded = false;
      }
    } else if (waistHits.length > 0) {
      // Wall / High barrier ahead -> Steer with side whiskers
      const leftWhiskerDir = forwardDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);
      const rightWhiskerDir = forwardDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 4);
      const leftRay = new THREE.Raycaster(waistPos, leftWhiskerDir, 0.1, 3.0);
      const rightRay = new THREE.Raycaster(waistPos, rightWhiskerDir, 0.1, 3.0);

      const leftHits = leftRay.intersectObjects(this.mapGroup.children, true);
      const rightHits = rightRay.intersectObjects(this.mapGroup.children, true);

      if (leftHits.length === 0) {
        moveX = leftWhiskerDir.x * 9.0;
        moveZ = leftWhiskerDir.z * 9.0;
      } else if (rightHits.length === 0) {
        moveX = rightWhiskerDir.x * 9.0;
        moveZ = rightWhiskerDir.z * 9.0;
      } else {
        moveX = strafeDir.x * 9.0 * this.botStrafeDirection;
        moveZ = strafeDir.z * 9.0 * this.botStrafeDirection;
      }
    }

    // 4b. Anti-Stuck Fail-Safe Engine (Displacement Tracking)
    this.botStuckTimer += dt;
    if (this.botStuckTimer > 0.25) {
      const movedDist = this.opponentPos.distanceTo(this.botLastStuckPos);
      if (movedDist < 0.12 && !this.opponentIsDead) {
        // Bot is caught against geometry! Trigger emergency Unstick Burst!
        this.botUnstickTimer = 0.55;
        this.botUnstickDirection.set(-strafeDir.x, 0, -strafeDir.z).normalize();
        if (this.opponentIsGrounded) {
          this.opponentVel.y = 10.2; // Power jump out of corner
          this.opponentIsGrounded = false;
        }
      }
      this.botLastStuckPos.copy(this.opponentPos);
      this.botStuckTimer = 0;
    }

    if (this.botUnstickTimer > 0) {
      this.botUnstickTimer -= dt;
      moveX = this.botUnstickDirection.x * 12.0;
      moveZ = this.botUnstickDirection.z * 12.0;
    }

    // Physics acceleration
    this.opponentVel.x = THREE.MathUtils.lerp(this.opponentVel.x, moveX, dt * 11);
    this.opponentVel.z = THREE.MathUtils.lerp(this.opponentVel.z, moveZ, dt * 11);
    this.opponentVel.y -= 24.0 * dt;

    // Check Jump Pad trigger on Bot
    for (const pad of this.jumpPads) {
      const padDist = pad.position.distanceTo(this.opponentPos);
      if (padDist < pad.radius && Math.abs(this.opponentPos.y - pad.position.y) < 1.4) {
        const now = performance.now();
        if (now - pad.lastUsedTime > 600) {
          pad.lastUsedTime = now;
          this.opponentVel.y = pad.power * 1.1; // Launch high in the air!
          this.opponentIsGrounded = false;
          sounds.playJumpPad();
          this.particles.spawnJumpPadParticles(pad.position);
        }
      }
    }

    // Obstacle Collisions for Bot
    const nextBotX = this.opponentPos.x + this.opponentVel.x * dt;
    const nextBotY = this.opponentPos.y + this.opponentVel.y * dt;
    const nextBotZ = this.opponentPos.z + this.opponentVel.z * dt;

    let botAllowedX = nextBotX;
    let botAllowedZ = nextBotZ;
    let botGroundY = 1.6;

    for (const box of this.colliders) {
      if (nextBotX >= box.min.x - 0.6 && nextBotX <= box.max.x + 0.6 &&
          nextBotZ >= box.min.z - 0.6 && nextBotZ <= box.max.z + 0.6) {
        if (this.opponentPos.y >= box.max.y + 1.2 && nextBotY <= box.max.y + 1.6) {
          botGroundY = Math.max(botGroundY, box.max.y + 1.6);
        }
      }

      if (nextBotY < box.max.y + 0.2 && nextBotY > box.min.y) {
        if (nextBotX + 0.6 > box.min.x && nextBotX - 0.6 < box.max.x &&
            this.opponentPos.z + 0.6 > box.min.z && this.opponentPos.z - 0.6 < box.max.z) {
          botAllowedX = this.opponentPos.x;
          this.opponentVel.x = 0;
        }
        if (this.opponentPos.x + 0.6 > box.min.x && this.opponentPos.x - 0.6 < box.max.x &&
            nextBotZ + 0.6 > box.min.z && nextBotZ - 0.6 < box.max.z) {
          botAllowedZ = this.opponentPos.z;
          this.opponentVel.z = 0;
        }
      }
    }

    this.opponentPos.x = botAllowedX;
    this.opponentPos.z = botAllowedZ;
    this.opponentPos.y = nextBotY;

    if (this.opponentPos.y <= botGroundY) {
      this.opponentPos.y = botGroundY;
      this.opponentVel.y = 0;
      this.opponentIsGrounded = true;
    } else {
      this.opponentIsGrounded = false;
    }

    this.opponentPos.x = Math.max(-27, Math.min(27, this.opponentPos.x));
    this.opponentPos.z = Math.max(-27, Math.min(27, this.opponentPos.z));
    this.opponentGroup.position.copy(this.opponentPos);

    // 5. Predictive Aiming IK & Rotation
    const leadTime = Math.min(0.35, distToPlayer / 65.0);
    const predictedPlayerPos = this.playerPos.clone().add(this.playerVel.clone().multiplyScalar(leadTime));
    this.botAimedPos.lerp(predictedPlayerPos, dt * 15);

    const aimDir = this.botAimedPos.clone().sub(this.opponentPos);
    const targetYaw = Math.atan2(-aimDir.x, -aimDir.z);
    this.opponentRotation = THREE.MathUtils.lerp(this.opponentRotation, targetYaw, dt * 15);
    this.opponentGroup.rotation.y = this.opponentRotation;

    // Authentic Roblox R6 IK & Smooth Limb Animations
    const botSpeed = Math.hypot(this.opponentVel.x, this.opponentVel.z);
    const speedRatio = Math.min(1, botSpeed / 7.5);

    if (this.opponentIsGrounded && !this.opponentIsSliding) {
      this.botWalkPhase += dt * botSpeed * 7.5;
      const legSwing = Math.sin(this.botWalkPhase) * 0.8 * speedRatio;
      this.botLeftLegPivot.rotation.x = THREE.MathUtils.lerp(this.botLeftLegPivot.rotation.x, legSwing, dt * 18);
      this.botRightLegPivot.rotation.x = THREE.MathUtils.lerp(this.botRightLegPivot.rotation.x, -legSwing, dt * 18);
      this.botLeftLegPivot.rotation.z = 0;
      this.botRightLegPivot.rotation.z = 0;

      // Torso vertical bounce & slight tilt
      this.botTorso.position.y = 0.6 + Math.abs(Math.sin(this.botWalkPhase)) * 0.08 * speedRatio;
      this.botTorso.rotation.x = THREE.MathUtils.lerp(this.botTorso.rotation.x, speedRatio * 0.12, dt * 14);
      this.botTorso.rotation.z = THREE.MathUtils.lerp(this.botTorso.rotation.z, (this.botFlinchTimer > 0 ? 0.2 : 0), dt * 18);
    } else if (this.opponentIsSliding) {
      // Roblox Slide Pose: Torso tilted back, legs stretched forward
      this.botTorso.rotation.x = THREE.MathUtils.lerp(this.botTorso.rotation.x, -0.55, dt * 16);
      this.botRightLegPivot.rotation.x = THREE.MathUtils.lerp(this.botRightLegPivot.rotation.x, -1.3, dt * 16);
      this.botLeftLegPivot.rotation.x = THREE.MathUtils.lerp(this.botLeftLegPivot.rotation.x, -1.0, dt * 16);
    } else {
      // Roblox Jump Pose: Arms up, legs bent back slightly
      this.botLeftLegPivot.rotation.x = THREE.MathUtils.lerp(this.botLeftLegPivot.rotation.x, 0.45, dt * 14);
      this.botRightLegPivot.rotation.x = THREE.MathUtils.lerp(this.botRightLegPivot.rotation.x, 0.45, dt * 14);
      this.botTorso.rotation.x = THREE.MathUtils.lerp(this.botTorso.rotation.x, -0.1, dt * 12);
    }

    const heightDelta = this.playerPos.y - this.opponentPos.y;
    const aimPitch = -Math.atan2(heightDelta, distToPlayer);
    this.botHeadPivot.rotation.x = THREE.MathUtils.lerp(this.botHeadPivot.rotation.x, aimPitch, dt * 14);

    this.botRecoilKick = THREE.MathUtils.lerp(this.botRecoilKick, 0, dt * 16);
    const targetArmPitch = -Math.PI / 2 + aimPitch - this.botRecoilKick;
    this.botRightArmPivot.rotation.x = THREE.MathUtils.lerp(this.botRightArmPivot.rotation.x, targetArmPitch, dt * 18);

    // Left Arm Dual-Hand Weapon Grip IK (Reaches across to support front handguard)
    this.botLeftArmPivot.rotation.x = THREE.MathUtils.lerp(this.botLeftArmPivot.rotation.x, targetArmPitch * 0.95 - 0.2, dt * 18);
    this.botLeftArmPivot.rotation.y = THREE.MathUtils.lerp(this.botLeftArmPivot.rotation.y, 0.42, dt * 18);

    // 6. Bot Combat Attack & Burst Fire Logic with Line-Of-Sight Occlusion Check
    this.opponentShootCooldown -= dt;
    this.botBurstDelayTimer -= dt;

    const canShootNormal = this.opponentShootCooldown <= 0 && distToPlayer < 45 && !this.isRoundEnding;
    const canShootBurst = this.botBurstShotsRemaining > 0 && this.botBurstDelayTimer <= 0 && distToPlayer < 45 && !this.isRoundEnding;

    if (canShootNormal || canShootBurst) {
      if (canShootBurst) {
        this.botBurstShotsRemaining--;
        this.botBurstDelayTimer = 0.11; // High-speed 3-round burst
      } else {
        this.opponentShootCooldown = this.opponentDifficulty === "APEX" ? 0.28 : this.opponentDifficulty === "CHEATER" ? 0.16 : 0.55;
      }

      sounds.playGunshot("AR");
      this.botRecoilKick = 0.4;

      // Bot Muzzle Flash
      if (this.botMuzzleFlashMesh && this.botMuzzleFlashLight) {
        (this.botMuzzleFlashMesh.material as THREE.MeshBasicMaterial).opacity = 1.0;
        this.botMuzzleFlashLight.intensity = 3.0;
        setTimeout(() => {
          if (this.botMuzzleFlashMesh && this.botMuzzleFlashLight) {
            (this.botMuzzleFlashMesh.material as THREE.MeshBasicMaterial).opacity = 0;
            this.botMuzzleFlashLight.intensity = 0;
          }
        }, 50);
      }

      const botMuzzle = this.opponentPos.clone().add(new THREE.Vector3(0.85, 1.0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.opponentRotation));
      const targetDir = this.playerPos.clone().sub(botMuzzle).normalize();

      // LINE OF SIGHT CHECK AGAINST MAP WALLS & CRATES (NO WALL PENETRATION)
      const losRaycaster = new THREE.Raycaster(botMuzzle, targetDir, 0.1, 50);
      const wallHits = losRaycaster.intersectObjects(this.mapGroup.children, true);

      if (wallHits.length > 0 && wallHits[0].distance < distToPlayer - 0.4) {
        // ENEMY BULLET HITS A SOLID WALL / COVER (PLAYER TAKES ZERO DAMAGE!)
        const wallHit = wallHits[0];
        const normal = wallHit.face ? wallHit.face.normal.clone().applyQuaternion(wallHit.object.quaternion) : new THREE.Vector3(0, 1, 0);
        this.particles.spawnWallImpact(wallHit.point, normal, "stone");
        this.createBulletTracer(botMuzzle, wallHit.point);
      } else {
        // CLEAR LINE OF SIGHT: Bot shoots player
        let hitChance = 0.52;
        if (this.opponentDifficulty === "ROOKIE") hitChance = 0.25;
        if (this.opponentDifficulty === "APEX") hitChance = 0.78;
        if (this.opponentDifficulty === "CHEATER") hitChance = 0.95;

        if (Math.random() < hitChance) {
          const damage = Math.round(15 + Math.random() * 10);
          this.playerHp = Math.max(0, this.playerHp - damage);

          sounds.playFootstep();
          this.callbacks.onPlayerDamaged?.(this.playerHp, damage);
          this.callbacks.onPlayerTakeDamage?.(damage);
          this.callbacks.onHealthUpdate?.({
            playerHp: this.playerHp,
            opponentHp: this.opponentHp,
            lastDamage: damage,
            isPlayerVictim: true,
            isHeadshot: false,
          });

          this.createBulletTracer(botMuzzle, this.playerPos);

          // Player Defeat Check
          if (this.playerHp <= 0 && !this.isRoundEnding) {
            this.isRoundEnding = true;
            sounds.playRobloxOof();
            sounds.playRoundLoss();
            this.callbacks.onKill?.(false, "YOU", false);
            this.callbacks.onRoundEnded?.("OPPONENT", false);

            setTimeout(() => {
              if (this.isMatchActive) {
                this.resetRound();
              }
            }, 1800);
          }
        } else {
          // Miss shot tracer
          const missTarget = this.playerPos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 3.5, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 3.5));
          this.createBulletTracer(botMuzzle, missTarget);
        }
      }
    }
  }

  // -------------------------------------------------------------
  // Jump Pads Handler
  // -------------------------------------------------------------
  private updateJumpPads() {
    const now = performance.now();

    this.jumpPads.forEach((pad) => {
      const distToPlayer = Math.hypot(this.playerPos.x - pad.position.x, this.playerPos.z - pad.position.z);
      if (distToPlayer < pad.radius && this.playerPos.y <= pad.position.y + 1.8 && now - pad.lastUsedTime > 600) {
        pad.lastUsedTime = now;
        this.playerVel.y = pad.power;
        this.isGrounded = false;
        sounds.playMovement("JUMP");
      }

      const distToBot = Math.hypot(this.opponentPos.x - pad.position.x, this.opponentPos.z - pad.position.z);
      if (distToBot < pad.radius && this.opponentPos.y <= pad.position.y + 1.8 && now - pad.lastUsedTime > 600) {
        pad.lastUsedTime = now;
        this.opponentVel.y = pad.power;
        this.opponentIsGrounded = false;
        sounds.playMovement("JUMP");
      }
    });
  }

  // -------------------------------------------------------------
  // Viewmodel & Camera
  // -------------------------------------------------------------
  private updateViewmodel(dt: number) {
    if (!this.currentWeaponMesh) return;

    const targetZ = this.isAiming ? -0.32 : -0.42;
    const targetX = this.isAiming ? 0 : 0.22;
    const targetY = this.isAiming ? -0.14 : -0.2;

    const speed = Math.hypot(this.playerVel.x, this.playerVel.z);
    const bobbing = this.isGrounded && speed > 1 ? Math.sin(performance.now() * 0.012) * 0.008 : 0;

    this.currentWeaponMesh.position.x = THREE.MathUtils.lerp(this.currentWeaponMesh.position.x, targetX, dt * 15);
    this.currentWeaponMesh.position.y = THREE.MathUtils.lerp(this.currentWeaponMesh.position.y, targetY + bobbing, dt * 15);
    this.currentWeaponMesh.position.z = THREE.MathUtils.lerp(this.currentWeaponMesh.position.z, targetZ, dt * 15);
    this.currentWeaponMesh.rotation.x = THREE.MathUtils.lerp(this.currentWeaponMesh.rotation.x, 0, dt * 12);

    if (this.isInspecting) {
      this.currentWeaponMesh.rotation.y += dt * 3.5;
    } else {
      this.currentWeaponMesh.rotation.y = THREE.MathUtils.lerp(this.currentWeaponMesh.rotation.y, 0, dt * 10);
    }

    const targetFov = this.isAiming ? this.currentWeapon.zoomFov : this.settings.fov;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, dt * 16);
    this.camera.updateProjectionMatrix();
  }

  private updateTracers(dt: number) {
    for (let i = this.bulletTracers.length - 1; i >= 0; i--) {
      const tracer = this.bulletTracers[i];
      tracer.age += dt;
      if (tracer.age >= tracer.maxAge) {
        this.scene.remove(tracer.line);
        this.bulletTracers.splice(i, 1);
      }
    }
  }

  // -------------------------------------------------------------
  // Input Event Handlers (Quake 1 Style Full Keyboard Support)
  // -------------------------------------------------------------
  private onKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const code = e.code.toLowerCase();
    this.keys[key] = true;
    this.keys[code] = true;

    // Prevent default browser scrolling on gameplay keys (arrows, space, page up/down)
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", "space", "pageup", "pagedown", "home", "end"].includes(code) || ["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "pageup", "pagedown", "home", "end"].includes(key)) {
      if (this.isMatchActive) {
        e.preventDefault();
      }
    }

    if (e.key === "Escape" || e.code === "Escape") {
      this.exitPointerLock();
      this.callbacks.onOpenPauseMenu?.();
      return;
    }

    if (!this.isMatchActive) return;

    // 1. Quake 1 Fire / Attack (+attack via Ctrl or Enter)
    if (key === "control" || code === "controlleft" || code === "controlright") {
      this.isFiringHeld = true;
      this.shoot();
    }
    if (key === "enter" || code === "enter" || code === "numpadenter") {
      this.shoot();
    }

    // 2. Jump (+jump via Space)
    if (key === (this.settings.keybinds.jump?.toLowerCase() || " ") || code === "space" || key === " ") {
      this.jump();
    }

    // 3. Crouch & Slide (C, X, or Duck)
    if (key === (this.settings.keybinds.crouchSlide?.toLowerCase() || "c") || code === "keyc" || key === "c" || key === "x" || code === "keyx") {
      this.startSlide();
    }

    // 4. Dash / Impulse (Q or Tab)
    if (key === (this.settings.keybinds.dash?.toLowerCase() || "q") || code === "keyq" || key === "q" || key === "tab" || code === "tab") {
      this.performDash();
    }

    // 5. Reload (+reload via R)
    if (key === (this.settings.keybinds.reload?.toLowerCase() || "r") || code === "keyr" || key === "r") {
      this.reload();
    }

    // 6. Inspect Weapon (F)
    if (key === (this.settings.keybinds.inspect?.toLowerCase() || "f") || code === "keyf" || key === "f") {
      this.inspectWeapon();
    }

    // 7. Aim / Zoom toggle with Keyboard (Z or V or Right Click)
    if (key === "z" || key === "v" || code === "keyz" || code === "keyv") {
      this.isAiming = !this.isAiming;
    }

    // 8. Instant Center View (End / K / Numpad 5)
    if (key === "end" || key === "k" || code === "end" || code === "numpad5" || code === "keyk") {
      this.playerRotation.pitch = 0;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const code = e.code.toLowerCase();
    this.keys[key] = false;
    this.keys[code] = false;

    // Release fire state on Ctrl release
    if (key === "control" || code === "controlleft" || code === "controlright") {
      this.isFiringHeld = false;
    }
  };

  private onMouseDown = (e: MouseEvent) => {
    if (!this.isMatchActive) return;
    this.isMouseDown = true;
    this.lastMousePos.x = e.clientX;
    this.lastMousePos.y = e.clientY;

    if (!this.isPointerLocked) {
      this.requestPointerLock();
    }

    if (e.button === 0) {
      this.isFiringHeld = true;
      this.shoot();
    } else if (e.button === 2) {
      this.isAiming = true;
    }
  };

  private onMouseUp = (e: MouseEvent) => {
    this.isMouseDown = false;
    if (e.button === 0) {
      this.isFiringHeld = false;
    } else if (e.button === 2) {
      this.isAiming = false;
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isMatchActive) return;

    const sens = this.settings.mouseSensitivity * 0.0018;
    let dx = e.movementX;
    let dy = e.movementY;

    if (dx === undefined || (dx === 0 && dy === 0 && this.isMouseDown)) {
      if (this.lastMousePos.x !== 0 || this.lastMousePos.y !== 0) {
        dx = e.clientX - this.lastMousePos.x;
        dy = e.clientY - this.lastMousePos.y;
      }
    }
    this.lastMousePos.x = e.clientX;
    this.lastMousePos.y = e.clientY;

    if (this.isPointerLocked || this.isMouseDown || e.buttons > 0) {
      if (typeof dx === "number" && !isNaN(dx)) {
        this.playerRotation.yaw -= dx * sens;
      }
      if (typeof dy === "number" && !isNaN(dy)) {
        this.playerRotation.pitch -= dy * sens;
      }
      this.playerRotation.pitch = Math.max(-1.55, Math.min(1.55, this.playerRotation.pitch));
    }
  };

  private onContextMenu = (e: MouseEvent) => {
    if (this.isMatchActive) {
      e.preventDefault();
    }
  };

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height || 1;

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.viewmodelCamera.aspect = aspect;
    this.viewmodelCamera.updateProjectionMatrix();

    this.applyResolutionAndFilter();
  };

  public dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.particles.dispose();

    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("contextmenu", this.onContextMenu);
    window.removeEventListener("resize", this.onResize);

    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
