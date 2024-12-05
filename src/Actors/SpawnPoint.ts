import { Actor, Color, Engine, Vector } from "excalibur";
import { EngineSignals } from "../Lib/CustomEmitterManager";
import { d } from "vite/dist/node/types.d-aGj9QkWt";
import { direction } from "../main";
import { Minion } from "./Enemy";

export class SpawnPoint extends Actor {
  centerPoint: Vector = new Vector(0, 0);
  constructor(size: Vector, pos: Vector, public side: direction) {
    super({
      name: "spawnPoint",
      width: size.x,
      height: size.y,
      pos,
      color: Color.Black,
      anchor: Vector.Zero,
    });
    this.centerPoint = this.pos.add(new Vector(size.x / 2, size.y / 2));
  }

  onInitialize(engine: Engine): void {
    let scene = engine.currentScene;
    EngineSignals.on("spawnMinion", data => {
      if (data.side == this.side) {
        scene.add(new Minion(this.centerPoint));
      }
    });
  }
}
