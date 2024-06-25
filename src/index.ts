import * as paper from "paper";
import { formatHex, interpolate } from "culori";
import { SimplexNoise } from "ts-perlin-simplex";

type Range = { min: number; max: number };
type Point = { x: number; y: number };

type Wave = {
  path: paper.Path;
  points: Point[];
};

const randomFloat = ({ min, max }: { min: number; max: number }) =>
  Math.random() * (max - min) + min;

const randomInt = ({ min, max }: { min: number; max: number }) =>
  Math.round(randomFloat({ min, max }));

const randomPoint = ({ x, y }: { x: Range; y: Range }) =>
  new paper.Point(
    randomFloat({ min: x.min, max: x.max }),
    randomFloat({ min: y.min, max: y.max }),
  );

const NUM_PATHS = 250;
const WAVE_AMPLITUDE = 40;
const NUM_WAVES = 15;
const NOISE_FACTOR = 20;
const NOISE_SCALE = 100;
const MIN_STROKE = 0.1;
const STROKE_FACTOR = 4;

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  paper.setup("canvas");

  const capturer = new CCapture({ format: "png", framerate: 60 });

  const width = window.innerWidth;
  const height = window.innerHeight;

  const simplex = new SimplexNoise();
  const xSimplex = new SimplexNoise();
  const waves: Wave[] = [];
  let frame = 0;

  let colors = interpolate(["#F46", "#46F"]);
  let fillColors = interpolate(["#124", "#000"]);

  for (let iPath = 0; iPath < NUM_PATHS; iPath += 1) {
    const pathStep = iPath / (NUM_PATHS - 1);
    const yPathDelta =
      (4 * WAVE_AMPLITUDE + height) * pathStep - 2 * WAVE_AMPLITUDE;

    const path = new paper.Path();
    path.fillColor = new paper.Color(formatHex(fillColors(pathStep)));
    path.strokeColor = new paper.Color(formatHex(colors(pathStep)));
    path.strokeWidth = MIN_STROKE + STROKE_FACTOR * Math.sin(pathStep);
    path.add(new paper.Point(0, yPathDelta + WAVE_AMPLITUDE));

    const points: Point[] = [];
    for (let i = 1; i < NUM_WAVES; i += 1) {
      const step = i / (NUM_WAVES - 1);

      const x =
        -500 +
        (width + 500) * step +
        0.5 * yPathDelta +
        200 * xSimplex.noise(pathStep / NOISE_SCALE, step / NOISE_SCALE);

      const yDelta = i % 2 === 1 ? -WAVE_AMPLITUDE : WAVE_AMPLITUDE;
      const yNoise =
        NOISE_FACTOR *
        simplex.noise3d(x / NOISE_SCALE, yPathDelta / NOISE_SCALE, frame);

      const point = new paper.Point(x, yPathDelta + yDelta + yNoise);

      path.add(point);
      points.push(point);
    }

    path.smooth({ type: "geometric", factor: 0.15 });

    path.add(new paper.Point(2000, 2000));
    path.add(new paper.Point(-2000, 2000));
    path.closePath();

    waves.push({ path, points });
  }

  capturer.start();
  paper.view.onFrame = function () {
    waves.forEach((wave) => {
      wave.points.forEach((point, pointIndex) => {
        const segmentPoint = wave.path.segments[pointIndex].point;
        wave.path.segments[pointIndex].point.y =
          point.y +
          // 0.01 * yDiff +
          20 *
            simplex.noise3d(
              point.x / NOISE_SCALE,
              point.y / NOISE_SCALE,
              frame / NOISE_SCALE,
            );
      });
    });

    capturer.capture(canvas);

    if (frame === 360) {
      capturer.stop();
      capturer.save();
    }

    frame += 1;
  };
});
