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
    this.drawNeurons();
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

  drawNeurons() {
    for (let i = 0; i < this.neurons.length; i++) {
      this.neurons[i].draw(this.ctx, this.position, this.radius);
    }
  }

  initializeNeurons() {
    const neurons = [];

    for (let i = 0; i < 2; i++) {
      const neuronId = crypto.randomUUID();
      const newNeuron = new Neuron(neuronId, [], []);
      neurons.push(newNeuron);
    }

    return neurons;
  }

  initializeSensors() {
    const sensors = [];

    for (let i = 0; i < 10; i++) {
      const sensorId = crypto.randomUUID();
      const newSensor = new Sensor(sensorId);

      if (i === 2 || i === 6) {
        // Connect the only two neurons to first sensors initially
        const neuronConnection = this.neurons[i === 2 ? 0 : 1];

        const connectionData = {
          neuron: neuronConnection,
          strength: 1,
        };
        const sensorConnectionData = {
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

      const dx = pos.x - sensor.position.x;
      const dy = pos.y - sensor.position.y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      // how far the sensor can "feel" the mouse
      const range = sensor.radius * 4;

      // 0 = strongest, 10 = weakest
      const intensity = Math.max(0, Math.min((distance / range) * 10, 10));

      const gettingCloser =
        sensor.previousDistance === undefined
          ? false
          : distance < sensor.previousDistance;

      const inRange = intensity < 10;
      const touching = distance <= sensor.radius;
      const standingStill =
        sensor.previousDistance !== undefined &&
        Math.abs(distance - sensor.previousDistance) < 0.5;

      sensor.intensity = intensity;

      if (
        touching ||
        (inRange && gettingCloser) ||
        (inRange && standingStill)
      ) {
        sensor.triggerNeurons();
      }
      if (inRange && !gettingCloser && !standingStill && !touching) {
        sensor.coolDownNeurons();
      }

      sensor.previousIntensity = intensity;
      sensor.previousDistance = distance;

      const red = Math.round(255 * (1 - intensity / 10));
      const green = Math.round(255 * (intensity / 10));

      sensor.fillColor = `rgb(${red}, ${green}, 0)`;
    }
  }

  checkConnectionStrength() {
    for (let i = 0; i < this.sensors.length; i++) {
      const sensor = this.sensors[i];

      for (let j = 0; j < sensor.neurons.length; j++) {
        const { neuron, strength } = sensor.neurons[j];

        const neuronFiringHistory = neuron.activeHistory;

        if (neuronFiringHistory.length >= 3) {
          const { peakAve, durationAve } =
            this.getPeakAndDurationAverages(neuronFiringHistory);

          if (peakAve > strength && strength < 10) {
            // Also find the neuron to sensor connection for strength update
            const sensorConnection = neuron.sensors.find(
              (s) => s.sensor.id === this.sensors[i].id,
            );

            if (!sensorConnection) {
              throw new Error(
                "Sensor connection should also exist for strength update",
              );
            }

            const newStrength = Math.min(
              10,
              sensor.neurons[j].strength +
                1 * (peakAve / 100) * (durationAve / 1000),
            );

            sensorConnection.strength = newStrength;
            sensor.neurons[j].strength = newStrength;
            sensor.neurons[j].neuron.activeHistory = [];
          }

          if (strength >= 10) {
            this.checkPotentials(sensor.neurons[j].neuron);
          }
        }
      }
    }
  }

  getPeakAndDurationAverages(neuronFiringHistory) {
    const peaks = [];
    const durations = [];

    // Loop for average calculations
    for (let i = 0; i < neuronFiringHistory.length; i++) {
      peaks.push(neuronFiringHistory[i].peak);
      durations.push(neuronFiringHistory[i].duration);
    }

    console.log(peaks);
    const peakAve = peaks.reduce((a, b) => a + b) / peaks.length;
    const durationAve = durations.reduce((a, b) => a + b) / durations.length;

    return { peakAve, durationAve };
  }

  checkPotentials(neuron) {
    // Change to decrease the amount of times a new connection is created.
    // Multiplier is used to cool down the number of connections made when many sensors are connected to a neuron
    // causing excess potentials
    const necessaryPotentialTimes = 3 * neuron.sensors.length;

    // If not every sensor connected to neuron has a full strength connection
    // then cancel the potential
    if (!neuron.sensors.every((s) => s.strength >= 10)) {
      return;
    }

    const newPotential = { neuron: neuron, times: 1 };
    const potentialExists = this.neuronToSensorConnectionPotentials.find(
      (p) => p.neuron.id === neuron.id,
    );

    if (!potentialExists) {
      this.neuronToSensorConnectionPotentials.push(newPotential);
      return;
    }

    if (potentialExists.times >= necessaryPotentialTimes) {
      // Remove potential as it will be used and needs deletion
      this.neuronToSensorConnectionPotentials =
        this.neuronToSensorConnectionPotentials.filter(
          (p) => p.neuron.id !== neuron.id,
        );

      let newSensorToConnect = null;

      for (let i = 0; i < this.sensors.length; i++) {
        const hasConnection = this.sensors[i].neurons.some(
          (n) => n.neuron.id === neuron.id,
        );

        if (!hasConnection) {
          newSensorToConnect = this.sensors[i];
          break;
        }
      }

      if (newSensorToConnect !== null) {
        neuron.sensors.push({
          sensor: newSensorToConnect,
          strength: 1,
        });

        newSensorToConnect.neurons.push({
          neuron: neuron,
          strength: 1,
        });
        return;
      }
    }

    // Potential times is too low to create a new connection still
    potentialExists.times += 1;
  }
}
