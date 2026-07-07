export class Neuron {
  constructor(id, connections = [], sensors = []) {
    this.id = id;
    this.fillColor = this.fillColor;
    this.radius = this.radius;
    this.connections = this.connections;
    this.previousConnections = this.previousConnections;
    this.activeHistory = this.activeHistory;
    this.currentIntensity = this.currentIntensity;
    this.sensors = this.sensors;
    this.lastTriggerTime = this.lastTriggerTime;
    this.lastActivity = this.lastActivity;
    this.initialTriggerTime = this.initialTriggerTime;

    // Assign params
    this.sensors = sensors;
    this.connections = connections;

    // Initialize
    this.init();
  }

  init() {
    this.previousConnections = [];
    this.activeHistory = [];
    this.currentIntensity = 10;
    this.fillColor = "rgb(4, 0, 255)";
    this.radius = 5;
    // Duration in milliseconds peak in percentage
    this.lastActivity = { peak: 0, duration: 0 };
  }

  draw(ctx, bodyPosition, bodyRadius) {
    const connections = this.sensors;
    if (!connections || connections.length === 0) return;

    let totalWeight = 0;
    let avgX = 0;
    let avgY = 0;

    for (let i = 0; i < connections.length; i++) {
      const { strength, sensor } = connections[i];

      const weight = Math.max(strength ?? 1, 0.1);

      avgX += sensor.position.x * weight;
      avgY += sensor.position.y * weight;
      totalWeight += weight;
    }

    avgX /= totalWeight;
    avgY /= totalWeight;

    const dx = avgX - bodyPosition.x;
    const dy = avgY - bodyPosition.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const dirX = dx / dist;
    const dirY = dy / dist;

    // How far outside the main body the neuron should live
    const outsidePadding = 20 * this.sensors.length;

    const neuronX = bodyPosition.x + dirX * (bodyRadius + outsidePadding);
    const neuronY = bodyPosition.y + dirY * (bodyRadius + outsidePadding);

    this.position = {
      x: neuronX,
      y: neuronY,
    };

    // Draw web wires to connected sensors
    for (let i = 0; i < connections.length; i++) {
      const { strength, sensor } = connections[i];

      const sensorX = sensor.position.x;
      const sensorY = sensor.position.y;

      const lineStrength = Math.max(strength ?? 1, 0.1);

      ctx.beginPath();
      ctx.moveTo(neuronX, neuronY);

      const midX = (neuronX + sensorX) / 2;
      const midY = (neuronY + sensorY) / 2;

      const lineDx = sensorX - neuronX;
      const lineDy = sensorY - neuronY;
      const lineDist = Math.sqrt(lineDx * lineDx + lineDy * lineDy) || 1;

      const curveAmount = 8;

      ctx.quadraticCurveTo(
        midX + (-lineDy / lineDist) * curveAmount,
        midY + (lineDx / lineDist) * curveAmount,
        sensorX,
        sensorY,
      );

      ctx.lineWidth = Math.min(3, 0.5 + lineStrength);
      ctx.strokeStyle = "rgba(22, 22, 22, 0.78)";
      ctx.stroke();
      ctx.closePath();
    }

    const red = Math.round(255 * (1 - this.currentIntensity / 10));
    const green = Math.round(255 * (this.currentIntensity / 10));

    this.fillColor = `rgb(${red}, ${green}, 0)`;

    // Draw neuron glow
    ctx.beginPath();
    ctx.arc(neuronX, neuronY, this.radius * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fill();
    ctx.closePath();

    // Draw neuron
    ctx.beginPath();
    ctx.arc(neuronX, neuronY, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.fillColor;
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(neuronX, neuronY, this.radius, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.stroke();
    ctx.closePath();
  }

  startCoolDown() {
    const timePassedInSeconds =
      (new Date().getTime() - this.lastTriggerTime) / 1000;

    // If the intensity of this neuron has gone up to a new peak before the cool down has completed. Update it.
    if (this.lastActivity.peak < this.currentIntensity) {
      this.lastActivity = {
        ...this.lastActivity,
        peak: this.currentIntensity - 10 + this.currentIntensity, // turning value into percentage,
      };
    }

    // Maybe add a multiplier to make cool down dependant on connection strength

    if (this.currentIntensity >= 10) {
      const latestHistory = {
        peak: this.lastActivity.peak,
        duration: new Date().getTime() - this.initialTriggerTime,
      };

      const newHistory = [latestHistory, ...this.activeHistory].splice(0, 3);

      this.activeHistory = newHistory;
      return;
    }

    if (this.currentIntensity < 10) {
      const speed = 0.01;
      this.currentIntensity = Math.min(10, this.currentIntensity + speed);
      setTimeout(() => {
        this.startCoolDown();
      }, 100);
    }
  }
}
