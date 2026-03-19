type EventHandler<T = unknown> = (payload: T) => void;

type PhaserEventMap = {
  BUILDING_SELECTED: { buildingId: string };
  ATTACK_TARGET_SELECTED: { buildingId: string };
  SCENE_READY: { scene: "defend" | "attack" };
  LOAD_PLAYER_BASE: { buildings: import("@/types/game").BuildingInstance[] };
  LOAD_AI_BASE: { aiBase: import("@/types/game").AIPresetBase };
  START_BUILDING_UPGRADE_VISUAL: { buildingId: string; endsAt: string };
  COMPLETE_BUILDING_UPGRADE_VISUAL: { buildingId: string; newLevel: number };
  APPLY_ATTACK_DAMAGE: { buildingId: string; damage: number; destroyed: boolean };
  RESET_ATTACK_SCENE: undefined;
};

class PhaserEventBus {
  private listeners = new Map<keyof PhaserEventMap, Set<EventHandler>>();

  on<K extends keyof PhaserEventMap>(eventName: K, handler: EventHandler<PhaserEventMap[K]>) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(handler as EventHandler);
  }

  off<K extends keyof PhaserEventMap>(eventName: K, handler: EventHandler<PhaserEventMap[K]>) {
    this.listeners.get(eventName)?.delete(handler as EventHandler);
  }

  emit<K extends keyof PhaserEventMap>(eventName: K, payload: PhaserEventMap[K]) {
    this.listeners.get(eventName)?.forEach((handler) => handler(payload));
  }

  clear() {
    this.listeners.clear();
  }
}

export const phaserEventBus = new PhaserEventBus();
export type { PhaserEventMap };
