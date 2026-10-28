// Archivo: js/core/Geometry.js
export class Geometry {
    constructor() {
        this.vertices = null;
        this.indices = null;
        this.vao = null;
        this.vbo = null;
        this.ebo = null;
        this.indexCount = 0;
        this.vertexCount = 0;
        this.initialized = false;
    }
}