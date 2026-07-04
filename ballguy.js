import { Neuron } from "./neuron.js";
import { Sensor } from "./sensor.js";

export class BallGuy {
  constructor(position = { x: 100, y: 100 }, ctx = null) {
    this.position = this.position;
    this.sensors = this.sensors;
    this.neurons = this.neurons;
    this.radius = this.radius;
    this.ctx = this.ctx;

    // Assign params
    this.position = position;
    this.radius = 50;
    this.ctx = ctx;

    // Initialize
    this.init();
  }

  init() {
    this.neurons = this.initializeNeurons();
    this.sensors = this.initializeSensors();
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(
      this.position.x,
      this.position.y,
      this.radius,
      Math.PI * 2,
      false,
    );
    this.ctx.fillStyle = "#c40dbb";
    this.ctx.fill();
    this.ctx.closePath();

    this.drawSensors();
  }

  drawSensors() {
    for (let i = 0; i < this.sensors.length; i++) {
      this.sensors[i].draw(
        this.ctx,
        this.position,
        this.radius,
        this.sensors.length,
        i,
      );
    }
  }

  initializeNeurons() {
    const neurons = [];

    for (let i = 0; i < 2; i++) {
      const newNeuron = new Neuron([], []);
      neurons.push(newNeuron);
    }

    return neurons;
  }

  initializeSensors() {
    const sensors = [];

    for (let i = 0; i < 10; i++) {
      const newSensor = new Sensor();
      if (i === 2 || i === 6) {
        // Connect the only two neurons to first sensors initially
        const neuronConnection = this.neurons[i === 2 ? 0 : 1];

        const connectionData = { neuron: neuronConnection, strength: 1 };
        const sensorConnectionData = { sensor: newSensor, strength: 1 };

        neuronConnection.sensors.push(sensorConnectionData);
        newSensor.neurons.push(connectionData);
      }
      sensors.push(newSensor);
    }

    return sensors;
  }

  // Collisions
  checkSensors(pos) {
    for (let i = 0; i < this.sensors.length; i++) {
      const sensor = this.sensors[i];
      const sensorPos = sensor.position;
      const radius = sensor.radius;

      const withinX = Math.abs(sensorPos.x - pos.x);
      const withinY = Math.abs(sensorPos.y - pos.y);

      const intensity = Math.min((withinX + withinY) / 10, 10);

      sensor.intensity = intensity;

      if (intensity < 10 && sensor.previousIntensity > intensity) {
        sensor.triggerNeurons();
      } else {
        sensor.coolDownNeurons();
      }

      // if (sensor.previousIntensity < intensity) {
      // }

      sensor.previousIntensity = intensity;

      const red = Math.round(255 * (1 - intensity / 10));
      const green = Math.round(255 * (intensity / 10));

      sensor.fillColor = `rgb(${red}, ${green}, 0)`;
    }
  }
}
