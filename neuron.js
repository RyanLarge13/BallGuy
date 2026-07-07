export class Neuron {
  constructor(id, connections = [], sensors = []) {
    this.id = this.id;
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
    this.id = this.id;
    this.previousConnections = [];
    this.activeHistory = [];
    this.currentIntensity = 10;
    // Duration in milliseconds peak in percentage
    this.lastActivity = { peak: 0, duration: 0 };
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
