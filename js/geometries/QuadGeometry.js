import { Geometry } from "../core/Geometry.js";

export class QuadGeometry extends Geometry {
    constructor(size = 1.0) {
        super();
        const h = size;

        // 4 vértices en el plano XY: [x, y, z, nx, ny, nz, u, v]
        this.vertices = new Float32Array([
            -h, -h, 0.0,   0.0, 0.0, 1.0,   0.0, 0.0,
             h, -h, 0.0,   0.0, 0.0, 1.0,   1.0, 0.0,
             h,  h, 0.0,   0.0, 0.0, 1.0,   1.0, 1.0,
            -h,  h, 0.0,   0.0, 0.0, 1.0,   0.0, 1.0
        ]);

        // 2 triángulos (6 índices)
        this.indices = new Uint16Array([
            0, 1, 2,
            0, 2, 3
        ]);

        this.indexCount = this.indices.length;
    }
}