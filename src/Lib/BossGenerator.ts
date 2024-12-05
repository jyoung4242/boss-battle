import { Component, Engine, Actor, Random } from "excalibur";
import { ActorEvents } from "excalibur/build/dist/Actor";
import { Boss, BossConfig, otherComponents } from "../Actors/Boss";
import { AttackComponentConfig, BulletPatterns, MoveComponentConfig, OtherComponent } from "../Components/BossComponents";

export class BossGenerator extends Component {
  rng: Random = new Random();
  constructor(public owner: Actor, public engine: Engine) {
    super();
  }

  onAdd(): void {
    this.owner.on("preupdate", this.onPreUpdate.bind(this));
  }

  generateBoss(): Actor {
    let mConfig: MoveComponentConfig = {
      duration: this.rng.integer(3000, 7000),
      moveRadius: this.rng.integer(175, 210),
      direction: this.rng.pickOne(["CCW", "CW"]),
    };

    let aConfig: AttackComponentConfig = {
      numberBullets: this.rng.integer(3, 8),
      bulletActors: ["baddie"],
      fireRate: this.rng.integer(2000, 5000),
      attackAngle: this.rng.integer(30, 75),
      delayMS: this.rng.integer(10, 150),
    };

    let otherBehaviors: string[] = this.rng.pickSet(["spawn", "heal", "shield"], 2, false);

    let bossConfig: BossConfig = {
      mConfig,
      move: this.rng.pickOne(["orbit", "random", "teleport"]),
      aConfig,
      attack: this.rng.pickOne(["spiral", "spray", "burst"]),
      //@ts-ignore
      other: otherBehaviors,
    };
    console.log(otherBehaviors);

    let boss = new Boss(this.engine, bossConfig);
    return boss;
  }

  onPreUpdate(event: ActorEvents["preupdate"]): void {}
}
