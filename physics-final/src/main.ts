import type { Vector } from './Vector'
import * as Vec from './Vector'
import type { Charge } from './Charge'
import { calculateElectrostaticForce, forceVectorFromTestCharge, formatCharge } from './Charge'
import { CHARGE_COLORS, CHARGE_DEFAULT_FONT_SIZE, CHARGE_FONT, CHARGE_LINE_STYLE, CHARGE_LINE_WIDTH, CHARGE_RADIUS, CHARGE_TEXT_COLOR, GRID_LINE_STYLE, GRID_LINE_WIDTH, MAX_CHARGES, SCALE } from './values'
import './style.css'
let charges: Charge[]

function setup() {
  charges = []
}

function drawVector(ctx: CanvasRenderingContext2D, start: Vector, vec: Vector) {
  const endX = start.x + vec.x*SCALE
  const endY = start.y + vec.y*SCALE

  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(endX, endY)
  ctx.strokeStyle = "white"
  ctx.lineWidth = 2
  ctx.stroke()

  const angle = Math.PI / 6; // ~20 degrees
  const headLength = 10; // pixels

  const end = {
    x: start.x + vec.x * SCALE,
    y: start.y + vec.y * SCALE
  };

  const left = Vec.rotate(Vec.normalize(vec), Math.PI - angle);
  const right = Vec.rotate(Vec.normalize(vec), Math.PI + angle);

  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(end.x + left.x * headLength, end.y + left.y * headLength);
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(end.x + right.x * headLength, end.y + right.y * headLength);
  ctx.stroke();
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = GRID_LINE_STYLE
  ctx.lineWidth = GRID_LINE_WIDTH

  for (let x = 0; x < ctx.canvas.width; x += SCALE) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  for (let y = 0; y < ctx.canvas.height; y += SCALE) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

function drawCharges(ctx: CanvasRenderingContext2D) {
  charges.forEach(charge => {
    const chargePosition = gridToCanvas(charge.position.x, charge.position.y)
    
    ctx.fillStyle = charge.magnitude == 0 ? CHARGE_COLORS.none : charge.magnitude > 0 ? CHARGE_COLORS.positive : CHARGE_COLORS.negative
    ctx.beginPath()
    ctx.arc(chargePosition.x, chargePosition.y, CHARGE_RADIUS * SCALE, 0, 2*Math.PI)
    ctx.fill()

    ctx.strokeStyle = CHARGE_LINE_STYLE
    ctx.lineWidth = CHARGE_LINE_WIDTH
    ctx.stroke()

    const text = formatCharge(charge.magnitude)
    let fontSize = CHARGE_DEFAULT_FONT_SIZE
    ctx.font = `${fontSize}px ${CHARGE_FONT}`
    while (ctx.measureText(text).width > CHARGE_RADIUS*SCALE) {
      fontSize -= 1
      ctx.font = `${fontSize}px sans-serif`;
    }
    ctx.fillStyle = CHARGE_TEXT_COLOR
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(formatCharge(charge.magnitude), chargePosition.x, chargePosition.y)

  })
}

function drawForceVectors(ctx: CanvasRenderingContext2D) {
  for (let x = 0; x < ctx.canvas.width; x += SCALE) {
    for (let y = 0; y < ctx.canvas.height; y += SCALE) {
      let tooClose: boolean = false
      const gridPos: Vector = canvasToGrid(x, y)
      const testCharge: Charge = {position: gridPos, magnitude: 1} // Charge placement MUST use grid position
      const forceVectors: Vector[] = []
      for (const charge of charges) {
        // Avoid drawing electrostatic force vectors right next to the point charge because it
        // creates the illusion of attraction by positive charges and repulsion by negative charges
        // Bit of a non-elegant work around, but it works for now
        if (Vec.magnitude(Vec.distance(gridPos, charge.position)) <= 2) {
          tooClose = true
          break;
        }
        forceVectors.push(forceVectorFromTestCharge(testCharge, charge, calculateElectrostaticForce(testCharge, charge)))
      }
      if (!tooClose) {
        drawVector(ctx, {x, y}, Vec.addMany(forceVectors));
      }
    }
  }
}

function handleClick(ctx: CanvasRenderingContext2D, button: number, x: number, y: number) {
  if (!isWithinCanvas(ctx, x, y)) return
  const gridMouseCoordinates = viewportToGrid(ctx, x, y)

  if (button == 0) {
    if (charges.length == MAX_CHARGES) {
      alert("You have reached the limit on charges!")
      return
    }
    if (findHoveredCharge(gridMouseCoordinates.x, gridMouseCoordinates.y) == undefined) {
      charges.push(
        {
          position: viewportToGrid(ctx, x, y),
          magnitude: -1
        }
      )
    }
    
  } else if (button == 2) {
    const charge = findHoveredCharge(gridMouseCoordinates.x, gridMouseCoordinates.y)
    if (charge != undefined) {
      const index = charges.indexOf(charge)
      charges.splice(index, 1) // Remove charge by value
    } 
  }
}

function findHoveredCharge(x: number, y: number): Charge | undefined {
  for (const charge of charges) {
    const dx = x - charge.position.x
    const dy = y - charge.position.y
    if ((dx**2 + dy**2) <= CHARGE_RADIUS**2) {
      return charge
    }
  }
  return undefined
}

function isWithinCanvas(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const position = viewportToCanvas(ctx, x, y)
  return (position.x > 0 && position.x < ctx.canvas.width) && (position.y > 0 && position.y < ctx.canvas.height)
}

// -------------------- Viewport -> Canvas -> Grid --------------------

function viewportToGrid(ctx: CanvasRenderingContext2D, x: number, y: number): Vector {
  const canvasCoordinates = viewportToCanvas(ctx, x, y)
  return canvasToGrid(canvasCoordinates.x, canvasCoordinates.y)
}

function gridToViewport(ctx: CanvasRenderingContext2D, x: number, y: number): Vector {
  const canvasCoordinates = gridToCanvas(x, y)
  return canvasToViewport(ctx, canvasCoordinates.x, canvasCoordinates.y)
}

function viewportToCanvas(ctx: CanvasRenderingContext2D, x: number, y: number): Vector {
  return {
    x: (x - ctx.canvas.getBoundingClientRect().left),
    y: (y - ctx.canvas.getBoundingClientRect().top)
  }
}

function canvasToGrid(x: number, y: number) {
  return {
    x: x / SCALE,
    y: y / SCALE
  }
}

function gridToCanvas(x: number, y: number) {
  return {
    x: x * SCALE,
    y: y * SCALE
  }
}

function canvasToViewport(ctx: CanvasRenderingContext2D, x: number, y: number) {
  return {
    x: x + ctx.canvas.getBoundingClientRect().left,
    y: y + ctx.canvas.getBoundingClientRect().right
  }
}

function draw() {
  const canvas = document.getElementById('fieldCanvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!
  canvas.addEventListener('contextmenu', e => e.preventDefault())
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.  width, canvas.height);
  drawGrid(ctx, ctx.canvas.width, ctx.canvas.height,)
  drawForceVectors(ctx)
  drawCharges(ctx)
  document.onmousedown = event => {
    handleClick(ctx, event.button, event.x, event.y)
  }
}

function animate() {
  draw();
  requestAnimationFrame(animate);
}

window.onload = () => {
  setup()
  animate()
}
