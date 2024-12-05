import { Actor, Color, Engine, Font, FontUnit, Label, Vector } from "excalibur";

export class Banner extends Actor {
  bannertext: Label | undefined;
  constructor(public bannerTextstring: string, public duration: number) {
    super({
      width: 800,
      height: 200,
      color: Color.Black,
      x: 0,
      y: 200,
      opacity: 0.0,
      anchor: Vector.Zero,
      z: 999,
    });
  }

  onInitialize(engine: Engine): void {
    let scene = engine.currentScene;

    this.bannertext = new Label({
      text: this.bannerTextstring,
      pos: new Vector(75, 100),
      z: 1000,
      font: new Font({
        family: "impact",
        size: 72,
        unit: FontUnit.Px,
        color: Color.White,
      }),
    });

    this.bannertext.onPreUpdate = () => {
      if (this.bannertext) this.bannertext.graphics.opacity = this.graphics.opacity;
    };

    this.addChild(this.bannertext);
    this.actions.fade(1.0, 1500).delay(this.duration).fade(0.0, 1500).die();
  }
}
