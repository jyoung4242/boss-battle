import { Actor, ActorEvents, Component, Engine, Entity } from "excalibur";
import { UUID } from "../Lib/UUID";

export type moveDirections = "random" | "CCW" | "CW" | "up" | "left" | "fixed" | "right" | "down" | "none";

export interface MoveComponentConfig {
  duration?: number;
  direction?: moveDirections;
  moveRadius?: number;
}

export class MoveComponent extends Component {
  uuid: string = UUID.generateUUID();
  isEnabled: boolean = true;
  constructor(public owner: Actor, public engine: Engine, config: MoveComponentConfig) {
    super();
  }

  set moveEnable(value: boolean) {
    this.isEnabled = value;
  }

  get moveEnable() {
    return this.isEnabled;
  }

  onAdd = (): void => {
    this.owner.on("preupdate", this.onPreUpdate);
  };

  onRemove = (previousOwner: Entity): void => {
    console.log("removing move component", this.uuid);
    previousOwner.off("preupdate", this.onPreUpdate);
  };

  onPreUpdate(event: ActorEvents["preupdate"]): void {}
}

export enum BulletPatterns {
  CIRCLE = "circle",
  SPIRAL = "spiral",
  STREAM = "stream",
  BURST = "burst",
}

export interface AttackComponentConfig {
  numberBullets?: number;
  bulletActors?: Array<string>;
  fireRate?: number;
  delayMS?: number;
  attackAngle?: number;
}

export class AttackComponent extends Component {
  uuid: string = UUID.generateUUID();
  isAttacking: boolean = true;
  constructor(public owner: Actor, public engine: Engine, config: AttackComponentConfig) {
    super();
  }

  onAdd = (): void => {
    this.owner.on("preupdate", this.onPreUpdate);
  };

  onRemove = (previousOwner: Entity): void => {
    console.log("removing attack component", this.uuid);

    previousOwner.off("preupdate", this.onPreUpdate);
  };

  set attackEnable(value: boolean) {
    console.log("changing attack", value);

    this.isAttacking = value;
  }

  get attackEnable() {
    return this.isAttacking;
  }

  onPreUpdate(event: ActorEvents["preupdate"]): void {}
}

export interface OtherComponentConfig {}

export class OtherComponent extends Component {
  uuid: string = UUID.generateUUID();
  isTriggered: boolean = false;
  isEnabled: boolean = false;
  coolOffLimit: number = 1000;
  coolOffTik: number = 0;
  constructor(public owner: Actor, public engine: Engine) {
    super();
  }

  trigger() {
    this.isTriggered = true;
  }

  reset() {
    this.isTriggered = false;
    this.isEnabled = false;
    this.coolOffTik = 0;
  }

  onAdd = (): void => {
    this.owner.on("preupdate", this.onPreUpdate);
  };

  onRemove = (previousOwner: Entity): void => {
    console.log("removing other component", this.uuid);
    previousOwner.off("preupdate", this.onPreUpdate);
  };

  onPreUpdate(event: ActorEvents["preupdate"]): void {}
}

export class MonitorComponent extends Component {
  constructor(public owner: Actor, public engine: Engine) {
    super();
  }

  onAdd = (): void => {
    this.owner.on("preupdate", this.onPreUpdate);
  };

  onRemove = (previousOwner: Entity): void => {
    previousOwner.off("preupdate", this.onPreUpdate);
  };

  onPreUpdate(event: ActorEvents["preupdate"]): void {}
}
