export class Matrix4 {
    static identidad() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    static multiplicar(a, b) {
        const r = new Float32Array(16);
        for (let c = 0; c < 4; c++) {
            for (let f = 0; f < 4; f++) {
                let suma = 0;
                for (let k = 0; k < 4; k++) {
                    suma += a[k * 4 + f] * b[c * 4 + k];
                }
                r[c * 4 + f] = suma;
            }
        }
        return r;
    }

    static traslacion(x, y, z) {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ]);
    }

    static escala(x, y, z) {
        return new Float32Array([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ]);
    }

    static rotacionX(a) {
        const c = Math.cos(a);
        const s = Math.sin(a);
        return new Float32Array([
            1,  0, 0, 0,
            0,  c, s, 0,
            0, -s, c, 0,
            0,  0, 0, 1
        ]);
    }

    static rotacionY(a) {
        const c = Math.cos(a);
        const s = Math.sin(a);
        return new Float32Array([
            c, 0, -s, 0,
            0, 1,  0, 0,
            s, 0,  c, 0,
            0, 0,  0, 1
        ]);
    }

    static rotacionZ(a) {
        const c = Math.cos(a);
        const s = Math.sin(a);
        return new Float32Array([
             c, s, 0, 0,
            -s, c, 0, 0,
             0, 0, 1, 0,
             0, 0, 0, 1
        ]);
    }

    static perspectiva(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1.0 / (near - far);
        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * nf, -1,
            0, 0, 2 * far * near * nf, 0
        ]);
    }

    static lookAt(eye, target, up) {
        const restar = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
        const normalizar = (v) => {
            const l = Math.hypot(v[0], v[1], v[2]) || 1;
            return [v[0] / l, v[1] / l, v[2] / l];
        };
        const cruz = (a, b) => [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];

        const z = normalizar(restar(eye, target));
        const x = normalizar(cruz(up, z));
        const y = cruz(z, x);

        return new Float32Array([
            x[0], y[0], z[0], 0,
            x[1], y[1], z[1], 0,
            x[2], y[2], z[2], 0,
            -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]),
            -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]),
            -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]),
            1
        ]);
    }

    static compose(position, rotation, scale) {
        const T = Matrix4.traslacion(position.x, position.y, position.z);
        const Rx = Matrix4.rotacionX(rotation.x);
        const Ry = Matrix4.rotacionY(rotation.y);
        const Rz = Matrix4.rotacionZ(rotation.z);
        const S = Matrix4.escala(scale.x, scale.y, scale.z);

        const R = Matrix4.multiplicar(Rz, Matrix4.multiplicar(Ry, Rx));
        return Matrix4.multiplicar(T, Matrix4.multiplicar(R, S));
    }
}