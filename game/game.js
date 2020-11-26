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
    display(0);
}

function display(time) {
    requestAnimationFrame(display);
    g.resize_display(gl);
    stage.draw(gl, time);
}


function build_stage(gl) {
    let scene = new js3d.BranchGroup();
    let rm = room.scene_graph(gl);
    let plr = player.player(gl);
    
    scene.add_object(rm);
    scene.add_object(plr);
    
    let camera = new Float32Array([
	1, 0, 0,
	0, 1, 0,
	0, 0, 1,
	25, 2, 45]);

    let view = js3d.build_view(gl, Math.PI/4, camera);
    
    return new js3d.Stage(scene, view);
}

main();
