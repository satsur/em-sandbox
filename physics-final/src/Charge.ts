import { distance, type Vector } from "./Vector"
import { VACUUM_PERMITIVITY } from './values'
import * as Vec from './Vector'

const k = 1 / (4 * Math.PI * VACUUM_PERMITIVITY)

export type Charge = {
    position: Vector,
    magnitude: number // Quantized by elementary charge
}

export function electrostaticForce(c1: Charge, c2: Charge): number {
    return k * (c1.magnitude * c2.magnitude) / Vec.magnitude(distance(c1.position, c2.position))**2
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