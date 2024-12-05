import { Component, EngineEvents, EventEmitter } from "excalibur";
import { Actor, ActorEvents } from "excalibur/build/dist/Actor";
import { direction } from "../main";

export interface CustomActorEventBus extends ActorEvents {
  rightStickUpLeft: {};
  rightStickDownRight: {};
  rightStickUpRight: {};
  rightStickDownLeft: {};
  rightStickLeft: {};
  rightStickRight: {};
  rightStickUp: {};
  rightStickDown: {};

  leftStickUpLeft: {};
  leftStickDownRight: {};
  leftStickUpRight: {};
  leftStickDownLeft: {};
  leftStickLeft: {};
  leftStickRight: {};
  leftStickUp: {};
  leftStickDown: {};

  startRoom: {};
  resetRoom: {};
  bossDead: {};
  playerDead: {};

  bossSP1Triggered: {};
  bossSP2Triggered: {};
  componentAdded: { actor: Actor; compponent: Component };
  componentRemoved: { actor: Actor; compponent: Component };
}

export interface CustomeEngineEventBus extends EngineEvents {
  spawnMinion: { side: direction };
}

export const ActorSignals = new EventEmitter<CustomActorEventBus>();

export const EngineSignals = new EventEmitter<CustomeEngineEventBus>();

// publisher
/*
ActorSignals.emit("myEvent", { health: 0 }); // works, and event name shows in intellisense
EngineSignals.emit("testEvent", { keypress: 0 });
*/
// subscriber
/*
ActorSignals.on("myEvent", data => {
  console.log("myEvent", data);
});

EngineSignals.on("testEvent", data => {
  console.log("testEvent", data);
});
*/
