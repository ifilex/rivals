import * as THREE from "three";

export interface VoxelParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
  life: number;
  maxLife: number;
  initialScale: number;
}

export class VoxelParticleSystem {
  private scene: THREE.Scene;
  private particles: VoxelParticle[] = [];
  private cubeGeo: THREE.BoxGeometry;

  // Cached materials for ultra-fast performance
  private stoneMat: THREE.MeshStandardMaterial;
  private woodMat: THREE.MeshStandardMaterial;
  private neonMat: THREE.MeshStandardMaterial;
  private bloodMat: THREE.MeshStandardMaterial;
  private goldMat: THREE.MeshStandardMaterial;
  private sparkMat: THREE.MeshBasicMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.cubeGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);

    this.stoneMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
    this.woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
    this.neonMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.9 });
    this.bloodMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
    this.goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xf59e0b, emissiveIntensity: 0.8 });
    this.sparkMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  }

  /**
   * Spawn a frenetic burst of voxel debris cubes when a bullet strikes a wall/obstacle
   */
  public spawnWallImpact(point: THREE.Vector3, normal: THREE.Vector3, type: "stone" | "wood" | "metal" | "neon" = "stone") {
    let mat = this.stoneMat;
    if (type === "wood") mat = this.woodMat;
    if (type === "neon") mat = this.neonMat;

    const count = 12 + Math.floor(Math.random() * 6);

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.cubeGeo, Math.random() < 0.3 ? this.sparkMat : mat);
      mesh.position.copy(point);
      
      const scale = 0.08 + Math.random() * 0.14;
      mesh.scale.set(scale, scale, scale);

      // Bounce velocity away from wall normal with cone spread
      const spreadX = (Math.random() - 0.5) * 5;
      const spreadY = (Math.random() - 0.5) * 5 + 3.5;
      const spreadZ = (Math.random() - 0.5) * 5;

      const vel = new THREE.Vector3(normal.x * 4 + spreadX, normal.y * 4 + spreadY, normal.z * 4 + spreadZ);

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15
        ),
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
        initialScale: scale,
      });
    }
  }

  /**
   * Spawn hit spark particles on character hit
   */
  public spawnHitSparks(point: THREE.Vector3, isHeadshot: boolean) {
    const mat = isHeadshot ? this.goldMat : this.bloodMat;
    const count = isHeadshot ? 16 : 10;

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.cubeGeo, mat);
      mesh.position.copy(point);

      const scale = isHeadshot ? 0.12 + Math.random() * 0.1 : 0.08 + Math.random() * 0.08;
      mesh.scale.set(scale, scale, scale);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        Math.random() * 5 + 2,
        (Math.random() - 0.5) * 6
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        rotationSpeed: new THREE.Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20),
        life: 0,
        maxLife: 0.4 + Math.random() * 0.2,
        initialScale: scale,
      });
    }
  }

  /**
   * Spawn sliding dust particle trail behind character
   */
  public spawnSlideDust(point: THREE.Vector3) {
    const count = 5;
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.cubeGeo, this.stoneMat);
      mesh.position.set(
        point.x + (Math.random() - 0.5) * 0.4,
        point.y - 0.7,
        point.z + (Math.random() - 0.5) * 0.4
      );

      const scale = 0.06 + Math.random() * 0.06;
      mesh.scale.set(scale, scale, scale);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        Math.random() * 1.2 + 0.4,
        (Math.random() - 0.5) * 1.5
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        ),
        life: 0,
        maxLife: 0.25 + Math.random() * 0.15,
        initialScale: scale,
      });
    }
  }

  /**
   * Spawn glowing neon rings and particles when jump pad is triggered
   */
  public spawnJumpPadParticles(point: THREE.Vector3) {
    const count = 14;
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.cubeGeo, this.neonMat);
      mesh.position.set(
        point.x + (Math.random() - 0.5) * 1.2,
        point.y + 0.2,
        point.z + (Math.random() - 0.5) * 1.2
      );

      const scale = 0.1 + Math.random() * 0.08;
      mesh.scale.set(scale, scale, scale);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        Math.random() * 8 + 6,
        (Math.random() - 0.5) * 3
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12
        ),
        life: 0,
        maxLife: 0.45 + Math.random() * 0.2,
        initialScale: scale,
      });
    }
  }

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;

      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }

      // Physics integration
      p.velocity.y -= 18.0 * dt; // Gravity
      p.mesh.position.addScaledVector(p.velocity, dt);

      p.mesh.rotation.x += p.rotationSpeed.x * dt;
      p.mesh.rotation.y += p.rotationSpeed.y * dt;
      p.mesh.rotation.z += p.rotationSpeed.z * dt;

      // Shrink scale as it dies
      const progress = 1 - (p.life / p.maxLife);
      const currentScale = p.initialScale * Math.max(0, progress);
      p.mesh.scale.set(currentScale, currentScale, currentScale);
    }
  }

  public dispose() {
    this.particles.forEach((p) => {
      this.scene.remove(p.mesh);
    });
    this.particles = [];
    this.cubeGeo.dispose();
  }
}
