import * as js3d from "./js3d.js"

export function player(gl) {
    let cube = new js3d.Cube(gl, new Float32Array([0,0.5,0.5]));
    return new js3d.Movable(cube, new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1, 25, 1, 40]));
}
