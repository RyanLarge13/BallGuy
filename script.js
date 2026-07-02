import { BallGuy } from "./ballguy.js";

let ballGuy;

const loadSim = () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const winWidth = window.innerWidth;
  const winHeight = window.innerHeight;
  canvas.width = winWidth;
  canvas.height = winHeight;

  ballGuy = new BallGuy({ x: winWidth / 2 - 50, y: winHeight / 2 - 50 }, ctx);

  paint(ctx);
};

const paint = (ctx) => {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ballGuy.draw();
  requestAnimationFrame(() => paint(ctx, ballGuy));
};

const checkPointerInteraction = (e) => {
  const px = e.pageX;
  const py = e.pageY;

  ballGuy.checkSensors({ x: px, y: py });
};

window.addEventListener("load", loadSim);
window.addEventListener("pointermove", checkPointerInteraction);
