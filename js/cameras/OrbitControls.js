// Archivo: js/cameras/OrbitControls.js
export class OrbitControls {
    constructor(camera, canvas) {
        this.camera = camera;
        this.canvas = canvas;

        this.distancia = 12.5;
        this.azimut = 0.45;
        this.elevacion = 0.35;

        this.distanciaMin = 1.6;
        this.distanciaMax = 32.0;
        this.sensibilidadMouse = 0.007;
        this.sensibilidadZoom = 0.003;

        this.arrastrando = false;
        this.mouseAnteriorX = 0;
        this.mouseAnteriorY = 0;

        this.initEvents();
    }

    limitar(valor, min, max) {
        return Math.max(min, Math.min(max, valor));
    }

    initEvents() {
        this.canvas.addEventListener("mousedown", (e) => {
            this.arrastrando = true;
            this.mouseAnteriorX = e.clientX;
            this.mouseAnteriorY = e.clientY;
            this.canvas.classList.add("arrastrando");
        });

        window.addEventListener("mouseup", () => {
            this.arrastrando = false;
            this.canvas.classList.remove("arrastrando");
        });

        window.addEventListener("mousemove", (e) => {
            if (!this.arrastrando) return;
            const dx = e.clientX - this.mouseAnteriorX;
            const dy = e.clientY - this.mouseAnteriorY;
            this.mouseAnteriorX = e.clientX;
            this.mouseAnteriorY = e.clientY;

            this.azimut -= dx * this.sensibilidadMouse;
            this.elevacion += dy * this.sensibilidadMouse;

            const limiteVertical = Math.PI / 2 - 0.05;
            this.elevacion = this.limitar(this.elevacion, -limiteVertical, limiteVertical);
        });

        this.canvas.addEventListener("wheel", (e) => {
            e.preventDefault();
            this.distancia += e.deltaY * this.sensibilidadZoom;
            this.distancia = this.limitar(this.distancia, this.distanciaMin, this.distanciaMax);
        }, { passive: false });
    }

    reset() {
        this.distancia = 12.5;
        this.azimut = 0.45;
        this.elevacion = 0.35;
    }

    update(targetPosition = [0, 0, 0]) {
        this.camera.target.x = targetPosition[0];
        this.camera.target.y = targetPosition[1];
        this.camera.target.z = targetPosition[2];

        const cosElev = Math.cos(this.elevacion);
        this.camera.position.x = targetPosition[0] + this.distancia * cosElev * Math.sin(this.azimut);
        this.camera.position.y = targetPosition[1] + this.distancia * Math.sin(this.elevacion);
        this.camera.position.z = targetPosition[2] + this.distancia * cosElev * Math.cos(this.azimut);

        this.camera.updateViewMatrix();
    }
}