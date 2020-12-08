import * as g from "./graphics.js";
import * as m from "./mmath.js";
import * as js3d from "./js3d.js";
import * as room from "./room.js";
import * as player from "./player.js";

let gl;
let stage;

function main() {
    gl = g.init_graphics();
    stage = build_stage(gl);
    requestAnimationFrame(display);
}

function display(time) {
    requestAnimationFrame(display);
    stage.draw(gl, time);
}

function build_stage(gl) {
    let scene = new js3d.Group();
    let rm = room.scene_graph(gl);
    let plr = player.player(gl);
    
    scene.add_object(rm);
    scene.add_object(plr);

    let camera_location = new Float32Array([
	1, 0, 0,
	0, 1, 0,
	0, 0, 1,
	25, 4, 65]);
    
    return new js3d.Follower(scene, Math.PI/4, camera_location, plr);
}

main();
