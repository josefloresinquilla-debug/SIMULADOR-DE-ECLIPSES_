import { Geometry } from "../core/Geometry.js";

export class ConeGeometry extends Geometry {
    constructor(radioInicio = 0.55, radioFin = 0.1, longitud = 4.5, segmentosRadiales = 48, segmentosLongitudinales = 16) {
        super();
        const vertices = [];
        const indices = [];

        const deltaR = radioInicio - radioFin;
        const hipotenusa = Math.hypot(longitud, deltaR);
        const nxCono = deltaR / hipotenusa;
        const nrCono = longitud / hipotenusa;

        for (let i = 0; i <= segmentosLongitudinales; i++) {
            const v = i / segmentosLongitudinales; // 0 en el inicio, 1 en el extremo final
            const x = v * longitud;
            const rActual = radioInicio + (radioFin - radioInicio) * v;

            for (let j = 0; j <= segmentosRadiales; j++) {
                const u = j / segmentosRadiales;
                const theta = u * Math.PI * 2.0;

                const cosT = Math.cos(theta);
                const sinT = Math.sin(theta);

                const y = rActual * cosT;
                const z = rActual * sinT;

                const ny = nrCono * cosT;
                const nz = nrCono * sinT;

                // Posición (x, y, z)
                vertices.push(x, y, z);
                // Normal unitaria lateral
                vertices.push(nxCono, ny, nz);
                // UV: u = ángulo normalizado, v = distancia normalizada a lo largo del cono
                vertices.push(u, v);
            }
        }

        const cols = segmentosRadiales + 1;
        for (let i = 0; i < segmentosLongitudinales; i++) {
            for (let j = 0; j < segmentosRadiales; j++) {
                const a = i * cols + j;
                const b = a + cols;

                indices.push(a, b, a + 1);
                indices.push(b, b + 1, a + 1);
            }
        }

        this.vertices = new Float32Array(vertices);
        this.indices = new Uint16Array(indices);
        this.indexCount = this.indices.length;
    }
}