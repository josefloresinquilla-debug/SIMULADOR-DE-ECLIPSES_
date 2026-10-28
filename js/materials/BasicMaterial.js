export class BasicMaterial {
    constructor({
        texture = null,
        color = [1.0, 1.0, 1.0],
        emissive = false,
        transparent = false,
        opacity = 1.0,
        isCone = false,
        isMoon = false,
        isHalo = false
    } = {}) {
        this.texture = texture;
        this.color = color;
        this.emissive = emissive;
        this.transparent = transparent;
        this.opacity = opacity;
        this.isCone = isCone;
        this.isMoon = isMoon;
        this.isHalo = isHalo;
    }
}