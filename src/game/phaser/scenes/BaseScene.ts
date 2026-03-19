import { Scene, Input, GameObjects } from "phaser";
import { phaserEventBus } from "@/game/bridge/phaserEventBus";
import { starterBase } from "@/data/starterBase";

type RenderedBuilding = {
  id: string;
  rect: GameObjects.Rectangle;
  label: GameObjects.Text;
};

export class BaseScene extends Scene {
  private rendered: Map<string, RenderedBuilding> = new Map();
  private selectedId: string | null = null;

  constructor() {
    super({ key: "BaseScene" });
  }

  create(): void {
    // simple dark grid background
    const { width, height } = this.scale;
    const bg = this.add.rectangle(0, 0, width, height, 0x0f1720).setOrigin(0);

    const gridSize = 80;
    const gridColor = 0x14212a;
    for (let x = 0; x < width; x += gridSize) {
      this.add.line(x, 0, 0, 0, 0, height, gridColor).setOrigin(0);
    }
    for (let y = 0; y < height; y += gridSize) {
      this.add.line(0, y, 0, 0, width, 0, gridColor).setOrigin(0);
    }

    // Render starter buildings from data
    const originX = 80;
    const originY = 60;
    const cellSize = 120;

    starterBase.baseLayout.forEach((b) => {
      const px = originX + (b.position.x - 1) * cellSize + 50;
      const py = originY + (b.position.y - 1) * cellSize + 30;

      let fillColor = 0x203a44;
      let strokeColor = 0x7dd3fc;
      if (b.type === "main_server") { fillColor = 0x1e3a8a; strokeColor = 0x60a5fa; }
      else if (b.type === "firewall_tower") { fillColor = 0x450a0a; strokeColor = 0xf87171; }
      else if (b.type === "patch_center") { fillColor = 0x064e3b; strokeColor = 0x34d399; }
      else if (b.type === "backup_center") { fillColor = 0x451a03; strokeColor = 0xfbbf24; }

      const rect = this.add
        .rectangle(px, py, 110, 65, fillColor)
        .setOrigin(0.5)
        .setStrokeStyle(2, strokeColor)
        .setInteractive({ useHandCursor: true });

      rect.setData("originalFill", fillColor);

      const label = this.add
        .text(px, py, `${b.name}\n[LVL ${b.level}]`, { color: "#ffffff", fontSize: "11px", align: "center", wordWrap: { width: 100 } })
        .setOrigin(0.5)
        .setDepth(2);

      rect.on("pointerdown", () => {
        phaserEventBus.emit("BUILDING_SELECTED", { buildingId: b.id });
        this.setSelected(b.id);
      });

      rect.on("pointerover", () => rect.setFillStyle(0x334155));
      rect.on("pointerout", () => rect.setFillStyle(fillColor));

      this.rendered.set(b.id, { id: b.id, rect, label });
    });

    phaserEventBus.emit("SCENE_READY", { scene: "defend" });

    // respond when selection changes from React or other systems
    phaserEventBus.on("BUILDING_SELECTED", (p) => {
      if (!p || typeof p !== "object") return;
      // @ts-ignore
      this.setSelected((p as any).buildingId);
    });

    // visual start upgrade
    phaserEventBus.on("START_BUILDING_UPGRADE_VISUAL", (p) => {
      // @ts-ignore
      const bid = (p as any).buildingId as string;
      const rb = this.rendered.get(bid);
      if (rb) {
        rb.rect.setFillStyle(0x14532d);
        rb.rect.setStrokeStyle(4, 0xfacc15);
      }
    });

    this.input.on("gameobjectdown", (pointer: Input.Pointer, gameObject: GameObjects.GameObject) => {
      this.events.emit("DEBUG_CLICK", pointer, gameObject);
    });
  }

  private setSelected(id: string | null) {
    if (this.selectedId === id) return;
    // clear previous
    if (this.selectedId) {
      const prev = this.rendered.get(this.selectedId);
      if (prev) {
        prev.rect.setStrokeStyle(2, 0x7dd3fc);
        this.tweens.killTweensOf(prev.rect);
        prev.rect.setScale(1);
      }
    }
    this.selectedId = id;
    if (id) {
      const cur = this.rendered.get(id);
      if (cur) {
        cur.rect.setStrokeStyle(4, 0xfacc15);
        this.tweens.add({
          targets: cur.rect,
          scaleX: 1.05,
          scaleY: 1.05,
          yoyo: true,
          repeat: -1,
          duration: 800
        });
      }
    }
  }
}
