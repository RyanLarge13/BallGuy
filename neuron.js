export class Neuron {
  constructor(connections = [], sensors = []) {
    this.connectons = this.connectons;
    this.previousConnections = this.previousConnections;
    this.activeHistory = this.activeHistory;
    this.currentIntensity = this.currentIntensity;
    this.sensors = this.sensors;
    this.coolDownTime = this.coolDownTime;

    // Asssign params
    this.sensors = sensors;
    this.connectons = connections;

    // Initialize
    this.init();
  }

  init() {
    this.previousConnections = [];
    this.activeHistory = [];
    this.currentIntensity = 0;
  }
}
