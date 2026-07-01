export class Neuron {
  constructor(connections = [], sensors = []) {
    this.connections = this.connections;
    this.previousConnections = this.previousConnections;
    this.activeHistory = this.activeHistory;
    this.currentIntensity = this.currentIntensity;
    this.sensors = this.sensors;
    this.coolDownTime = this.coolDownTime;

    // Assign params
    this.sensors = sensors;
    this.connections = connections;

    // Initialize
    this.init();
  }

  init() {
    this.previousConnections = [];
    this.activeHistory = [];
    this.currentIntensity = 0;
  }
}
