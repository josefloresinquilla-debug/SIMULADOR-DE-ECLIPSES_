// Archivo: js/geometries/OrbitGeometry.js
import { Geometry } from "../core/Geometry.js";

export class OrbitGeometry extends Geometry {
    constructor(radio = 1.0, segmentos = 128) {
        super();
        const puntos = [];
        for (let i = 0; i < segmentos; i++) {
            const angulo = (i / segmentos) * Math.PI * 2.0;
            puntos.push(
                radio * Math.cos(angulo),
                0.0,
                radio * Math.sin(angulo)
            );
        }
        this.vertices = new Float32Array(puntos);
        this.vertexCount = segmentos;
    }
}