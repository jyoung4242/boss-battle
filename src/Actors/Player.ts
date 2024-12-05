import { Actor, Vector, Color, Engine, Collider, CollisionContact, Side, CollisionGroup } from "excalibur";
import { ActorSignals } from "../Lib/CustomEmitterManager";
import { direction } from "../main";
import { PlayerBullet } from "./PlayerBullet";
import { HealthBar } from "../Lib/healthbar";
import { Boss } from "./Boss";

export const playerCollider = new CollisionGroup("playerCollider", 0b0001, 0b10110);

const PLAYER_MAX_HP = 25;
const PLAYER_VELOCITY = 75;
const PLAYER_FIRE_RATE = 10;

class Player extends Actor {
  healthbar: HealthBar;
  hp: number = PLAYER_MAX_HP;
  wallCollisionDirection: direction[] = [];
  fireTik: number = 0;
  leftStick: direction = "none";
  rightStick: direction = "none";
  constructor() {
    super({
      name: "player",
      radius: 25,
      pos: new Vector(200, 300 - 12.5),
      color: Color.Red,
      collisionGroup: playerCollider,
      z: 1,
    });
    this.healthbar = new HealthBar(new Vector(50, 7), new Vector(-25, -37), PLAYER_MAX_HP);
    this.addChild(this.healthbar);
  }
  onInitialize(engine: Engine): void {
    ActorSignals.on("leftStickIdle", () => (this.leftStick = "none"));
    ActorSignals.on("leftStickDown", () => (this.leftStick = "down"));
    ActorSignals.on("leftStickUp", () => (this.leftStick = "up"));
    ActorSignals.on("leftStickLeft", () => (this.leftStick = "left"));
    ActorSignals.on("leftStickRight", () => (this.leftStick = "right"));
    ActorSignals.on("leftStickUpLeft", () => (this.leftStick = "leftUp"));
    ActorSignals.on("leftStickUpRight", () => (this.leftStick = "rightUp"));
    ActorSignals.on("leftStickDownLeft", () => (this.leftStick = "leftDown"));
    ActorSignals.on("leftStickDownRight", () => (this.leftStick = "rightDown"));

    ActorSignals.on("rightStickIdle", () => (this.rightStick = "none"));
    ActorSignals.on("rightStickDown", () => (this.rightStick = "down"));
    ActorSignals.on("rightStickUp", () => (this.rightStick = "up"));
    ActorSignals.on("rightStickLeft", () => (this.rightStick = "left"));
    ActorSignals.on("rightStickRight", () => (this.rightStick = "right"));
    ActorSignals.on("rightStickUpLeft", () => (this.rightStick = "leftUp"));
    ActorSignals.on("rightStickUpRight", () => (this.rightStick = "rightUp"));
    ActorSignals.on("rightStickDownLeft", () => (this.rightStick = "leftDown"));
    ActorSignals.on("rightStickDownRight", () => (this.rightStick = "rightDown"));
  }

  resetPlayer() {
    this.hp = PLAYER_MAX_HP;
  }

  addCollisionToArray(side: direction) {
    //check for collision not existing in array
    if (!this.wallCollisionDirection.includes(side)) {
      this.wallCollisionDirection.push(side);
    }
  }

  removeCollisionFromArray(side: direction) {
    if (this.wallCollisionDirection.includes(side)) {
      this.wallCollisionDirection.splice(this.wallCollisionDirection.indexOf(side), 1);
    }
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    //handle wall collisions

    if (other.owner.name == "wall") {
      switch (side) {
        case Side.Top:
          this.addCollisionToArray("up");
          break;
        case Side.Bottom:
          this.addCollisionToArray("down");
          break;
        case Side.Left:
          this.addCollisionToArray("left");
          break;
        case Side.Right:
          this.addCollisionToArray("right");
          break;
      }
    } else if (other.owner.name == "minion") {
      this.hp -= 5;
    } else if (other.owner.name == "boss") {
      if ((other.owner as Boss).isCollidingEnabled) this.hp -= 10;
    } else if (other.owner.name == "bBullet") {
      this.hp -= 3;
    }
  }

  onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    if (other.owner.name == "wall") {
      switch (side) {
        case Side.Top:
          this.removeCollisionFromArray("up");
          break;
        case Side.Bottom:
          this.removeCollisionFromArray("down");
          break;
        case Side.Left:
          this.removeCollisionFromArray("left");
          break;
        case Side.Right:
          this.removeCollisionFromArray("right");
          break;
      }
    }
  }

  spawnBullet(engine: Engine) {
    let scene = engine.currentScene;
    let newBullet = new PlayerBullet(this.pos, this.rightStick);
    scene.add(newBullet);
  }

  onPreUpdate(engine: Engine, delta: number): void {
    //update healthbar
    this.healthbar.setPercent((this.hp / PLAYER_MAX_HP) * 100);

    if (this.leftStick != "none") {
      switch (this.leftStick) {
        case "left":
          if (!this.wallCollisionDirection.includes("left")) this.vel = new Vector(-PLAYER_VELOCITY, 0);
          else this.vel = new Vector(0, this.vel.y);
          break;
        case "right":
          if (!this.wallCollisionDirection.includes("right")) this.vel = new Vector(PLAYER_VELOCITY, 0);
          else this.vel = new Vector(0, this.vel.y);
          break;
        case "up":
          if (!this.wallCollisionDirection.includes("up")) this.vel = new Vector(0, -PLAYER_VELOCITY);
          else this.vel = new Vector(this.vel.x, 0);
          break;
        case "down":
          if (!this.wallCollisionDirection.includes("left")) this.vel = new Vector(0, PLAYER_VELOCITY);
          else this.vel = new Vector(this.vel.x, 0);
          break;
        case "leftUp":
          if (!this.wallCollisionDirection.includes("left") && !this.wallCollisionDirection.includes("up"))
            this.vel = new Vector(-PLAYER_VELOCITY, -PLAYER_VELOCITY);
          else if (this.wallCollisionDirection.includes("left")) this.vel = new Vector(0, this.vel.y);
          else if (this.wallCollisionDirection.includes("up")) this.vel = new Vector(this.vel.x, 0);
          break;
        case "leftDown":
          if (!this.wallCollisionDirection.includes("left") && !this.wallCollisionDirection.includes("down"))
            this.vel = new Vector(-PLAYER_VELOCITY, PLAYER_VELOCITY);
          else if (this.wallCollisionDirection.includes("left")) this.vel = new Vector(0, this.vel.y);
          else if (this.wallCollisionDirection.includes("down")) this.vel = new Vector(this.vel.x, 0);
          break;
        case "rightUp":
          if (!this.wallCollisionDirection.includes("right") && !this.wallCollisionDirection.includes("up"))
            this.vel = new Vector(PLAYER_VELOCITY, -PLAYER_VELOCITY);
          else if (this.wallCollisionDirection.includes("right")) this.vel = new Vector(0, this.vel.y);
          else if (this.wallCollisionDirection.includes("up")) this.vel = new Vector(this.vel.x, 0);
          break;
        case "rightDown":
          if (!this.wallCollisionDirection.includes("right") && !this.wallCollisionDirection.includes("down"))
            this.vel = new Vector(PLAYER_VELOCITY, PLAYER_VELOCITY);
          else if (this.wallCollisionDirection.includes("right")) this.vel = new Vector(0, this.vel.y);
          else if (this.wallCollisionDirection.includes("down")) this.vel = new Vector(this.vel.x, 0);
          break;
        default:
          break;
      }
    } else {
      this.vel = Vector.Zero;
    }

    if (this.rightStick != "none") {
      this.fireTik += 1;
      if (this.fireTik >= PLAYER_FIRE_RATE) {
        this.fireTik = 0;
        this.spawnBullet(engine);
      }
    }

    if (this.hp <= 0) {
      ActorSignals.emit("playerDead");
      engine.currentScene.remove(this);
    }
  }
}

export const player = new Player();
