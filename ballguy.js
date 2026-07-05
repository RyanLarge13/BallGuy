import { Neuron } from "./neuron.js";
import { Sensor } from "./sensor.js";

export class BallGuy {
  constructor(position = { x: 100, y: 100 }, ctx = null) {
    this.position = this.position;
    this.sensors = this.sensors;
    this.neurons = this.neurons;
    this.neuronToSensorConnectionPotentials =
      this.neuronToSensorConnectionPotentials;
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
    this.neuronToSensorConnectionPotentials = [];
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

        const connectionData = {
          id: crypto.randomUUID(),
          neuron: neuronConnection,
          strength: 1,
        };
        const sensorConnectionData = {
          id: crypto.randomUUID(),
          sensor: newSensor,
          strength: 1,
        };

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

  checkConnectionStrength() {
    for (let i = 0; i < this.sensors.length; i++) {
      const sensor = this.sensors[i];

      for (let j = 0; j < sensor.neurons.length; j++) {
        const { id, neuron, strength } = sensor.neurons[j];

        const neuronFiringHistory = neuron.activeHistory;

        if (neuronFiringHistory.length >= 3) {
          const peaks = [];
          const durations = [];

          for (let k = 0; k < neuronFiringHistory.length; k++) {
            peaks.push(neuronFiringHistory[k].peak);
            durations.push(neuronFiringHistory[k].duration);
          }

          const peakAve = peaks.reduce((a, b) => a + b) / peaks.length;

          const peakPercentage = peakAve - 10;
          const durationAverage =
            durations.reduce((a, b) => a + b) / durations.length;

          if (peakAve > strength && strength < 10) {
            sensor.neurons[j].strength +=
              1 * (peakAve / 100) * (durationAverage / 100);
            sensor.neurons[j].neuron.activeHistory = [];
          }

          if (strength >= 10) {
            this.checkPotentials(sensor.neurons[j].neuron, id);
          }

          console.log(strength);
        }
      }
    }
  }

  checkPotentials(neuron, skipId) {
    const newPotential = { skipId: skipId, neuron: neuron, times: 1 };
    const potentialExists = this.neuronToSensorConnectionPotentials.find(
      (p) => p.skipId === skipId,
    );

    if (!potentialExists) {
      this.neuronToSensorConnectionPotentials.push(newPotential);
    } else {
      if (potentialExists.times > 2) {
        this.neuronToSensorConnectionPotentials =
          this.neuronToSensorConnectionPotentials.filter(
            (p) => p.skipId !== skipId,
          );
        let newSensorToConnect = null;

        for (let i = 0; i < this.sensors.length; i++) {
          let hasConnection = false;
          if (this.sensors[i].neurons.length > 0) {
            hasConnection = true;
          }

          if (!hasConnection) {
            newSensorToConnect = this.sensors[i];
            break;
          }
        }

        if (newSensorToConnect !== null) {
          potentialExists.neuron.sensors.push({
            id: crypto.randomUUID(),
            sensor: newSensorToConnect,
            strength: 1,
          });

          newSensorToConnect.neurons.push({
            id: crypto.randomUUID(),
            neuron: potentialExists.neuron,
            strength: 1,
          });
          return;
        }
      }
      potentialExists.times += 1;
    }
  }
}
