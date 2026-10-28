import { Matrix4 } from "../math/Matrix4.js";

export class Object3D {
    constructor() {
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };

        this.parent = null;
        this.children = [];

        this.matrix = Matrix4.identidad();
        this.matrixWorld = Matrix4.identidad();
        this.visible = true;
    }

    add(child) {
        if (child.parent) {
            child.parent.remove(child);
        }
        child.parent = this;
        this.children.push(child);
    }

    remove(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }

    updateMatrix() {
        this.matrix = Matrix4.compose(this.position, this.rotation, this.scale);
    }

    updateMatrixWorld(parentMatrix = null) {
        this.updateMatrix();
        if (parentMatrix) {
            this.matrixWorld = Matrix4.multiplicar(parentMatrix, this.matrix);
        } else {
            this.matrixWorld = this.matrix;
        }

        for (const child of this.children) {
            child.updateMatrixWorld(this.matrixWorld);
        }
    }

    // Extrae la columna de traslación (índices 12, 13, 14) de la matriz mundial
    getWorldPosition() {
        return [
            this.matrixWorld[12],
            this.matrixWorld[13],
            this.matrixWorld[14]
        ];
    }
}