export class TextureLoader {
    constructor(gl) {
        this.gl = gl;
    }

    load(url, fallbackType = "earth") {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Generamos primero una textura equirectangular procedural rica como respaldo inmediato
        const fallbackCanvas = this.createProceduralPlanetCanvas(fallbackType);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fallbackCanvas);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Si existe la imagen externa en texturas/, la reemplaza asíncronamente
        const image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        };
        image.src = url;

        return texture;
    }

    createColor(r, g, b, a = 255) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
            gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([r, g, b, a])
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        return texture;
    }

    createProceduralPlanetCanvas(type) {
        const c = document.createElement("canvas");
        c.width = 512;
        c.height = 256;
        const ctx = c.getContext("2d");

        if (type === "sun") {
            const grad = ctx.createLinearGradient(0, 0, 0, c.height);
            grad.addColorStop(0, "#ff9900");
            grad.addColorStop(0.5, "#ffdd33");
            grad.addColorStop(1, "#ff6600");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, c.width, c.height);
            for (let i = 0; i < 350; i++) {
                ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,200,0.28)" : "rgba(220,70,0,0.25)";
                ctx.beginPath();
                ctx.arc(Math.random() * c.width, Math.random() * c.height, 4 + Math.random() * 16, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (type === "earth") {
            ctx.fillStyle = "#104e8b";
            ctx.fillRect(0, 0, c.width, c.height);
            // Continentes estilizados
            ctx.fillStyle = "#2e8b57";
            for (let i = 0; i < 45; i++) {
                ctx.beginPath();
                ctx.ellipse(
                    Math.random() * c.width,
                    35 + Math.random() * (c.height - 70),
                    18 + Math.random() * 45,
                    10 + Math.random() * 28,
                    Math.random() * Math.PI, 0, Math.PI * 2
                );
                ctx.fill();
            }
            // Casquetes polares
            ctx.fillStyle = "#f0f8ff";
            ctx.fillRect(0, 0, c.width, 18);
            ctx.fillRect(0, c.height - 18, c.width, 18);
        } else {
            // Luna con cráteres
            ctx.fillStyle = "#9ca3af";
            ctx.fillRect(0, 0, c.width, c.height);
            for (let i = 0; i < 180; i++) {
                ctx.fillStyle = i % 2 === 0 ? "rgba(75,85,99,0.45)" : "rgba(209,213,219,0.35)";
                ctx.beginPath();
                ctx.arc(Math.random() * c.width, Math.random() * c.height, 3 + Math.random() * 14, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        return c;
    }
}