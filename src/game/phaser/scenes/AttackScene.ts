import { Scene } from "phaser";
import { phaserEventBus } from "@/game/bridge/phaserEventBus";
import type { AIPresetBase } from "@/types/game";

export class AttackScene extends Scene {
  private buildingSprites: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private aiBase: AIPresetBase | null = null;

  constructor() {
    super({ key: "AttackScene" });
  }

  create(): void {
    this.add.text(16, 16, "Attack scene", { color: "#ffffff" });

    phaserEventBus.on("LOAD_AI_BASE", (p) => {
      this.loadAiBase(p.aiBase);
    });

    phaserEventBus.on("APPLY_ATTACK_DAMAGE", (p) => {
      this.applyDamageVisual(p.buildingId, p.destroyed);
    });
    phaserEventBus.on("RESET_ATTACK_SCENE", () => {
      this.loadAiBase(this.aiBase as AIPresetBase);
    });

    phaserEventBus.emit("SCENE_READY", { scene: "attack" });
  }

  loadAiBase(aiBase: AIPresetBase) {
    this.aiBase = aiBase;
    this.buildingSprites.forEach((s) => s.destroy());
    this.buildingSprites.clear();

    const width = this.scale.width;
    const height = this.scale.height;

    // clustering origin
    const originX = width / 2 - 150;
    const originY = height / 2 - 100;

    aiBase.layout.forEach((b, i) => {
      const x = originX + (b.position.x - 1) * 140;
      const y = originY + (b.position.y - 1) * 100;

      let fillColor = 0x083344;
      let strokeColor = 0x0ea5e9;
      if (b.type === "main_server") { fillColor = 0x1e3a8a; strokeColor = 0x60a5fa; }
      else if (b.type === "firewall_tower") { fillColor = 0x450a0a; strokeColor = 0xf87171; }
      else if (b.type === "patch_center") { fillColor = 0x064e3b; strokeColor = 0x34d399; }
      else if (b.type === "backup_center") { fillColor = 0x451a03; strokeColor = 0xfbbf24; }

      const rect = this.add.rectangle(x, y, 120, 65, fillColor).setStrokeStyle(2, strokeColor);
      rect.setInteractive({ cursor: "pointer" });
      rect.setData("originalFill", fillColor);
      rect.setData("originalStroke", strokeColor);

      const label = this.add.text(x - 55, y - 15, `${b.name}\n[LVL ${b.level}]`, { color: "#dbeafe", fontSize: "12px", align: "center", wordWrap: { width: 110 } });

      rect.on("pointerdown", () => {
        phaserEventBus.emit("ATTACK_TARGET_SELECTED", { buildingId: b.id });
        this.tweens.add({
          targets: rect,
          scaleX: 1.05,
          scaleY: 1.05,
          yoyo: true,
          duration: 150
        });
      });

      rect.on("pointerover", () => { if (rect.input?.enabled) rect.setFillStyle(0x334155); });
      rect.on("pointerout", () => { if (rect.input?.enabled) rect.setFillStyle(fillColor); });

      this.buildingSprites.set(b.id, rect);
    });
  }

  applyDamageVisual(buildingId: string, destroyed: boolean) {
    const rect = this.buildingSprites.get(buildingId);
    if (!rect) return;

    // flash red
    rect.setFillStyle(0xf87171);
    this.cameras.main.shake(150, 0.015);

    this.time.delayedCall(150, () => {
      if (destroyed) {
        rect.setFillStyle(0x1c1917); // dead machinery gray
        rect.setStrokeStyle(2, 0x44403c);
        rect.setAlpha(0.6);
        rect.disableInteractive();
      } else {
        rect.setFillStyle(rect.getData("originalFill"));
      }
    });
  }
}

