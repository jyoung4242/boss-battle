import { Actor, Collider, CollisionContact, CollisionType, Color, Engine, Side, Vector } from "excalibur";
import { enemyBulletColliders } from "../main";

const BULLET_SPEED = 175;

export class BaddieBullet extends Actor {
  constructor(pos: Vector, public direction: Vector) {
    super({
      name: "bBullet",
      radius: 10,
      pos,
      color: Color.fromHex("#FF5511"),
      anchor: Vector.Half,
      collisionType: CollisionType.Passive,
      collisionGroup: enemyBulletColliders,
    });
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    let oName = other.owner.name;
    if (oName == "wall") {
      this.kill();
    } else if (oName == "player") {
      this.kill();
    }
  }

  onInitialize(engine: Engine) {
    this.vel = this.direction.scale(BULLET_SPEED);
  }
}
