export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl2", { antialias: true });

        if (!this.gl) {
            throw new Error("WebGL2 no está disponible en este navegador.");
        }

        const gl = this.gl;
        this.resize();
        gl.clearColor(0.01, 0.015, 0.035, 1.0);
        gl.enable(gl.DEPTH_TEST);

        this.meshProgram = this.createMeshProgram();
        this.meshLoc = this.getMeshLocations();

        this.lineProgram = this.createLineProgram();
        this.lineLoc = this.getLineLocations();

        this.lightPosition = [0, 0, 0];
        this.sunRadius = 1.35;
        this.earthWorldPos = [5.4, 0, 0];
        this.earthRadius = 0.55;
        this.moonWorldPos = [6.85, 0, 0];
        this.moonRadius = 0.20;
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const log = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error("Error compilando shader:\n" + log);
        }
        return shader;
    }

    createProgramFromSources(vsSource, fsSource) {
        const gl = this.gl;
        const vs = this.createShader(gl.VERTEX_SHADER, vsSource);
        const fs = this.createShader(gl.FRAGMENT_SHADER, fsSource);
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error("Error enlazando programa:\n" + gl.getProgramInfoLog(program));
        }
        return program;
    }

    createMeshProgram() {
        const vertexSource = `#version 300 es
        in vec3 aPosition;
        in vec3 aNormal;
        in vec2 aTexCoord;

        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;

        out vec3 vNormal;
        out vec3 vWorldPosition;
        out vec2 vTexCoord;

        void main() {
            vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);
            gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;

            vWorldPosition = worldPosition.xyz;
            vNormal = normalize(mat3(uModelMatrix) * aNormal);
            vTexCoord = aTexCoord;
        }`;

        const fragmentSource = `#version 300 es
        precision highp float;

        in vec3 vNormal;
        in vec3 vWorldPosition;
        in vec2 vTexCoord;

        uniform sampler2D uTexture;
        uniform vec3 uBaseColor;
        uniform float uOpacity;
        uniform bool uEmissive;
        uniform bool uIsCone;
        uniform bool uIsMoon;
        uniform bool uIsHalo;

        uniform vec3 uLightPosition;
        uniform float uSunRadius;
        uniform vec3 uOccluderPosition;
        uniform float uOccluderRadius;

        out vec4 outColor;

        void main() {
            // 1. Halo / Corona Solar con degradado radial suave (Gradient Glow)
            if (uIsHalo) {
                vec2 uv = vTexCoord * 2.0 - 1.0;
                float r = length(uv);
                if (r > 1.0) discard;

                // Degradado multicapa: núcleo brillante + corona exponencial suave
                float outerFade = pow(1.0 - smoothstep(0.0, 1.0, r), 1.8);
                float coronaCore = exp(-r * 3.4);
                float glowIntensity = clamp(outerFade * 0.65 + coronaCore * 0.75, 0.0, 1.0);

                // Transición de color desde blanco-amarillo cálido hasta naranja solar
                vec3 innerColor = vec3(1.0, 0.96, 0.80);
                vec3 outerColor = uBaseColor;
                vec3 haloColor = mix(outerColor, innerColor, coronaCore);

                outColor = vec4(haloColor, glowIntensity * uOpacity);
                return;
            }

            // 2. Conos guía volumétricos translúcidos (Luz, Umbra y Penumbra)
            if (uIsCone) {
                float longitudinalFade = 1.0 - smoothstep(0.0, 1.0, vTexCoord.y);
                float alpha = uOpacity * (0.25 + 0.75 * longitudinalFade);
                outColor = vec4(uBaseColor, alpha);
                return;
            }

            vec3 texColor = texture(uTexture, vTexCoord).rgb * uBaseColor;

            // 3. El Sol actúa como cuerpo emisivo
            if (uEmissive) {
                outColor = vec4(texColor, 1.0);
                return;
            }

            // 4. Iluminación puntual de Lambert en espacio mundial
            vec3 N = normalize(vNormal);
            vec3 toSun = uLightPosition - vWorldPosition;
            float distSun = length(toSun);
            vec3 L = toSun / distSun;

            float difusa = max(dot(N, L), 0.0);
            float ambiente = 0.10;

            // 5. Cálculo analítico de Umbra y Penumbra
            vec3 toOccluder = uOccluderPosition - vWorldPosition;
            float distOcc = length(toOccluder);
            vec3 O = toOccluder / distOcc;

            float shadowFactor = 0.0;

            if (distOcc < distSun && dot(L, O) > 0.0 && difusa > 0.0) {
                float thetaSun = uSunRadius / distSun;
                float thetaOcc = uOccluderRadius / distOcc;
                float angSep = acos(clamp(dot(L, O), -1.0, 1.0));

                float outerLimit = thetaOcc + thetaSun;
                float innerUmbra = max(0.0, thetaOcc - thetaSun * 0.65);

                shadowFactor = 1.0 - smoothstep(innerUmbra, outerLimit, angSep);
            }

            float luzDirecta = difusa * (1.0 - shadowFactor * 0.94);
            vec3 colorFinal = texColor * (ambiente + luzDirecta);

            // 6. Efecto de Luna Roja en la umbra terrestre
            if (uIsMoon && shadowFactor > 0.15) {
                vec3 colorLunaSangre = texColor * vec3(0.75, 0.16, 0.06) * 0.65;
                colorFinal = mix(colorFinal, colorLunaSangre, shadowFactor * difusa);
            }

            outColor = vec4(colorFinal, uOpacity);
        }`;

        return this.createProgramFromSources(vertexSource, fragmentSource);
    }

    createLineProgram() {
        const vertexSource = `#version 300 es
        in vec3 aPosition;
        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;

        void main() {
            gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
            gl_PointSize = 2.0;
        }`;

        const fragmentSource = `#version 300 es
        precision highp float;
        uniform vec3 uColor;
        out vec4 outColor;

        void main() {
            outColor = vec4(uColor, 1.0);
        }`;

        return this.createProgramFromSources(vertexSource, fragmentSource);
    }

    getMeshLocations() {
        const gl = this.gl;
        const p = this.meshProgram;
        return {
            position: gl.getAttribLocation(p, "aPosition"),
            normal: gl.getAttribLocation(p, "aNormal"),
            uv: gl.getAttribLocation(p, "aTexCoord"),
            model: gl.getUniformLocation(p, "uModelMatrix"),
            view: gl.getUniformLocation(p, "uViewMatrix"),
            projection: gl.getUniformLocation(p, "uProjectionMatrix"),
            texture: gl.getUniformLocation(p, "uTexture"),
            baseColor: gl.getUniformLocation(p, "uBaseColor"),
            opacity: gl.getUniformLocation(p, "uOpacity"),
            emissive: gl.getUniformLocation(p, "uEmissive"),
            isCone: gl.getUniformLocation(p, "uIsCone"),
            isMoon: gl.getUniformLocation(p, "uIsMoon"),
            isHalo: gl.getUniformLocation(p, "uIsHalo"),
            lightPos: gl.getUniformLocation(p, "uLightPosition"),
            sunRadius: gl.getUniformLocation(p, "uSunRadius"),
            occluderPos: gl.getUniformLocation(p, "uOccluderPosition"),
            occluderRadius: gl.getUniformLocation(p, "uOccluderRadius")
        };
    }

    getLineLocations() {
        const gl = this.gl;
        const p = this.lineProgram;
        return {
            position: gl.getAttribLocation(p, "aPosition"),
            model: gl.getUniformLocation(p, "uModelMatrix"),
            view: gl.getUniformLocation(p, "uViewMatrix"),
            projection: gl.getUniformLocation(p, "uProjectionMatrix"),
            color: gl.getUniformLocation(p, "uColor")
        };
    }

    initMeshGeometry(geometry) {
        if (geometry.initialized) return;
        const gl = this.gl;
        const loc = this.meshLoc;

        geometry.vao = gl.createVertexArray();
        gl.bindVertexArray(geometry.vao);

        geometry.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);

        geometry.ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

        const stride = 8 * Float32Array.BYTES_PER_ELEMENT;
        gl.enableVertexAttribArray(loc.position);
        gl.vertexAttribPointer(loc.position, 3, gl.FLOAT, false, stride, 0);

        gl.enableVertexAttribArray(loc.normal);
        gl.vertexAttribPointer(loc.normal, 3, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);

        gl.enableVertexAttribArray(loc.uv);
        gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, stride, 6 * Float32Array.BYTES_PER_ELEMENT);

        geometry.initialized = true;
    }

    initLineGeometry(geometry) {
        if (geometry.initialized) return;
        const gl = this.gl;
        const loc = this.lineLoc;

        geometry.vao = gl.createVertexArray();
        gl.bindVertexArray(geometry.vao);

        geometry.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(loc.position);
        gl.vertexAttribPointer(loc.position, 3, gl.FLOAT, false, 0, 0);

        geometry.initialized = true;
    }

    render(scene, camera) {
        const gl = this.gl;
        this.resize();
        camera.aspect = this.canvas.width / this.canvas.height;
        camera.updateProjectionMatrix();

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        scene.updateMatrixWorld();

        const opaqueMeshes = [];
        const transparentMeshes = [];
        const lines = [];

        this.collectObjects(scene, opaqueMeshes, transparentMeshes, lines);

        // 1. Líneas (Órbitas y Estrellas)
        gl.useProgram(this.lineProgram);
        gl.uniformMatrix4fv(this.lineLoc.view, false, camera.viewMatrix);
        gl.uniformMatrix4fv(this.lineLoc.projection, false, camera.projectionMatrix);
        for (const line of lines) {
            this.drawLine(line);
        }

        // 2. Mallas opacas (Sol, Tierra y Luna)
        gl.useProgram(this.meshProgram);
        gl.uniformMatrix4fv(this.meshLoc.view, false, camera.viewMatrix);
        gl.uniformMatrix4fv(this.meshLoc.projection, false, camera.projectionMatrix);
        gl.uniform3fv(this.meshLoc.lightPos, this.lightPosition);
        gl.uniform1f(this.meshLoc.sunRadius, this.sunRadius);
        gl.uniform1i(this.meshLoc.texture, 0);

        for (const mesh of opaqueMeshes) {
            this.drawMesh(mesh);
        }

        // 3. Mallas translúcidas (Halo Solar y Conos Guía)
        if (transparentMeshes.length > 0) {
            gl.enable(gl.BLEND);
            gl.depthMask(false);

            for (const mesh of transparentMeshes) {
                if (mesh.material.isHalo) {
                    // Mezcla aditiva suave para el resplandor lumínico del Sol
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                } else {
                    // Mezcla alfa estándar para los conos de sombra/luz
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                }
                this.drawMesh(mesh);
            }

            gl.depthMask(true);
            gl.disable(gl.BLEND);
        }
    }

    collectObjects(object, opaqueMeshes, transparentMeshes, lines) {
        if (!object.visible) return;

        if (object.isLine && object.geometry) {
            lines.push(object);
        } else if (object.geometry && object.material) {
            if (object.material.transparent) {
                transparentMeshes.push(object);
            } else {
                opaqueMeshes.push(object);
            }
        }

        for (const child of object.children) {
            this.collectObjects(child, opaqueMeshes, transparentMeshes, lines);
        }
    }

    drawLine(line) {
        const gl = this.gl;
        this.initLineGeometry(line.geometry);
        gl.bindVertexArray(line.geometry.vao);
        gl.uniformMatrix4fv(this.lineLoc.model, false, line.matrixWorld);
        gl.uniform3fv(this.lineLoc.color, line.color);

        const mode = line.isPoints ? gl.POINTS : gl.LINE_LOOP;
        gl.drawArrays(mode, 0, line.geometry.vertexCount);
    }

    drawMesh(mesh) {
        const gl = this.gl;
        const geometry = mesh.geometry;
        const material = mesh.material;

        this.initMeshGeometry(geometry);
        gl.bindVertexArray(geometry.vao);

        gl.uniformMatrix4fv(this.meshLoc.model, false, mesh.matrixWorld);
        gl.uniform3fv(this.meshLoc.baseColor, material.color);
        gl.uniform1f(this.meshLoc.opacity, material.opacity);
        gl.uniform1i(this.meshLoc.emissive, material.emissive ? 1 : 0);
        gl.uniform1i(this.meshLoc.isCone, material.isCone ? 1 : 0);
        gl.uniform1i(this.meshLoc.isMoon, material.isMoon ? 1 : 0);
        gl.uniform1i(this.meshLoc.isHalo, material.isHalo ? 1 : 0);

        if (material.isMoon) {
            gl.uniform3fv(this.meshLoc.occluderPos, this.earthWorldPos);
            gl.uniform1f(this.meshLoc.occluderRadius, this.earthRadius);
        } else {
            gl.uniform3fv(this.meshLoc.occluderPos, this.moonWorldPos);
            gl.uniform1f(this.meshLoc.occluderRadius, this.moonRadius);
        }

        if (material.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, material.texture);
        }

        gl.drawElements(gl.TRIANGLES, geometry.indexCount, gl.UNSIGNED_SHORT, 0);
    }
}