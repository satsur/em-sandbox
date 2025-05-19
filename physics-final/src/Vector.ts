export type Vector = {
    x: number,
    y: number
  }
  
export function magnitude(vec: Vector): number {
    return Math.sqrt(vec.x**2 + vec.y**2)
}

export function normalize(vec: Vector): Vector {
    const mag = magnitude(vec)
    return { x: vec.x / mag, y: vec.y / mag }
}

export function add(v1: Vector, v2: Vector): Vector {
    return { x: v1.x + v2.x, y: v1.y + v2.y }
}

export function addMany(vecs: Vector[]): Vector {
    let v = {x:0, y:0}
    for (const vec of vecs) {
        v = add(v, vec)
    }
    return v
}

export function subtract(v1: Vector, v2: Vector): Vector {
    return { x: v1.x - v2.x, y: v1.y - v2.y }
}

export function scale(vec: Vector, factor: number): Vector {
    return { x: vec.x*factor, y: vec.y*factor }
}

export function divide(vec: Vector, factor: number): Vector {
    return { x: vec.x / factor, y: vec.y / factor }
}

export function dot(v1: Vector, v2: Vector) {
    return { x: v1.x + v2.x, y: v2.x + v2.y }
}

export function rotate(vec: Vector, angleRad: number): Vector {
    return {
        x: vec.x * Math.cos(angleRad) - vec.y * Math.sin(angleRad),
        y: vec.x * Math.sin(angleRad) + vec.y * Math.cos(angleRad),
      };
}

export function distance(v1: Vector, v2: Vector): Vector {
    const xdiff = v2.x - v1.x
    const ydiff = v2.y - v1.y;
    return {
        x: xdiff,
        y: ydiff
    }
}
