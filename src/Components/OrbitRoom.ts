import { Actor, ActorEvents, Vector, Engine, ActionCompleteEvent, CurveTo, Entity, Subscription } from "excalibur";
import { MoveComponent, MoveComponentConfig } from "./BossComponents";
import { Boss } from "../Actors/Boss";

export class OrbitRoom extends MoveComponent {
  direction: "CW" | "CCW" = "CW";
  radius: number = 225;
  centerPoint: Vector = new Vector(400, 300);
  points: Array<{ start: Vector; control1: Vector; control2: Vector; end: Vector }> = calculateCubicBezierCircleInvertedY(this.radius);
  mode: number = 1;
  nextPosition: Vector = Vector.Zero;
  rotationDuration: number = 2000;
  handler: Subscription | undefined;

  constructor(public owner: Boss, public engine: Engine, config: MoveComponentConfig) {
    super(owner, engine, config);

    if (config.direction != "CCW" && config.direction != "CW") config.direction = "CW";
    else this.direction = config.direction;

    if (config.moveRadius) this.radius = config.moveRadius;
    if (config.duration) this.rotationDuration = config.duration;
    this.points = calculateCubicBezierCircleInvertedY(this.radius);
  }

  moveToNextRotation() {
    if (!(this.owner as Boss)) {
      console.log("no boss, orbit room: ", this.uuid);
      return;
    }

    let cp1, cp2;
    const adjustedCenterpoint = new Vector(this.centerPoint.x - this.owner.width / 2, this.centerPoint.y - this.owner.height / 2);

    let i = this.mode - 1;
    cp1 = this.points[i].control1.add(adjustedCenterpoint);
    cp2 = this.points[i].control2.add(adjustedCenterpoint);
    if (this.direction == "CCW") this.nextPosition = this.points[i].end.add(adjustedCenterpoint);
    else this.nextPosition = this.points[i].start.add(adjustedCenterpoint);

    if (this.direction == "CCW") this.mode++;
    else this.mode--;

    if (this.mode > 4) this.mode = 1;
    else if (this.mode < 1) this.mode = 4;

    let myControlPoints = [Vector.Zero, Vector.Zero, Vector.Zero];
    if (this.direction == "CCW") myControlPoints = [cp1, cp2, this.nextPosition];
    else myControlPoints = [cp2, cp1, this.nextPosition];

    this.owner.actions.curveTo({
      //@ts-ignore
      controlPoints: myControlPoints,
      durationMs: this.rotationDuration,
      quality: 16,
      mode: "uniform",
    });
  }

  onAdd(): void {
    this.owner.on("preupdate", this.onPreUpdate.bind(this));

    this.handler = this.owner.on("actioncomplete", (event: ActionCompleteEvent) => {
      if (event.action instanceof CurveTo) this.moveToNextRotation();
    });

    this.moveToNextRotation();
  }

  onRemove(previousOwner: Entity): void {
    super.onRemove(previousOwner);
    if (this.handler) this.handler.close();
  }

  changeDirection(direction: "CW" | "CCW") {
    this.direction = direction;
  }

  cancelMove() {
    this.owner.actions.clearActions();
  }

  reset(modePosition: number = 1, config?: MoveComponentConfig) {
    if (config) {
      if (config.direction != "CCW" && config.direction != "CW") config.direction = "CW";
      else this.direction = config.direction;
      if (config.moveRadius) this.radius = config.moveRadius;
      if (config.duration) this.rotationDuration = config.duration;
      this.points = calculateCubicBezierCircleInvertedY(this.radius);
    }
    this.mode = modePosition;
    this.moveToNextRotation();
  }

  onPreUpdate(event: ActorEvents["preupdate"]): void {}
}

function calculateCubicBezierCircleInvertedY(
  radius: number
): Array<{ start: Vector; control1: Vector; control2: Vector; end: Vector }> {
  const d = (radius * 4 * (Math.sqrt(2) - 1)) / 3; // Distance for control points
  const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]; // Quadrants in radians

  const arcs = angles.map((startAngle, index) => {
    const endAngle = startAngle + Math.PI / 2;

    // Start and end points of the arc
    const start: Vector = new Vector(radius * Math.cos(startAngle), -radius * Math.sin(startAngle));
    const end: Vector = new Vector(radius * Math.cos(endAngle), -radius * Math.sin(endAngle));

    // Tangent directions (inverted Y for tangents too)
    const tangentStart: Vector = new Vector(-Math.sin(startAngle), -Math.cos(startAngle));
    const tangentEnd: Vector = new Vector(-Math.sin(endAngle), -Math.cos(endAngle));

    // Control points
    const control1: Vector = new Vector(start.x + d * tangentStart.x, start.y + d * tangentStart.y);
    const control2: Vector = new Vector(end.x - d * tangentEnd.x, end.y - d * tangentEnd.y);

    return { start, control1, control2, end };
  });

  return arcs;
}
