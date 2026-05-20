declare module "play-sound" {
  interface PlayerOptions {
    player?: string;
  }

  interface Player {
    play(
      path: string,
      callback?: (err: Error | null) => void
    ): { kill: () => void };
  }

  function player(opts?: PlayerOptions): Player;

  export = player;
}
