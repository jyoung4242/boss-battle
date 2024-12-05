import { Actor, Vector, Color, Engine, Shape, CollisionType } from "excalibur";
import { SpawnPoint } from "./SpawnPoint";
import { wallColliders } from "../main";
import { RoomController } from "../Lib/RoomController";
import { BossGenerator } from "../Lib/BossGenerator";

class Wall extends Actor {
  constructor(size: Vector, pos: Vector) {
    super({
      name: "wall",
      width: size.x,
      height: size.y,
      pos,
      color: Color.Blue,
      anchor: Vector.Zero,
      collisionGroup: wallColliders,
      collisionType: CollisionType.Passive,
    });
  }
}

export class Room extends Actor {
  rc: RoomController;
  bg: BossGenerator;
  constructor(public engine: Engine) {
    super({
      width: 800,
      height: 600,
      pos: new Vector(0, 0),
      color: Color.White,
      anchor: Vector.Zero,
      collisionType: CollisionType.PreventCollision,
    });

    this.rc = new RoomController(this, this.engine);
    this.addComponent(this.rc);

    this.bg = new BossGenerator(this,this.engine);
    this.addComponent(this.bg);
  }

  onInitialize(engine: Engine): void {
    //add Spawnpoints
    this.addChild(new SpawnPoint(new Vector(100, 10), new Vector(800 / 2 - 50, 0), "up"));
    this.addChild(new SpawnPoint(new Vector(100, 10), new Vector(800 / 2 - 50, 600 - 10), "down"));
    this.addChild(new SpawnPoint(new Vector(10, 100), new Vector(0, 600 / 2 - 50), "left"));
    this.addChild(new SpawnPoint(new Vector(10, 100), new Vector(800 - 10, 600 / 2 - 50), "right"));

    //add Colliders
    this.addChild(new Wall(new Vector(800, 10), new Vector(0, 0)));
    this.addChild(new Wall(new Vector(800, 10), new Vector(0, 600 - 10)));
    this.addChild(new Wall(new Vector(10, 600), new Vector(0, 0)));
    this.addChild(new Wall(new Vector(10, 600), new Vector(800 - 10, 0)));
  }
}
