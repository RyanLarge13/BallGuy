export class Neuron {
  constructor(connections = [], sensors = []) {
    this.connections = this.connections;
    this.previousConnections = this.previousConnections;
    this.activeHistory = this.activeHistory;
    this.currentIntensity = this.currentIntensity;
    this.sensors = this.sensors;
    this.lastTriggerTime = this.lastTriggerTime;
    this.coolDownInterval = this.coolDownInterval;
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
    // Duration in milliseconds peak in percentage
    this.lastActivity = { peak: 0, duration: 0 };
  }

  startCoolDown() {
    clearInterval(this.coolDownInterval);
    const timePassedInSeconds =
      (new Date().getTime() - this.lastTriggerTime) / 1000;

    // Decrease or increase both timePassedInSeconds and currentIntensity for faster cool down times
    if (timePassedInSeconds < 2) {
      // If the intensity of this neuron has gone up to a new peak before the cool down has completed. Update it.
      if (this.lastActivity.peak < this.currentIntensity) {
        this.lastActivity = {
          ...this.lastActivity,
          peak: this.currentIntensity - 10 + this.currentIntensity, // turning value into percentage,
        };
      }

      // Add a multiplier to decrease the amount of time for cool down
      this.currentIntensity = timePassedInSeconds * 5;

      this.coolDownInterval = setInterval(() => {
        this.startCoolDown();
        // Increase or decrease to change animation timing
      }, 100);
      return;
    }

    this.activeHistory = {
      peak: this.lastActivity.peak,
      duration: new Date().getTime() - this.initialTriggerTime,
    };
  }
}
