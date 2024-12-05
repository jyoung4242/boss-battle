import { Actor, Collider, CollisionContact, CollisionType, Color, Engine, Side, Vector } from "excalibur";
import { enemyColliders } from "../main";
import { player } from "./Player";
import { ActorSignals } from "../Lib/CustomEmitterManager";

export class Minion extends Actor {
  constructor(pos: Vector) {
    super({
      name: "minion",
      radius: 25,
      pos,
      color: Color.Green,
      collisionGroup: enemyColliders,
      collisionType: CollisionType.Passive,
    });
  }

  onInitialize(engine: Engine): void {
    this.actions.meet(player, 50);
    ActorSignals.on("bossDead", () => {
      this.kill();
    });
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    let oName = other.owner.name;
    if (oName == "player") {
      //kill actor
      this.kill();
    } else if (oName == "pBullet") {
      this.kill();
    }
  }
}
