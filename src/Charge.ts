import { distance, type Vector } from "./Vector"
import { ELEMENTARY_CHARGE, METERS_PER_UNIT_ELECTROSTATIC, VACUUM_PERMITIVITY } from './values'
import * as Vec from './Vector'

const k = 1 / (4 * Math.PI * VACUUM_PERMITIVITY)

export type Charge = {
    position: Vector,
    magnitude: number // Quantized by elementary charge
}

export function evaluateCharge(c: Charge): number {
    return c.magnitude * ELEMENTARY_CHARGE
}

export function calculateElectrostaticForce(test: Charge, pointCharge: Charge): number {
    const distance = Vec.magnitude(Vec.distance(test.position, pointCharge.position))
    return k * (evaluateCharge(test) * evaluateCharge(pointCharge)) / (distance * METERS_PER_UNIT_ELECTROSTATIC) ** 2
}

export function forceVectorFromTestCharge(test: Charge, point: Charge, force: number): Vector {
    const dx = test.position.x - point.position.x 
    const dy = test.position.y - point.position.y
    const theta = Math.atan2(dy, dx)
    return {
        x: force * Math.cos(theta),
        y: force * Math.sin(theta)
    }
}
export function formatCharge(q: number): string {
    if (q === -1) {
        return "-"
    } else if (q === 1) {
        return "+"
    } else if (q === 0) {
        return "0"
    }
    return q > 0 ? `+${q}` : `${q}`
}