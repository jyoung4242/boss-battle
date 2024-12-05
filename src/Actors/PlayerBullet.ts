import { Actor, Collider, CollisionContact, CollisionType, Color, Engine, Side, Vector } from "excalibur";
import { direction, playerBulletColliders } from "../main";
import { BossShield } from "./Boss";

const BULLET_SPEED = 400;

export class PlayerBullet extends Actor {
  constructor(pos: Vector, public direction: direction) {
    super({
      name: "pBullet",
      radius: 5,
      pos,
      color: Color.Orange,
      anchor: Vector.Zero,
      collisionType: CollisionType.Passive,
      collisionGroup: playerBulletColliders,
    });
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    let oName = other.owner.name;
    if (oName == "wall") {
      this.kill();
    } else if (oName == "boss") {
      this.kill();
    } else if (oName == "minion") {
      this.kill();
    } else if (oName == "shield") {
      if ((other.owner as BossShield).enabled) this.kill();
    }
  }

  onInitialize(engine: Engine) {
    switch (this.direction) {
      case "right":
        this.vel = new Vector(BULLET_SPEED, 0);
        break;
      case "left":
        this.vel = new Vector(-BULLET_SPEED, 0);
        break;
      case "up":
        this.vel = new Vector(0, -BULLET_SPEED);
        break;
      case "down":
        this.vel = new Vector(0, BULLET_SPEED);
        break;
      case "leftUp":
        this.vel = new Vector(-BULLET_SPEED, -BULLET_SPEED);
        break;
      case "leftDown":
        this.vel = new Vector(-BULLET_SPEED, BULLET_SPEED);
        break;
      case "rightUp":
        this.vel = new Vector(BULLET_SPEED, -BULLET_SPEED);
        break;
      case "rightDown":
        this.vel = new Vector(BULLET_SPEED, BULLET_SPEED);
        break;
      case "none":
      default:
        this.vel = Vector.Zero;
        break;
    }
  }
}
