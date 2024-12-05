import { Actor, ActorEvents, Engine, Vector, Util, toRadians, Entity } from "excalibur";
import { AttackComponent, AttackComponentConfig } from "./BossComponents";
import { BaddieBullet } from "../Actors/BaddieBullet";
import { player } from "../Actors/Player";

const bulletTypes = {
  baddie: BaddieBullet,
};

export class SprayBurstAttack extends AttackComponent {
  spawnTik: number = 0;
  numBullets: number = 1;
  spawnDelay: number = 100;
  fireRate: number = 1000;
  actorlist: string[] = ["baddie"];
  listOfDirections: Vector[] = [];
  attackAngle: number = toRadians(45);

  constructor(public owner: Actor, public engine: Engine, config: AttackComponentConfig) {
    super(owner, engine, config);

    if (config.numberBullets) this.numBullets = config.numberBullets;
    if (config.fireRate) this.fireRate = config.fireRate;
    if (config.bulletActors) this.actorlist = [...config.bulletActors];
    if (config.attackAngle) this.attackAngle = toRadians(config.attackAngle);
  }

  async spawnBullets() {
    if (!this.attackEnable) return;
    if (!this.owner) {
      console.log("no owner, spray burst: ", this.uuid);
      return;
    }
    //list of directions
    const playerCenter = player.pos.add(new Vector(player.width / 2, player.height / 2));
    const ownerCenter = this.owner.pos.add(new Vector(this.owner.width / 2, this.owner.height / 2));

    const targetAngle = playerCenter.sub(ownerCenter).normalize().toAngle(); //this.owner.pos.sub(player.pos).negate().toAngle();
    //console.log("targetangle", targetAngle);
    //console.log("attackangle", this.attackAngle);

    const startingAngle = targetAngle - this.attackAngle / 2;

    //console.log("startingangle", startingAngle);

    const angleDelta = this.attackAngle / this.numBullets;
    //console.log("angleDelta", angleDelta);
    const actor = this.actorlist[Math.floor(Math.random() * this.actorlist.length)];
    const spawnPoint = new Vector(this.owner.pos.x + this.owner.width / 2, this.owner.pos.y + this.owner.height / 2);

    for (let i = 0; i < this.numBullets; i++) {
      let nextangle = startingAngle + i * angleDelta;
      let nextVector = new Vector(Math.cos(nextangle), Math.sin(nextangle)).normalize();
      //@ts-ignore
      this.engine.currentScene.add(new bulletTypes[actor](spawnPoint, nextVector));
    }
  }

  onPreUpdate(event: ActorEvents["preupdate"]): void {
    if (!this.owner) {
      console.log("no owner, spray burst: ", this.uuid);
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
