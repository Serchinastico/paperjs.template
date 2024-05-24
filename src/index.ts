import * as paper from "paper";

type Range = { min: number, max: number }

const randomFloat = ({ min, max }: { min: number; max: number }) =>
  Math.random() * (max - min) + min;

const randomInt = ({ min, max }: { min: number; max: number }) =>
  Math.round(randomFloat({ min, max }));

const randomPoint = ({ x, y }: {x: Range, y: Range}) =>
  new paper.Point(randomFloat({ min: x.min, max: x.max }), randomFloat({ min: y.min, max: y.max }));

document.addEventListener("DOMContentLoaded", () => {
  paper.setup("canvas");

  paper.view.onFrame = function() {

  };
});
