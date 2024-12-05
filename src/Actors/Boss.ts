import {
  Actor,
  Circle,
  Collider,
  CollisionContact,
  CollisionGroup,
  CollisionType,
  Color,
  Component,
  Engine,
  Random,
  Shape,
  Side,
  Vector,
} from "excalibur";
import { enemyColliders } from "../main";
import { BaddieBullet } from "./BaddieBullet";
import { player } from "./Player";
import { EngineSignals, ActorSignals } from "../Lib/CustomEmitterManager";
import { HealthBar } from "../Lib/healthbar";
import { BehaviorOrbitMovement } from "../Behaviors/behaviorOrbitalMovement";
import {
  AttackComponent,
  AttackComponentConfig,
  MonitorComponent,
  MoveComponent,
  MoveComponentConfig,
  OtherComponent,
  OtherComponentConfig,
} from "../Components/BossComponents";
import { OrbitRoom } from "../Components/OrbitRoom";
import { BurstAttack } from "../Components/BurstAttack";
import { RandomRoom } from "../Components/RandomRoom";
import { TeleportRoom } from "../Components/TeleportRoom";
import { SpiralBurstAttack } from "../Components/SpiralBurst";
import { SprayBurstAttack } from "../Components/SprayBurst";
import { ShieldOtherComponent } from "../Components/Shield";
import { HealOtherComponent } from "../Components/Heal";
import { SpawnOtherComponent } from "../Components/SpawnMinion";
import { MonitorHealth, MonitorHealthConfig } from "../Behaviors/MonitorHealth";

const bulletTypes = {
  baddie: BaddieBullet,
};

const moveComponents = {
  orbit: OrbitRoom,
  random: RandomRoom,
  teleport: TeleportRoom,
};

const attackComponents = {
  burst: BurstAttack,
  spiral: SpiralBurstAttack,
  spray: SprayBurstAttack,
};

export const otherComponents = {
  shield: ShieldOtherComponent,
  heal: HealOtherComponent,
  spawn: SpawnOtherComponent,
};

const BOSS_BULLET_SPAWN = 200;
const BOSS_ENEMY_SPAWN = 500;
const BOSS_MAX_HP = 100;
const BOSS_SPEED = 70;

export interface BossConfig {
  move: keyof typeof moveComponents;
  mConfig: MoveComponentConfig;
  attack: keyof typeof attackComponents;
  aConfig: AttackComponentConfig;
  other: keyof (typeof otherComponents)[];
}

export class Boss extends Actor {
  currentMove: keyof typeof moveComponents = "orbit";
  currentAttack: keyof typeof attackComponents = "burst";

  isCollidingEnabled: boolean = true;
  speed = BOSS_SPEED;
  isPlayerDead: boolean = false;
  healthbar: HealthBar;
  hp: number = BOSS_MAX_HP;
  maxHp: number = BOSS_MAX_HP;
  rng: Random = new Random();
  bossSpawnTik: number = 0;
  bossSpawnMinionTik: number = 1500;
  attackComponent: AttackComponent;
  moveComponent: MoveComponent;
  otherComponent: OtherComponent;
  otherComponent2: OtherComponent;
  shieldChild: BossShield;
  damageOT: number = 0;
  damageOTShieldTriggerLimit: number = 30;
  damageOTWatchDogLimit: number = 120;
  damageOTWatchDog: number = 0;
  monitorComponent: MonitorComponent;

  constructor(public engine: Engine, config: BossConfig) {
    super({
      name: "boss",
      width: 150,
      height: 150,
      collisionGroup: enemyColliders,
      collisionType: CollisionType.Passive,
      pos: new Vector(600, 600 / 2 - 75),
      color: Color.Magenta,
      anchor: Vector.Zero,
    });

    this.currentAttack = config.attack;
    this.currentMove = config.move;

    let monitorConfig: MonitorHealthConfig = {
      setPoint: 0.5,
      setPoint2: 0.25,
    };

    this.monitorComponent = new MonitorHealth(this, engine, monitorConfig);

    this.moveComponent = new moveComponents[config.move](this, this.engine, config.mConfig);
    this.attackComponent = new attackComponents[config.attack](this, this.engine, config.aConfig);
    //@ts-ignore
    this.otherComponent = new otherComponents[config.other[0]](this, this.engine);
    //@ts-ignore
    this.otherComponent2 = new otherComponents[config.other[1]](this, this.engine);

    this.healthbar = new HealthBar(new Vector(100, 5), new Vector(150 / 2 - 50, -10), BOSS_MAX_HP);
    this.addChild(this.healthbar);

    this.shieldChild = new BossShield();
    this.addChild(this.shieldChild);

    this.addComponent(this.moveComponent);
    this.addComponent(this.attackComponent);
    this.addComponent(this.otherComponent);
    this.addComponent(this.otherComponent2);
    this.addComponent(this.monitorComponent);

    console.log(this.otherComponent, this.otherComponent2);
  }

  onInitialize(engine: Engine): void {
    ActorSignals.on("playerDead", () => {
      this.isPlayerDead = true;
    });

    ActorSignals.on("bossSP1Triggered", this.changeBehavior.bind(this));
    ActorSignals.on("bossSP2Triggered", this.changeBehavior.bind(this));
  }

  changeBehavior() {
    console.warn("changing behavior");
    console.log(this);

    let moveBehaviors: Array<keyof typeof moveComponents> = ["orbit", "random", "teleport"];
    let attackBehaviors: Array<keyof typeof attackComponents> = ["burst", "spiral", "spray"];
    let otherBehaviors: Array<keyof typeof otherComponents> = ["shield", "heal", "spawn"];

    let currentMoveIndex = moveBehaviors.findIndex(b => b == this.currentMove);
    let currentAttackIndex = attackBehaviors.findIndex(b => b == this.currentAttack);

    moveBehaviors.splice(currentMoveIndex, 1);
    attackBehaviors.splice(currentAttackIndex, 1);

    this.currentMove = this.rng.pickOne(moveBehaviors);
    this.currentAttack = this.rng.pickOne(attackBehaviors);

    let otherbehavs = this.rng.pickSet(otherBehaviors, 2, false);

    console.log(this.currentMove, this.currentAttack, otherbehavs);

    this.removeComponent(this.moveComponent, true);
    this.removeComponent(this.attackComponent, true);
    this.removeComponent(this.otherComponent, true);
    this.removeComponent(this.otherComponent2, true);

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

    this.moveComponent = new moveComponents[this.currentMove](this, this.engine, mConfig);
    this.attackComponent = new attackComponents[this.currentAttack](this, this.engine, aConfig);
    //@ts-ignore
    this.otherComponent = new otherComponents[otherbehavs[0]](this, this.engine);
    //@ts-ignore
    this.otherComponent2 = new otherComponents[otherbehavs[1]](this, this.engine);

    console.log(this.moveComponent, this.attackComponent, this.otherComponent, this.otherComponent2);

    setTimeout(() => {
      this.addComponent(this.moveComponent);
      this.addComponent(this.attackComponent);
      this.addComponent(this.otherComponent);
      this.addComponent(this.otherComponent2);
    }, 50);
  }

  spawnMinion() {
    console.log("spawning minion", performance.now());

    let direction = this.rng.pickOne(["left", "right", "up", "down"]);
    EngineSignals.emit("spawnMinion", { side: direction });
  }

  disableCollisions() {
    this.isCollidingEnabled = false;
  }
  enableCollisions() {
    this.isCollidingEnabled = true;
  }

  spawnBullet(engine: Engine, pos: Vector) {
    let scene = engine.currentScene;
    if (player == undefined) return;
    let startingpoint = this.pos.add(new Vector(70, 70));
    let direction = startingpoint.sub(player.pos).normalize();
    scene.add(new BaddieBullet(startingpoint, direction.negate()));
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    let oName = other.owner.name;
    if (this.isCollidingEnabled && oName == "pBullet") {
      this.hp--;
      this.damageOT++;
      this.damageOTWatchDog = 0;
    }
  }

  onPreUpdate(engine: Engine, delta: number): void {
    console.log(this.getComponents());

    //healthbar update
    this.healthbar.setPercent((this.hp / BOSS_MAX_HP) * 100);

    if (this.isPlayerDead) return;

    //OtherBehavior protocol
    //shield behavior, track damage rate
    if (this.otherComponent instanceof ShieldOtherComponent) {
      if (this.damageOTWatchDog >= this.damageOTWatchDogLimit) {
        this.damageOT = 0;
        this.damageOTWatchDog = 0;
      }

      if (this.damageOT >= this.damageOTShieldTriggerLimit) {
        this.shieldChild.enableShield();
      }

      this.damageOTWatchDog++;
    }

    //healing behavior
    if (this.otherComponent instanceof HealOtherComponent) {
      if (!this.otherComponent.isTriggered && this.hp <= this.maxHp / 2) {
        this.otherComponent.trigger();
      }
    }

    //spawning behavior
    if (this.otherComponent instanceof SpawnOtherComponent) {
      if (this.bossSpawnTik >= this.bossSpawnMinionTik) {
        this.otherComponent.trigger();
      }
      if (!this.otherComponent.isTriggered) this.bossSpawnTik++;
    }

    //OtherBehavior protocol
    //shield behavior, track damage rate
    if (this.otherComponent2 instanceof ShieldOtherComponent) {
      if (this.damageOTWatchDog >= this.damageOTWatchDogLimit) {
        this.damageOT = 0;
        this.damageOTWatchDog = 0;
      }

      if (this.damageOT >= this.damageOTShieldTriggerLimit) {
        this.shieldChild.enableShield();
      }

      this.damageOTWatchDog++;
    }

    //healing behavior
    if (this.otherComponent2 instanceof HealOtherComponent) {
      if (!this.otherComponent2.isTriggered && this.hp <= this.maxHp / 2) {
        this.otherComponent2.trigger();
      }
    }

    //spawning behavior
    if (this.otherComponent2 instanceof SpawnOtherComponent) {
      if (this.bossSpawnTik >= this.bossSpawnMinionTik) {
        this.otherComponent2.trigger();
      }
      if (!this.otherComponent2.isTriggered) this.bossSpawnTik++;
    }

    if (this.hp <= 0) {
      this.hp = 0;
      console.log("boss dead");
      ActorSignals.emit("bossDead");
      this.kill();
    }
  }
}

const shieldGraphic = new Circle({
  radius: 125,
  color: Color.Transparent,
  lineWidth: 2,
  strokeColor: Color.Green,
});

export class BossShield extends Actor {
  isEnabled: boolean = false;

  constructor() {
    super({
      name: "shield",
      pos: new Vector(75, 75),
      radius: 125,
      collisionType: CollisionType.Passive,
      collisionGroup: enemyColliders,
    });
  }

  get enabled() {
    return this.isEnabled;
  }

  enableShield() {
    this.isEnabled = true;
  }

  disableShield() {
    this.isEnabled = false;
  }

  onInitialize(engine: Engine): void {}

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {}

  onPreUpdate(engine: Engine, elapsedMs: number): void {
    if (this.isEnabled) this.graphics.use(shieldGraphic);
    else this.graphics.hide();
  }
}
