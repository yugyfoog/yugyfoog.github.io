// build a room to play in

import * as js3d from "./js3d.js";
import * as floor from "./floor.js";
import * as m from "./mmath.js";

export function scene_graph(gl) {
    let room = new js3d.Group();

    // floor
    room.add_object(new floor.floor(gl));

    // north wall

    let north_wall = new js3d.Quad_Color(
	gl,
	new Float32Array([0, 0, 0]),
	new Float32Array([50, 0, 0]),
	new Float32Array([50, 3, 0]),
	new Float32Array([0, 3, 0]),
	new Float32Array([0.98, 0.98, 0.82])) // light goldenrod yellow

    let north_wall_physical = new js3d.Physical_Wall(
	north_wall,
	new Float32Array([0,0,0]),   // origin
	new Float32Array([50, 0, 0]),
	new Float32Array([0, 3, 0]));
    
    room.add_object(north_wall_physical);
    
    // east wall

    let east_wall = new js3d.Quad_Color(
	gl,
	new Float32Array([50, 0, 0]),
	new Float32Array([50, 0, 50]),
	new Float32Array([50, 3, 50]),
	new Float32Array([50, 3, 0]),
	new Float32Array([1, 0.87, 0.68])); // navajo white

    let east_wall_physical = new js3d.Physical_Wall(
	east_wall,
	new Float32Array([50, 0, 0]),
	new Float32Array([0, 0, 50]),
	new Float32Array([0, 3, 0]));

    room.add_object(east_wall_physical);

    // south wall


    let south_wall = new js3d.Quad_Color(
	gl,
	new Float32Array([50, 0, 50]),
	new Float32Array([0, 0, 50]),
	new Float32Array([0, 3, 50]),
	new Float32Array([50, 3, 50]),
	new Float32Array([0.87, 0.72, 0.53])); // burlywood

    let south_wall_physical = new js3d.Physical_Wall(
	south_wall,
	new Float32Array([50, 0, 50]),
	new Float32Array([-50, 0, 0]),
	new Float32Array([0, 3, 0]));

    room.add_object(south_wall_physical);
    
    // west wall

    let west_wall = new js3d.Quad_Color(
	gl,
	new Float32Array([0, 0, 50]),
	new Float32Array([0, 0, 0]),
	new Float32Array([0, 3, 0]),
	new Float32Array([0, 3, 50]),
	new Float32Array([0.53, 0.18, 0.9])); // sienna

    let west_wall_physical = new js3d.Physical_Wall(
	west_wall,
	new Float32Array([0, 0, 50]),
	new Float32Array([0, 0, -50]),
	new Float32Array([0, 3, 0]));

    room.add_object(west_wall_physical);
    
    let tetrahedron = new js3d.Tetrahedron(gl, js3d.random_color());
    let tetra_physical = new js3d.Physical_Sphere_Remove(tetrahedron, 1, room);
    let tetra_spinner = new js3d.Spinner(tetra_physical);
    let tetra_translate = new js3d.Translate(tetra_spinner, new Float32Array([40,2,40]))
    room.add_object(tetra_translate);
    tetra_physical.set_removable(tetra_translate);

    let cube = new js3d.Cube(gl, js3d.random_color());
    let cube_physical = new js3d.Physical_Sphere_Remove(cube, 1, room);
    let cube_spinner = new js3d.Spinner(cube_physical);
    let cube_translate = new js3d.Translate(cube_spinner, new Float32Array([10, 2, 40]));
    room.add_object(cube_translate);
    cube_physical.set_removable(cube_translate);
    
    let octahedron = new js3d.Octahedron(gl, js3d.random_color());
    let octa_physical = new js3d.Physical_Sphere_Remove(octahedron, 1, room);
    let octa_spinner = new js3d.Spinner(octa_physical);
    let octa_translate = new js3d.Translate(octa_spinner, new Float32Array([40, 2, 10]));
    room.add_object(octa_translate);
    octa_physical.set_removable(octa_translate);
    
    let icosahedron = new js3d.Icosahedron(gl, js3d.random_color());
    let icosa_physical = new js3d.Physical_Sphere_Remove(icosahedron, 1, room);
    let icosa_spinner = new js3d.Spinner(icosa_physical);
    let icosa_translate = new js3d.Translate(icosa_spinner, new Float32Array([10, 2, 10]));
    room.add_object(icosa_translate);
    icosa_physical.set_removable(icosa_translate);

    let dodecahedron = new js3d.Dodecahedron(gl, js3d.random_color());
    let dodeca_physical = new js3d.Physical_Sphere_Remove(dodecahedron, 1, room);
    let dodeca_spinner = new js3d.Spinner(dodeca_physical);
    let dodeca_translate = new js3d.Translate(dodeca_spinner, new Float32Array([25, 2, 25]));
    room.add_object(dodeca_translate);
    dodeca_physical.set_removable(dodeca_translate);
   
    return room;
}

