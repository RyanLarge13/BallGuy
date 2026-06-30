export class Sensor {
  constructor(type = "pressure") {
    this.intensity = this.intensity;
    this.neurons = this.neurons;
    this.type = this.type;
    this.position = this.position;
    this.fillColor = "#00FF00";
    this.radius = this.radius;

    // Assign params
    this.type = type;

    this.init();
  }

  init() {
    this.neurons = [];
    this.radius = 5;
  }

  draw(ctx, bodyPosition, radius, count, i) {
    const angle = (Math.PI * 2 * i) / count;

    const x = bodyPosition.x + Math.cos(angle) * radius;
    const y = bodyPosition.y + Math.sin(angle) * radius;

    this.position = { x: x, y: y };

    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.fillColor;
    ctx.fill();
    ctx.closePath();
  }
}
