// build a room to play in

import * as js3d from "./js3d.js";
import * as floor from "./floor.js";
import * as m from "./mmath.js";

export function scene_graph(gl) {
    let room = new js3d.Group();

    // floor
    room.add_object(new floor.floor(gl));

    // north wall
    room.add_object(new js3d.Quad_Color(
	gl,
	new Float32Array([0, 0, 0]),
	new Float32Array([50, 0, 0]),
	new Float32Array([50, 3, 0]),
	new Float32Array([0, 3, 0]),
	new Float32Array([0.98, 0.98, 0.82]))) // light goldenrod yellow

    // east wall
    room.add_object(new js3d.Quad_Color(
	gl,
	new Float32Array([50, 0, 0]),
	new Float32Array([50, 0, 50]),
	new Float32Array([50, 3, 50]),
	new Float32Array([50, 3, 0]),
	new Float32Array([1, 0.87, 0.68]))); // navajo white

    // south wall
    room.add_object(new js3d.Quad_Color(
	gl,
	new Float32Array([50, 0, 50]),
	new Float32Array([0, 0, 50]),
	new Float32Array([0, 3, 50]),
	new Float32Array([50, 3, 50]),
	new Float32Array([0.87, 0.72, 0.53]))); // burlywood

    // west wall
    room.add_object(new js3d.Quad_Color(
	gl,
	new Float32Array([0, 0, 50]),
	new Float32Array([0, 0, 0]),
	new Float32Array([0, 3, 0]),
	new Float32Array([0, 3, 50]),
	new Float32Array([0.53, 0.18, 0.9]))); // sienna

    let tetrahedron = new js3d.Tetrahedron(gl, js3d.random_color());
    let spinner = new js3d.Spinner(tetrahedron);
    let translate = new js3d.Translate(spinner, new Float32Array([40,2,40]))
    room.add_object(translate);

    let cube = new js3d.Cube(gl, js3d.random_color());
    spinner = new js3d.Spinner(cube);
    translate = new js3d.Translate(spinner, new Float32Array([10, 2, 40]));
    room.add_object(translate);

    let octahedron = new js3d.Octahedron(gl, js3d.random_color());
    spinner = new js3d.Spinner(octahedron);
    translate = new js3d.Translate(spinner, new Float32Array([40, 2, 10]));
    room.add_object(translate);

    let icosahedron = new js3d.Icosahedron(gl, js3d.random_color());
    spinner = new js3d.Spinner(icosahedron);
    translate = new js3d.Translate(spinner, new Float32Array([10, 2, 10]));
    room.add_object(translate);

    let dodecahedron = new js3d.Dodecahedron(gl, js3d.random_color());
    spinner = new js3d.Spinner(dodecahedron);
    translate = new js3d.Translate(spinner, new Float32Array([25, 2, 25]));
    room.add_object(translate);
   
    return room;
}

