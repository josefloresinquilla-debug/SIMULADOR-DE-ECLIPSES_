// Archivo: js/objects/LineLoop.js
import { Object3D } from "../core/Object3D.js";

export class LineLoop extends Object3D {
    constructor(geometry, color = [0.4, 0.6, 0.9], isPoints = false) {
        super();
        this.geometry = geometry;
        this.color = color;
        this.isLine = true;
        this.isPoints = isPoints;
    }
}