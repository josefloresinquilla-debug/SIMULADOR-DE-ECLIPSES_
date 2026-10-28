import { Renderer } from "./core/Renderer.js";
import { Scene } from "./core/Scene.js";
import { Object3D } from "./core/Object3D.js";
import { SphereGeometry } from "./geometries/SphereGeometry.js";
import { ConeGeometry } from "./geometries/ConeGeometry.js";
import { OrbitGeometry } from "./geometries/OrbitGeometry.js";
import { StarfieldGeometry } from "./geometries/StarfieldGeometry.js";
import { QuadGeometry } from "./geometries/QuadGeometry.js";
import { BasicMaterial } from "./materials/BasicMaterial.js";
import { Mesh } from "./objects/Mesh.js";
import { LineLoop } from "./objects/LineLoop.js";
import { PerspectiveCamera } from "./cameras/PerspectiveCamera.js";
import { OrbitControls } from "./cameras/OrbitControls.js";
import { TextureLoader } from "./utils/TextureLoader.js";

// ============================================================
// 1. INICIALIZAR RENDERER, ESCENA Y CÁMARA
// ============================================================
const canvas = document.getElementById("glCanvas");
const renderer = new Renderer(canvas);
const scene = new Scene();

const camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 160.0);
const controls = new OrbitControls(camera, canvas);

const textureLoader = new TextureLoader(renderer.gl);
const whiteTex = textureLoader.createColor(255, 255, 255);

// ============================================================
// 2. RECURSOS COMPARTIDOS Y DIMENSIONES BASE
// ============================================================
const sphereGeo = new SphereGeometry(1.0, 36, 54);

const texSun = textureLoader.load("texturas/sol.jpg", "sun");
const texEarth = textureLoader.load("texturas/tierra.jpg", "earth");
const texMoon = textureLoader.load("texturas/luna.jpg", "moon");

const SUN_RADIUS = 1.35;
const BASE_EARTH_DIST = 5.4;
const EARTH_RADIUS = 0.55;
const BASE_MOON_DIST = 1.45;
const MOON_RADIUS = 0.20;

renderer.sunRadius = SUN_RADIUS;
renderer.earthRadius = EARTH_RADIUS;
renderer.moonRadius = MOON_RADIUS;

// ============================================================
// 3. FONDO DE ESTRELLAS Y ÓRBITA TERRESTRE
// ============================================================
const stars = new LineLoop(new StarfieldGeometry(850, 35, 75), [0.75, 0.82, 0.95], true);
scene.add(stars);

const earthOrbitLine = new LineLoop(new OrbitGeometry(BASE_EARTH_DIST, 180), [0.22, 0.42, 0.72]);
scene.add(earthOrbitLine);

// ============================================================
// 4. SOL + HALO DE ILUMINACIÓN SOLAR (GRADIENT GLOW)
// ============================================================
const sun = new Mesh(
    sphereGeo,
    new BasicMaterial({ texture: texSun, emissive: true })
);
sun.scale = { x: SUN_RADIUS, y: SUN_RADIUS, z: SUN_RADIUS };
scene.add(sun);

// Billboard Cuadrilátero con degradado radial suave alrededor del Sol
const sunHalo = new Mesh(
    new QuadGeometry(SUN_RADIUS * 2.65),
    new BasicMaterial({
        texture: whiteTex,
        color: [1.0, 0.58, 0.12],
        transparent: true,
        opacity: 0.92,
        isHalo: true
    })
);
scene.add(sunHalo);

// ============================================================
// 5. SISTEMA TIERRA Y CONO GUÍA DE RADIACIÓN SOLAR
// ============================================================
const earthSystem = new Object3D();
scene.add(earthSystem);

const solarBeamCone = new Mesh(
    new ConeGeometry(SUN_RADIUS * 0.92, EARTH_RADIUS * 1.35, BASE_EARTH_DIST, 48, 12),
    new BasicMaterial({
        texture: whiteTex,
        color: [1.0, 0.82, 0.28],
        transparent: true,
        opacity: 0.15,
        isCone: true
    })
);
earthSystem.add(solarBeamCone);

const earthCenterNode = new Object3D();
earthCenterNode.position.x = BASE_EARTH_DIST;
earthSystem.add(earthCenterNode);

const earth = new Mesh(
    sphereGeo,
    new BasicMaterial({ texture: texEarth })
);
earth.scale = { x: EARTH_RADIUS, y: EARTH_RADIUS, z: EARTH_RADIUS };
earthCenterNode.add(earth);

const earthShadowGroup = new Object3D();
earthCenterNode.add(earthShadowGroup);

const earthUmbraCone = new Mesh(
    new ConeGeometry(EARTH_RADIUS, 0.06, 3.2, 48, 12),
    new BasicMaterial({
        texture: whiteTex,
        color: [0.55, 0.12, 0.12],
        transparent: true,
        opacity: 0.42,
        isCone: true
    })
);
earthShadowGroup.add(earthUmbraCone);

const earthPenumbraCone = new Mesh(
    new ConeGeometry(EARTH_RADIUS, 0.95, 3.2, 48, 12),
    new BasicMaterial({
        texture: whiteTex,
        color: [0.45, 0.55, 0.72],
        transparent: true,
        opacity: 0.18,
        isCone: true
    })
);
earthShadowGroup.add(earthPenumbraCone);

// ============================================================
// 6. SISTEMA LUNA (PLANO INCLINADO + ÓRBITA + CONOS LUNARES)
// ============================================================
const moonInclinationNode = new Object3D();
earthCenterNode.add(moonInclinationNode);

const moonOrbitLine = new LineLoop(new OrbitGeometry(BASE_MOON_DIST, 120), [0.65, 0.70, 0.82]);
moonInclinationNode.add(moonOrbitLine);

const moonOrbitPivot = new Object3D();
moonInclinationNode.add(moonOrbitPivot);

const moonCenterNode = new Object3D();
moonCenterNode.position.x = BASE_MOON_DIST;
moonOrbitPivot.add(moonCenterNode);

const moon = new Mesh(
    sphereGeo,
    new BasicMaterial({ texture: texMoon, isMoon: true })
);
moon.scale = { x: MOON_RADIUS, y: MOON_RADIUS, z: MOON_RADIUS };
moonCenterNode.add(moon);

const moonShadowWorldNode = new Object3D();
scene.add(moonShadowWorldNode);

const moonUmbraCone = new Mesh(
    new ConeGeometry(MOON_RADIUS, 0.02, 1.65, 36, 10),
    new BasicMaterial({
        texture: whiteTex,
        color: [0.15, 0.15, 0.22],
        transparent: true,
        opacity: 0.52,
        isCone: true
    })
);
moonShadowWorldNode.add(moonUmbraCone);

const moonPenumbraCone = new Mesh(
    new ConeGeometry(MOON_RADIUS, 0.48, 1.85, 36, 10),
    new BasicMaterial({
        texture: whiteTex,
        color: [0.45, 0.55, 0.72],
        transparent: true,
        opacity: 0.20,
        isCone: true
    })
);
moonShadowWorldNode.add(moonPenumbraCone);

// ============================================================
// 7. ESTADO DE LA APLICACIÓN Y CONTROLES DE LA INTERFAZ (UI)
// ============================================================
const state = {
    playing: true,
    speed: 1.0,
    distanceScale: 1.0,
    earthOrbitAngle: 0.0,
    moonOrbitAngle: Math.PI * 0.25,
    moonInclinationDeg: 5.1,
    cameraFocus: "sun", // "sun" | "earth" | "moon" | "povSun"
    showShadowCones: true,
    showLightGuide: true
};

const ui = {
    status: document.getElementById("eclipseStatus"),
    btnPlayPause: document.getElementById("btnPlayPause"),
    sliderDistScale: document.getElementById("sliderDistScale"),
    valDistScale: document.getElementById("valDistScale"),
    sliderSpeed: document.getElementById("sliderSpeed"),
    valSpeed: document.getElementById("valSpeed"),
    sliderMoonAngle: document.getElementById("sliderMoonAngle"),
    valMoonAngle: document.getElementById("valMoonAngle"),
    sliderInclination: document.getElementById("sliderInclination"),
    valInclination: document.getElementById("valInclination"),
    cameraHint: document.getElementById("cameraHint"),
    phaseCanvas: document.getElementById("moonPhaseCanvas"),
    phaseName: document.getElementById("phaseName"),
    phaseIllum: document.getElementById("phaseIllum"),
    phaseElong: document.getElementById("phaseElong"),
    phaseTilt: document.getElementById("phaseTilt")
};

const phaseCtx = ui.phaseCanvas.getContext("2d");

// Escalado de distancia en tiempo real
function aplicarEscaladoDistancia(scale) {
    state.distanceScale = scale;
    ui.valDistScale.textContent = scale.toFixed(2) + "x";

    // Actualizar posiciones orbitales locales
    earthCenterNode.position.x = BASE_EARTH_DIST * scale;
    moonCenterNode.position.x = BASE_MOON_DIST * scale;

    // Escalar anillos de órbita reutilizando su mismo VAO en GPU
    earthOrbitLine.scale = { x: scale, y: 1.0, z: scale };
    moonOrbitLine.scale = { x: scale, y: 1.0, z: scale };

    // Ajustar longitud de los conos guía proporcionalmente
    solarBeamCone.scale.x = scale;
    earthShadowGroup.scale.x = scale;
    moonShadowWorldNode.scale.x = scale;
}

ui.sliderDistScale.addEventListener("input", (e) => {
    aplicarEscaladoDistancia(parseFloat(e.target.value));
});

ui.btnPlayPause.addEventListener("click", () => {
    state.playing = !state.playing;
    ui.btnPlayPause.textContent = state.playing ? "⏸️ Pausar" : "▶️ Reanudar";
});

document.getElementById("btnResetCam").addEventListener("click", () => {
    camera.fov = 55;
    controls.reset();
    if (state.cameraFocus === "povSun") {
        controls.distancia = 9.0; // FOV intermedio en modo POV
    }
});

ui.sliderSpeed.addEventListener("input", (e) => {
    state.speed = parseFloat(e.target.value);
    ui.valSpeed.textContent = state.speed.toFixed(2) + "x";
});

ui.sliderMoonAngle.addEventListener("input", (e) => {
    const deg = parseFloat(e.target.value);
    state.moonOrbitAngle = (deg * Math.PI) / 180.0;
    ui.valMoonAngle.textContent = deg.toFixed(1) + "°";
});

function setInclination(deg) {
    state.moonInclinationDeg = deg;
    ui.sliderInclination.value = deg;
    ui.valInclination.textContent = deg.toFixed(1) + "°";
}

ui.sliderInclination.addEventListener("input", (e) => {
    setInclination(parseFloat(e.target.value));
});

document.getElementById("inc0").addEventListener("click", () => setInclination(0.0));
document.getElementById("inc5").addEventListener("click", () => setInclination(5.1));
document.getElementById("inc15").addEventListener("click", () => setInclination(15.0));

// Selector de cámaras (incluye la nueva cámara POV Terrestre -> Sol)
const camButtons = {
    sun: document.getElementById("camSun"),
    earth: document.getElementById("camEarth"),
    moon: document.getElementById("camMoon"),
    povSun: document.getElementById("camPovSun")
};

function setCameraFocus(targetName, customDist = null) {
    state.cameraFocus = targetName;
    Object.keys(camButtons).forEach((k) => {
        camButtons[k].classList.toggle("active", k === targetName);
    });

    const isPov = targetName === "povSun";
    // En POV desde el centro de la Tierra, ocultamos la malla terrestre para no bloquear la lente
    earth.visible = !isPov;
    earthShadowGroup.visible = !isPov && state.showShadowCones;
    solarBeamCone.visible = !isPov && state.showLightGuide;

    if (isPov) {
        controls.distancia = customDist !== null ? customDist : 8.5;
        ui.cameraHint.textContent = "🔭 Vista desde el centro de la Tierra hacia el Sol | Rueda: Zoom de Lente (FOV)";
    } else {
        camera.fov = 55;
        ui.cameraHint.textContent = "🖱️ Arrastrar: Orbitar | Rueda: Zoom";
        if (customDist !== null) {
            controls.distancia = customDist;
        } else if (targetName === "sun") {
            controls.distancia = 12.5;
        } else if (targetName === "earth") {
            controls.distancia = 3.8;
        } else if (targetName === "moon") {
            controls.distancia = 1.9;
        }
    }
}

camButtons.sun.addEventListener("click", () => setCameraFocus("sun"));
camButtons.earth.addEventListener("click", () => setCameraFocus("earth"));
camButtons.moon.addEventListener("click", () => setCameraFocus("moon"));
camButtons.povSun.addEventListener("click", () => setCameraFocus("povSun"));

// Botones de escenarios rápidos de eclipse
document.getElementById("btnSolarEclipse").addEventListener("click", () => {
    state.playing = false;
    ui.btnPlayPause.textContent = "▶️ Reanudar";
    setInclination(0.0);
    state.moonOrbitAngle = Math.PI; // 180°: Luna entre el Sol y la Tierra
    ui.sliderMoonAngle.value = 180;
    ui.valMoonAngle.textContent = "180.0°";
    setCameraFocus("povSun", 7.5); // Abre directamente la vista frontal del eclipse solar
});

document.getElementById("btnLunarEclipse").addEventListener("click", () => {
    state.playing = false;
    ui.btnPlayPause.textContent = "▶️ Reanudar";
    setInclination(0.0);
    state.moonOrbitAngle = 0.0; // 0°: Luna detrás de la Tierra
    ui.sliderMoonAngle.value = 0;
    ui.valMoonAngle.textContent = "0.0°";
    setCameraFocus("earth", 3.6);
});

document.getElementById("btnNoEclipse").addEventListener("click", () => {
    state.playing = false;
    ui.btnPlayPause.textContent = "▶️ Reanudar";
    setInclination(12.0);
    state.moonOrbitAngle = 0.0;
    ui.sliderMoonAngle.value = 0;
    ui.valMoonAngle.textContent = "0.0°";
    setCameraFocus("earth", 3.8);
});

// Checkboxes de capas
document.getElementById("chkSunHalo").addEventListener("change", (e) => {
    sunHalo.visible = e.target.checked;
});

document.getElementById("chkShadowCones").addEventListener("change", (e) => {
    state.showShadowCones = e.target.checked;
    earthShadowGroup.visible = state.cameraFocus !== "povSun" && state.showShadowCones;
    moonShadowWorldNode.visible = state.showShadowCones;
});

document.getElementById("chkLightGuide").addEventListener("change", (e) => {
    state.showLightGuide = e.target.checked;
    solarBeamCone.visible = state.cameraFocus !== "povSun" && state.showLightGuide;
});

document.getElementById("chkOrbits").addEventListener("change", (e) => {
    earthOrbitLine.visible = e.target.checked;
    moonOrbitLine.visible = e.target.checked;
});

document.getElementById("chkStars").addEventListener("change", (e) => {
    stars.visible = e.target.checked;
});

// ============================================================
// 8. PANEL DINÁMICO DE FASES LUNARES Y DETECTOR DE ECLIPSE
// ============================================================
function actualizarPanelFaseLunar(earthPos, moonPos) {
    // Vector Tierra -> Sol (el Sol está en [0,0,0])
    const esX = -earthPos[0], esY = -earthPos[1], esZ = -earthPos[2];
    const lenES = Math.hypot(esX, esY, esZ) || 1;
    const uES = [esX / lenES, esY / lenES, esZ / lenES];

    // Vector Tierra -> Luna
    const emX = moonPos[0] - earthPos[0];
    const emY = moonPos[1] - earthPos[1];
    const emZ = moonPos[2] - earthPos[2];
    const lenEM = Math.hypot(emX, emY, emZ) || 1;
    const uEM = [emX / lenEM, emY / lenEM, emZ / lenEM];

    // Coseno de elongación entre el Sol y la Luna vistos desde la Tierra
    const cosElong = Math.max(-1.0, Math.min(1.0,
        uES[0] * uEM[0] + uES[1] * uEM[1] + uES[2] * uEM[2]
    ));

    // Fracción iluminada vista desde la Tierra:
    // Cuando la Luna está hacia el Sol (cosElong = 1) vemos su cara oscura (0% iluminada)
    // Cuando la Luna está opuesta al Sol (cosElong = -1) vemos su cara llena (100% iluminada)
    const illumFraction = (1.0 - cosElong) * 0.5;
    const elongDeg = (Math.acos(cosElong) * 180.0) / Math.PI;

    // Sentido creciente/menguante mediante componente Y del producto cruz (uES x uEM)
    const crossY = uES[2] * uEM[0] - uES[0] * uEM[2];
    const isWaxing = crossY >= 0;

    // Desvío vertical respecto a la eclíptica visto desde la Tierra
    const verticalTiltDeg = (Math.asin(Math.max(-1, Math.min(1, uEM[1]))) * 180.0) / Math.PI;

    // Distancia perpendicular al eje Sol-Tierra para detectar eclipse
    const perpDist = Math.sqrt(Math.max(0.0, 1.0 - cosElong * cosElong)) * lenEM;
    const isSolarEclipse = cosElong > 0.96 && perpDist < EARTH_RADIUS * 0.95;
    const isLunarEclipse = cosElong < -0.96 && perpDist < EARTH_RADIUS * 0.95;

    // Determinar nombre de la fase y estado de eclipse
    let phaseLabel = "";
    ui.status.className = "eclipse-badge";

    if (isSolarEclipse) {
        phaseLabel = "Luna Nueva (Eclipse Solar)";
        ui.status.classList.add("solar");
        ui.status.textContent = "☀️ ECLIPSE SOLAR (Luna frente al Sol)";
    } else if (isLunarEclipse) {
        phaseLabel = "Luna Llena (Luna de Sangre)";
        ui.status.classList.add("lunar");
        ui.status.textContent = "🌕 ECLIPSE LUNAR (Luna en Umbra)";
    } else {
        ui.status.textContent = "Órbita Normal (Sin Eclipse Activo)";
        if (illumFraction < 0.04) phaseLabel = "Luna Nueva";
        else if (illumFraction > 0.96) phaseLabel = "Luna Llena";
        else if (Math.abs(illumFraction - 0.5) < 0.06) {
            phaseLabel = isWaxing ? "Cuarto Creciente" : "Cuarto Menguante";
        } else if (illumFraction < 0.5) {
            phaseLabel = isWaxing ? "Luna Creciente" : "Luna Menguante";
        } else {
            phaseLabel = isWaxing ? "Gibosa Creciente" : "Gibosa Menguante";
        }
    }

    ui.phaseName.textContent = phaseLabel;
    ui.phaseIllum.textContent = Math.round(illumFraction * 100) + "%";
    ui.phaseElong.textContent = elongDeg.toFixed(1) + "°";
    ui.phaseTilt.textContent = (verticalTiltDeg >= 0 ? "+" : "") + verticalTiltDeg.toFixed(1) + "°";

    // Dibujar en el Canvas 2D del HUD la fase lunar vista desde la Tierra
    const w = ui.phaseCanvas.width;
    const h = ui.phaseCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = 42;

    phaseCtx.clearRect(0, 0, w, h);

    // Si hay eclipse solar, dibujamos el resplandor de la corona solar detrás de la Luna Nueva
    if (isSolarEclipse) {
        const coronaGrad = phaseCtx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r * 1.35);
        coronaGrad.addColorStop(0, "rgba(255, 230, 140, 0.95)");
        coronaGrad.addColorStop(0.5, "rgba(255, 140, 20, 0.55)");
        coronaGrad.addColorStop(1, "rgba(255, 100, 0, 0.0)");
        phaseCtx.fillStyle = coronaGrad;
        phaseCtx.beginPath();
        phaseCtx.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
        phaseCtx.fill();
    }

    // Base oscura del disco lunar
    phaseCtx.fillStyle = "#161e2e";
    phaseCtx.beginPath();
    phaseCtx.arc(cx, cy, r, 0, Math.PI * 2);
    phaseCtx.fill();

    // Color de la parte iluminada (rojo cobrizo si está en eclipse lunar, gris perla en órbita normal)
    const litColor = isLunarEclipse ? "#c23b22" : "#e2e8f0";
    phaseCtx.fillStyle = litColor;

    // Dibujo geométrico del terminador esférico
    const k = -cosElong; // k en [-1 (Nueva) .. +1 (Llena)]
    phaseCtx.beginPath();
    if (isWaxing) {
        // Mitad derecha iluminada
        phaseCtx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
        phaseCtx.ellipse(cx, cy, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, k < 0);
    } else {
        // Mitad izquierda iluminada
        phaseCtx.arc(cx, cy, r, Math.PI / 2, -Math.PI / 2, false);
        phaseCtx.ellipse(cx, cy, Math.abs(k) * r, r, 0, -Math.PI / 2, Math.PI / 2, k < 0);
    }
    phaseCtx.closePath();
    phaseCtx.fill();

    // Contorno sutil del disco lunar
    phaseCtx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    phaseCtx.lineWidth = 1.5;
    phaseCtx.beginPath();
    phaseCtx.arc(cx, cy, r, 0, Math.PI * 2);
    phaseCtx.stroke();
}

// ============================================================
// 9. RENDER LOOP
// ============================================================
let previousTime = 0;

function animate(ms) {
    const t = ms * 0.001;
    let dt = t - previousTime;
    previousTime = t;
    if (dt > 0.1) dt = 0.0;

    if (state.playing) {
        const effDt = dt * state.speed;
        sun.rotation.y += 0.12 * effDt;
        earth.rotation.y += 1.20 * effDt;
        state.earthOrbitAngle += 0.15 * effDt;
        state.moonOrbitAngle = (state.moonOrbitAngle + 0.95 * effDt) % (Math.PI * 2);

        const deg = ((state.moonOrbitAngle * 180) / Math.PI + 360) % 360;
        ui.sliderMoonAngle.value = deg;
        ui.valMoonAngle.textContent = deg.toFixed(1) + "°";
    }

    // 1. Aplicar estados al grafo de escena
    earthSystem.rotation.y = state.earthOrbitAngle;
    moonInclinationNode.rotation.z = (state.moonInclinationDeg * Math.PI) / 180.0;
    moonOrbitPivot.rotation.y = state.moonOrbitAngle;
    moon.rotation.y = Math.PI; // Rotación sincrónica hacia la Tierra

    // 2. Propagar matrices mundiales
    scene.updateMatrixWorld();
    const earthWorld = earthCenterNode.getWorldPosition();
    const moonWorld = moonCenterNode.getWorldPosition();

    renderer.earthWorldPos = earthWorld;
    renderer.moonWorldPos = moonWorld;

    // 3. Orientar el cono de sombra lunar en dirección opuesta al Sol
    moonShadowWorldNode.position = { x: moonWorld[0], y: moonWorld[1], z: moonWorld[2] };
    const distMoonSun = Math.hypot(moonWorld[0], moonWorld[1], moonWorld[2]) || 1;
    moonShadowWorldNode.rotation.y = -Math.atan2(moonWorld[2], moonWorld[0]);
    moonShadowWorldNode.rotation.z = Math.asin(moonWorld[1] / distMoonSun);

    // 4. Actualizar la cámara según el modo seleccionado
    if (state.cameraFocus === "povSun") {
        // Cámara fija en el centro de la Tierra mirando directamente al centro del Sol [0,0,0]
        camera.position.x = earthWorld[0];
        camera.position.y = earthWorld[1];
        camera.position.z = earthWorld[2];
        camera.target.x = 0.0;
        camera.target.y = 0.0;
        camera.target.z = 0.0;
        // La rueda del ratón controla el zoom óptico (FOV) entre 14° y 65°
        camera.fov = Math.max(14, Math.min(65, controls.distancia * 4.2));
        camera.updateViewMatrix();
    } else if (state.cameraFocus === "earth") {
        controls.update(earthWorld);
    } else if (state.cameraFocus === "moon") {
        controls.update(moonWorld);
    } else {
        controls.update([0, 0, 0]);
    }

    // 5. Orientar el Billboard del Halo Solar siempre de frente a la cámara activa
    const camDx = camera.position.x;
    const camDy = camera.position.y;
    const camDz = camera.position.z;
    const camHoriz = Math.hypot(camDx, camDz) || 1;
    sunHalo.rotation.y = Math.atan2(camDx, camDz);
    sunHalo.rotation.x = -Math.atan2(camDy, camHoriz);

    // 6. Actualizar el HUD dinámico de Fases Lunares y renderizar escena WebGL2
    actualizarPanelFaseLunar(earthWorld, moonWorld);
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);