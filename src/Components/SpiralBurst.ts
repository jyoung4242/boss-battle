import { Actor, ActorEvents, Engine, Vector, Util, Entity } from "excalibur";
import { AttackComponent, AttackComponentConfig } from "./BossComponents";
import { BaddieBullet } from "../Actors/BaddieBullet";

const bulletTypes = {
  baddie: BaddieBullet,
};

export class SpiralBurstAttack extends AttackComponent {
  spawnTik: number = 0;
  numBullets: number = 1;
  spawnDelay: number = 100;
  fireRate: number = 1000;
  actorlist: string[] = ["baddie"];
  listOfDirections: Vector[] = [];
  constructor(public owner: Actor, public engine: Engine, config: AttackComponentConfig) {
    super(owner, engine, config);

    if (config.numberBullets) this.numBullets = config.numberBullets;
    if (config.fireRate) this.fireRate = config.fireRate;
    if (config.bulletActors) this.actorlist = [...config.bulletActors];
    if (config.delayMS) this.spawnDelay = config.delayMS;
    const angleDelta = (2 * Math.PI) / (this.numBullets - 1);

    for (let i = 0; i < this.numBullets; i++) {
      const nextVector = new Vector(Math.cos(i * angleDelta), Math.sin(i * angleDelta));
      this.listOfDirections.push(nextVector);
    }
  }

  async spawnBullets() {
    if (!this.attackEnable) return;
    if (!this.owner) {
      console.log("no owner, spiral burst: ", this.uuid);
      return;
    }
    for (let i = 0; i < this.numBullets - 1; i++) {
      const actor = this.actorlist[Math.floor(Math.random() * this.actorlist.length)];
      const spawnPoint = new Vector(this.owner.pos.x + this.owner.width / 2, this.owner.pos.y + this.owner.height / 2).add(
        this.listOfDirections[i].scale(10)
      );
      //@ts-ignore
      this.engine.currentScene.add(new bulletTypes[actor](spawnPoint, this.listOfDirections[i]));

      await Util.delay(this.spawnDelay);
    }
  }

  onPreUpdate(event: ActorEvents["preupdate"]): void {
    if (!this.owner) {
      console.log("no owner, spiral burst");
      return;
    }
    if (this.spawnTik > this.fireRate) {
      this.spawnTik = 0;
      this.spawnBullets();
    }

    if (!this.attackEnable) return;
    this.spawnTik += event.elapsedMs;
  }
}

// i need an async delay function
