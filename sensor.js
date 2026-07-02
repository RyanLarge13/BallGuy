export class Sensor {
  constructor(type = "pressure") {
    this.previousIntensity = this.PreviousIntensity;
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
    this.previousIntensity = 100;
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

    // Drawing neurons
    this.drawNeurons(ctx, angle, x, y);
  }

  drawNeurons(ctx, angle, x, y) {
    const childCount = this.neurons.length;
    const spread = Math.PI / 3;
    const minDistance = 30;
    const distanceStep = 18;

    for (let i = 0; i < childCount; i++) {
      const t = childCount === 1 ? 0.5 : i / (childCount - 1);

      // Angle centered around the parent ball's outward direction
      const childAngle = angle - spread / 2 + spread * t;

      const distance = minDistance + i * distanceStep;

      const childX = x + Math.cos(childAngle) * distance;
      const childY = y + Math.sin(childAngle) * distance;

      const neuron = this.neurons[i].neuron;

      const red = Math.round(255 * (1 - neuron.currentIntensity / 10));
      const green = Math.round(255 * (neuron.currentIntensity / 10));

      const neuronFillColor = `rgb(${red}, ${green}, 0)`;

      // thin wire
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(childX, childY);
      ctx.strokeStyle = "rgba(15, 37, 235, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // child ball
      ctx.beginPath();
      ctx.arc(childX, childY, 4, 0, Math.PI * 2);
      ctx.fillStyle = neuronFillColor;
      ctx.fill();
    }
  }

  triggerNeurons() {
    for (let i = 0; i < this.neurons.length; i++) {
      const neuron = this.neurons[i].neuron;

      // Set an initial neuron trigger time
      if (neuron.currentIntensity >= 10) {
        neuron.initialTriggerTime = new Date().getTime();
      }

      // Slowly build neuron activation logrithmically based on sensor intensity
      const speed = 0.01 + Math.log2(this.intensity + 1) * 0.05;
      neuron.currentIntensity -= speed;
      neuron.lastTriggerTime = new Date().getTime();
    }
  }

  coolDownNeurons() {
    for (let i = 0; i < this.neurons.length; i++) {
      const neuron = this.neurons[i].neuron;
      neuron.startCoolDown();
    }
  }
}
