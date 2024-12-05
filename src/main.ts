// main.ts
import "./style.css";

import { UI } from "@peasy-lib/peasy-ui";
import { Engine, DisplayMode, CollisionGroup } from "excalibur";
import { model, template } from "./UI/UI";
import { Room } from "./Actors/Room";
import { player } from "./Actors/Player";
import { GamepadControl } from "./Lib/Gamepad";
import { Boss } from "./Actors/Boss";
import { Banner } from "./Actors/Banner";

export type direction = "right" | "left" | "up" | "down" | "leftUp" | "leftDown" | "rightUp" | "rightDown" | "none";

await UI.create(document.body, model, template).attached;

const game = new Engine({
  width: 800, // the width of the canvas
  height: 600, // the height of the canvas
  canvasElementId: "cnv", // the DOM canvas element ID, if you are providing your own
  displayMode: DisplayMode.Fixed, // the display mode
  pixelArt: true,
});

/* Setup game collider groups */
export const enemyColliders = new CollisionGroup("enemyColliders", 0b0010, 0b1101);
export const enemyBulletColliders = new CollisionGroup("enemyBullets", 0b10000, 0b00101);
export const wallColliders = new CollisionGroup("wallColliders", 0b0100, 0b11011);
export const playerBulletColliders = new CollisionGroup("playerBulletColliders", 0b1000, 0b0110);

let gamePadManager = new GamepadControl(game);

await game.start();

const myRoom = new Room(game);
game.add(myRoom);

game.currentScene.camera.strategy.lockToActor(myRoom);
game.currentScene.onPreUpdate = (engine: Engine, delta: number) => {
  gamePadManager.update(engine, delta);
};

/*
TODO:

[x] create room
[x] create spawn points
[x] create player
[x] create boss
[x] create enemy minion
[x] create room controller (wave manager)
[x] boss generator
[x] add gamepad control
[x] add projectiles (bullets) for both player and boss
[x] do collisions for player/wall, player/minion, player/boss, bullets/boss, bullets/minion, enemy bullets/player
[x] add behavioral trees to boss
[ ] create different behaviors
[x] add starting button and reset button
[x] add victory condition check
[x] add defeat condition check
[ ] to make testing suck less, add sound effects (some)
*/

/*
- Orbit
- Burst of bullets
*/
