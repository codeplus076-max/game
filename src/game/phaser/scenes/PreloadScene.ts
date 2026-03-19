import { Scene } from "phaser";

export class PreloadScene extends Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    // add asset loading here
  }

  create(): void {
    this.scene.start("BaseScene");
  }
}
