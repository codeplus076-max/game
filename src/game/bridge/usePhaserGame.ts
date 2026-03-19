import { useEffect, useRef, useState } from "react";

export function usePhaserGame(containerId = "phaser-container") {
  const gameRef = useRef<any | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || gameRef.current) return;

    let isMounted = true;

    Promise.all([
      import("phaser"),
      import("@/game/phaser/config/gameConfig"),
      import("@/game/phaser/scenes/PreloadScene"),
      import("@/game/phaser/scenes/BaseScene"),
      import("@/game/phaser/scenes/AttackScene"),
    ]).then(([phaserModule, configModule, preloadModule, baseModule, attackModule]) => {
      if (!isMounted) return;

      const { Game } = phaserModule;
      const { gameConfig } = configModule;
      const { PreloadScene } = preloadModule;
      const { BaseScene } = baseModule;
      const { AttackScene } = attackModule;

      const cfg = {
        ...gameConfig,
        parent: containerId,
        scene: [PreloadScene, BaseScene, AttackScene],
      };

      gameRef.current = new Game(cfg);
      setIsReady(true);
    }).catch((err) => {
      console.error("Failed to load Phaser game", err);
    });

    return () => {
      isMounted = false;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      setIsReady(false);
    };
  }, [containerId]);

  return {
    game: gameRef.current,
    isReady,
  };
}
