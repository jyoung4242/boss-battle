import { Actor, Component, Engine, Scene, Vector } from "excalibur";
import { ActorEvents } from "excalibur/build/dist/Actor";
import { ExFSM, ExState } from "./ExFSM";
import { Room } from "../Actors/Room";
import { ActorSignals } from "./CustomEmitterManager";
import { Banner } from "../Actors/Banner";
import { player } from "../Actors/Player";

export class RoomController extends Component {
  fsm: ExFSM;
  isSpawning: boolean = false;
  actorsToSpawn: Actor[] = [];

  constructor(public owner: Actor, public engine: Engine) {
    super();
    this.fsm = new ExFSM(this);
    this.fsm.register(new RoomIdle(this.fsm), new RoomStarting(this.fsm), new RoomActive(this.fsm), new RoomComplete(this.fsm));
    this.fsm.set("idle");
  }

  onAdd(): void {
    this.owner.on("preupdate", this.onPreUpdate.bind(this));
  }

  spawn(actor: Actor[]) {
    this.actorsToSpawn.push(...actor);
    this.isSpawning = true;
  }

  resetRoom() {
    let currentScene = this.engine.currentScene;
    for (let actor of currentScene.actors) {
      let killAbleActor = actor.name == "minion" || actor.name == "boss" || actor.name == "bBullet" || actor.name == "pBullet";
      if (killAbleActor) currentScene.remove(actor);
    }
    if (!currentScene.actors.includes(player)) {
      console.log("adding player back");
      currentScene.add(player);
    }
    player.pos = new Vector(200, 300 - 12.5);
    player.resetPlayer();
    const nb = new Banner("RESETTING ROOM", 1000);
    currentScene.add(nb);
  }

  onPreUpdate(event: ActorEvents["preupdate"]): void {
    if (this.isSpawning) {
      this.isSpawning = false;
      let currentScene = this.engine.currentScene;
      for (let actor of this.actorsToSpawn) {
        currentScene.add(actor);
      }
      this.actorsToSpawn = [];
    }
  }
}

//#region fsm
class RoomIdle extends ExState {
  room: RoomController;

  constructor(public machine: ExFSM) {
    super("idle", machine);
    this.room = machine.owner;
  }

  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    //run room reset code
    this.room.resetRoom();
    ActorSignals.on("startRoom", () => this.machine.set("starting"));
  }
  update(...params: any): void | Promise<void> {}

  exit(_next: ExState | null, ...params: any): void | Promise<void> {
    ActorSignals.off("startRoom");
  }
}

class RoomStarting extends ExState {
  room: RoomController;
  constructor(public machine: ExFSM) {
    super("starting", machine);
    this.room = machine.owner;
  }

  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    ActorSignals.on("resetRoom", () => this.machine.set("idle"));
    this.room.spawn([new Banner("ROOM STARTING", 1500)]);
    setTimeout(() => {
      let newBoss = (this.room.owner as Room).bg.generateBoss();
      this.room.spawn([newBoss]);
      this.machine.set("active");
    }, 5000);
  }

  update(...params: any): void | Promise<void> {}

  exit(_next: ExState | null, ...params: any): void | Promise<void> {
    ActorSignals.off("resetRoom");
  }
}

class RoomActive extends ExState {
  room: RoomController;
  constructor(public machine: ExFSM) {
    super("active", machine);
    this.room = machine.owner;
  }
  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    ActorSignals.on("resetRoom", () => this.machine.set("idle"));
    ActorSignals.on("bossDead", () => {
      console.log("got boss signal");
      this.machine.set("complete", "VICTORY!!!");
    });
    ActorSignals.on("playerDead", () => this.machine.set("complete", "DEFEAT"));
  }

  update(...params: any): void | Promise<void> {}

  exit(_next: ExState | null, ...params: any): void | Promise<void> {
    ActorSignals.off("resetRoom");
    ActorSignals.off("bossDead");
    ActorSignals.off("playerDead");
  }
}

class RoomComplete extends ExState {
  room: RoomController;
  constructor(public machine: ExFSM) {
    super("complete", machine);
    this.room = machine.owner;
  }
  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    console.log("entering room complete");
    let finalText = params[0];

    ActorSignals.on("resetRoom", () => this.machine.set("idle"));
    this.room.spawn([new Banner(finalText.toUpperCase(), 1500)]);
  }

  update(...params: any): void | Promise<void> {}

  exit(_next: ExState | null, ...params: any): void | Promise<void> {
    ActorSignals.off("resetRoom");
  }
}

//#endregion fsm
