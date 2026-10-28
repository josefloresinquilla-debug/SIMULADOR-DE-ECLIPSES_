// Archivo: js/geometries/StarfieldGeometry.js
import { Geometry } from "../core/Geometry.js";

export class StarfieldGeometry extends Geometry {
    constructor(cantidad = 700, radioMin = 28, radioMax = 55) {
        super();
        const puntos = [];
        for (let i = 0; i < cantidad; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = radioMin + Math.random() * (radioMax - radioMin);

            puntos.push(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.cos(phi),
                r * Math.sin(phi) * Math.sin(theta)
            );
        }
        this.vertices = new Float32Array(puntos);
        this.vertexCount = cantidad;
    }
}