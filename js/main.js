/**
 *  This polyrhythmic (definition below) spiral effect was inspired by the awesome work of @project_jdm on YouTube.
 *  It's created from scratch with plain old js on the canvas.
 *  It's basically a reverse engineered version of the one in his video here (https://youtu.be/4GaGnU8Ij2Y)
 *  I've added a few tweaks to make it more interesting.
 */
const START_TIME = new Date().getTime();
const paper = document.getElementById('paper'),
  pen = paper.getContext('2d');
// paper.fillStyle

const SECONDS_IN_A_MINUTE = 60;
const MINUTES = 60;

const colors = [
  "#D0E7F5",
  "#D9E7F4",
  "#D6E3F4",
  "#BCDFF5",
  "#B7D9F4",
  "#C3D4F0",
  "#9DC1F3",
  "#9AA9F4",
  "#8D83EF",
  "#AE69F0",
  "#D46FF1",
  "#DB5AE7",
  "#D911DA",
  "#D601CB",
  "#E713BF",
  "#F24CAE",
  "#FB79AB",
  "#FFB6C1",
  "#FED2CF",
  "#FDDFD5",
  "#FEDCD1"
];
const COLORS_LENGTH = colors.length;

const DOTS_DURATION = 8;
const DOTS_ALIGNMENT_TIME = DOTS_DURATION * MINUTES;
const MAX_NUMBER_OX_OSCILLATIONS = 50;
const ONE_FULL_DOT_OSCILLATION = 2 * Math.PI;

const SETTINGS = {
  soundEnabled: true,
  instrument: "vibraphone" // "default" | "wave" | "vibraphone"
};

const TOGGLES = {
  sound: document.querySelector("#sound-toggle")
}

console.log({ ts : TOGGLES.sound })

const handleSoundToggle = (enabled = !SETTINGS.soundEnabled) => {
  SETTINGS.soundEnabled = enabled;
  TOGGLES.sound.dataset.toggled = enabled;
}

document.onvisibilitychange = () => handleSoundToggle(false);

paper.onclick = () => handleSoundToggle();

const getFileName = (index) => {
  if (SETTINGS.instrument === "default") return `key-${index}`;

  return `${SETTINGS.instrument}key${index}`;
}

const getUrl = (index) => `../assets/audio/${getFileName(index)}.wav`;

const keys = colors.map((color, index) => {
  const audio = new Audio(getUrl(index));
  const playbackRate = Math.floor(15 / DOTS_DURATION)/* * (index + 1)*/;
  console.log({playbackRate})
  audio.playbackRate =  playbackRate

  audio.volume = 0.15;

  return audio;
});

const playKey = (index) => keys[index].play();

function drawLine (pointA, pointB, color = '#fff', lineWidth = 1) {
  pen.strokeStyle = color;
  pen.lineWidth = lineWidth;
  pen.beginPath();
  pen.moveTo(pointA.x, pointA.y);
  pen.lineTo(pointB.x, pointB.y);
  pen.stroke();
}

function drawArc (x, y, radius, startAngle, endAngle, color = '#fff') {
  pen.strokeStyle = color;
  pen.beginPath();
  pen.arc(x, y, radius, startAngle, endAngle);
  pen.stroke();
}

/**
 *
 * @param x
 * @param y
 * @param radius
 * @param startAngle
 * @param endAngle
 * @param index
 * @param {String} [color]
 */
function drawFilledCircle (x, y, radius, startAngle, endAngle, index, color = '#fff') {
  pen.fillStyle = color;
  pen.beginPath();
  pen.arc(x, y, radius, startAngle, endAngle);
  pen.fill();

}

function calculateVelocity (index) {
  const oneFullDotOscillation = 2 * Math.PI;
  const numberOfDotOscillations = 50 - index;

  return (oneFullDotOscillation * numberOfDotOscillations) / DOTS_ALIGNMENT_TIME;
}


paper.width = paper.clientWidth;
paper.height = paper.clientHeight;

const lineStart = {
  x: 0.05 * paper.width,
  y: 0.9 * paper.height
}

const lineEnd = {
  x: 0.95 * paper.width,
  y: 0.9 * paper.height
}

const lineCenter = {
  x: 0.5 * paper.width,
  y: 0.9 * paper.height
}

const ArcStartAngle = Math.PI;
const ArcEndAngle = 2 * Math.PI;

const dotStart = {
  x: lineCenter.x,
  y: lineCenter.y,
};

const dotStartAngle = 0;
const dotEndAngle = 2 * Math.PI;

const lengthOfLine = lineEnd.x - lineStart.x;
const INITIAL_ARC_RADIUS = lengthOfLine * 0.05;
const spacing = (lengthOfLine / 2 - INITIAL_ARC_RADIUS) / COLORS_LENGTH;

let arcs = [];

/**
 * @param timeElapsed {Number}
 * @param index {Number}
 */
function getAdjustedAngle (timeElapsed, index) {
  const angle = Math.PI + (timeElapsed * calculateVelocity(index));

  const maxAngle = 2 * Math.PI; // the max angle you can place the dot
  const modAngle = angle % maxAngle; // get the remainder of the angle / maxAngle
  return modAngle >= Math.PI ? modAngle : maxAngle - modAngle;
}

/**
 * Draws an arc and a filled arc
 * @param arc {{x: number, y: number, radius: number, startAngle: number, endAngle: number, color: string}}}
 * @param dot {{ radius: number, startAngle: number, endAngle: number, color: string}}}
 * @param index {number}
 * @param timeElapsed {number}
 */
function drawArcAndDot (arc, dot, timeElapsed, index) {
  drawArc(arc.x, arc.y, arc.radius, arc.startAngle, arc.endAngle, arc.color);

  const adjustedAngle = getAdjustedAngle(timeElapsed, index);
  drawFilledCircle(
    lineCenter.x + arc.radius * Math.cos(adjustedAngle),
    lineCenter.y + arc.radius * Math.sin(adjustedAngle),
    dot.radius,
    dotStartAngle,
    dotEndAngle);
}

const calculateNextImpactTime = (currentImpactTime, velocity) => {
  return currentImpactTime + (Math.PI / velocity) * 1000;
}

function init () {
  arcs = colors.map((color, index) => {
    const velocity = calculateVelocity(index);
    return {
      color,
      lastImpactTime: 0,
      nextImpactTime: calculateNextImpactTime(START_TIME, velocity),
      radius: INITIAL_ARC_RADIUS + (index * spacing),
      velocity,
    }
  });
}

function draw () {
  paper.width = paper.clientWidth;
  paper.height = paper.clientHeight;

  const currentTime = new Date().getTime();
  const timeElapsed = (currentTime - START_TIME) / 1000; // in seconds

  // draw line
  drawLine(lineStart, lineEnd, '#fff', 4)

  // we want all the dots to align at the beginning of the line at exactly DOTS_ALIGNMENT_TIME
  // velocity = distance / time
  // distance = velocity * time
  // time = distance / velocity

  const oneFullDotOscillation = 2 * Math.PI;


  arcs.forEach((arc, index) => {

    const { color, lastImpactTime, nextImpactTime, radius, velocity } = arc;

    if(currentTime >= nextImpactTime) {
      if(SETTINGS.soundEnabled) {
        playKey(index);
        arc.lastImpactTime = nextImpactTime;
      }

      arc.nextImpactTime = calculateNextImpactTime(nextImpactTime, velocity);
    }

    drawArcAndDot(
      {
        x: dotStart.x,
        y: dotStart.y,
        radius,
        startAngle: ArcStartAngle,
        endAngle: ArcEndAngle,
        color: color
      },
      {
        radius: lengthOfLine * 0.004,
        startAngle: 0,
        endAngle: 2 * Math.PI,
      },
      timeElapsed + index * 0.1,
      index,
      lineCenter,
    )
  });

  requestAnimationFrame(draw);
}

init();
draw();

