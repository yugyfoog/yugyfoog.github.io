import * as g from "./graphics.js";
import * as mm from "./mmath.js";
import * as room from "./room.js";

export class Group {
    constructor() {
	this.branch = Array();
    }

    add_object(obj) {
	this.branch.push(obj);
    }

    draw(gl, view, time) {
	for (let obj of this.branch) {
	    obj.draw(gl, view, time);
	}
    }
}

export class Orthogonal {
    constructor(obj, trans) {
	this.object = obj;
	this.transform = trans;
    }

    rotate(R) {
	this.transform = mm.multiply_linear_linear(R, this.transform);
    }
    
    draw(gl, view, time) {
	let new_view = new View(view.P,
				view.C,
				mm.multiply_linear_affine(this.transform, view.M),
				mm.multiply_linear_linear(this.transform, view.N));
	this.object.draw(gl, new_view, time);
    }
}

export class Spinner {
    constructor(obj) {
	this.object = obj;
    }

    draw(gl, view, time) {
	let theta = time/1000;
	let c = Math.cos(theta);
	let s = Math.sin(theta);
	let T = new Float32Array([ c, 0, s, 0, 1, 0, -s, 0, c]);
	let new_view = new View(view.P,
				view.C,
				mm.multiply_affine_linear(view.M, T),
				mm.multiply_linear_linear(view.N, T));
	this.object.draw(gl, new_view, time);
    }
}

export class Translate {
    constructor(obj, trans) {
	this.object = obj;
	this.transform = trans;
    }

    draw(gl, view, time) {
	let new_view = new View(view.P,
				view.C,
				mm.translate(view.M, this.transform),
				view.N);
	this.object.draw(gl, new_view, time);
    }
}


let _movable;

function key_down(event) {
    let theta = 0;
    let ct = 0;
    let st = 0;
    
    switch (event.code) {
    case "ArrowDown":
    case "KeyS":
	_movable[9] = 0.1*_movable[6];
	_movable[10] = 0.1*_movable[7];
	_movable[11] = 0.1*_movable[8];
        break;
    case "ArrowUp":
    case "KeyW":
	_movable[9] = -0.1*_movable[6];
	_movable[10] = -0.1*_movable[7];
	_movable[11] = -0.1*_movable[8];
	break;
    case "ArrowRight":
    case "KeyD":
	theta = Math.PI/60.0; // one rotation per second
	ct = Math.cos(theta);
	st = Math.sin(theta);
	
	_movable[0] = ct;
	_movable[1] = 0
	_movable[2] = st;
	_movable[3] = 0;
	_movable[4] = 1;
	_movable[5] = 0;
	_movable[6] = -st;
	_movable[7] = 0;
	_movable[8] = ct;
	break;
    case "ArrowLeft":
    case "KeyA":
	theta = Math.PI/60.0; // one rotation per second
	ct = Math.cos(theta);
	st = Math.sin(theta);
	
	_movable[0] = ct;
	_movable[1] = 0
	_movable[2] = -st;
	_movable[3] = 0;
	_movable[4] = 1;
	_movable[5] = 0;
	_movable[6] = st;
	_movable[7] = 0;
	_movable[8] = ct;
	break;
    }
}

function key_up(event) {
    let theta;
    switch (event.code) {
    case "ArrowDown":
    case "KeyS":
	_movable[9] = 0;
	_movable[10] = 0;
	_movable[11] = 0;
	break;
    case "ArrowUp":
    case "KeyW":
	_movable[9] = 0;
	_movable[10] = 0;
	_movable[11] = 0;
	break;
    case "ArrowRight":
    case "KeyD":
    case "ArrowLeft":
    case "KeyA":
	_movable[0] = 1;
	_movable[1] = 0;
	_movable[2] = 0;
	_movable[3] = 0;
	_movable[4] = 1;
	_movable[5] = 0;
	_movable[6] = 0;
	_movable[7] = 0;
	_movable[8] = 1;
    }
}

export class Movable {
    constructor(obj, trans) {
	this.object = obj;
	this.transform = trans;  // trans must be an orthogonal affine transform
	_movable = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]);
	document.addEventListener("keydown", key_down);
	document.addEventListener("keyup", key_up);
    }
    
    draw(gl, view, time) {
	this.transform = mm.multiply_affine_affine(this.transform, _movable);
	let new_view = new View(view.P,
				view.C,
				mm.multiply_affine_affine(view.M, this.transform),
				mm.multiply_linear_linear(view.N, this.transform));
	this.object.draw(gl, new_view, time);
    }
}

// solid color quadrilateral

export class Quad_Color {
    constructor(gl, p0, p1, p2, p3, color) {
	let vertex_shader_source =
	    "attribute vec4 position;\n" +
	    "uniform mat4 trans;\n" +
	    "void main() {\n" +
	    "    gl_Position = trans*position;\n" +
	    "}\n";

	let fragment_shader_source =
	    "precision mediump float;\n" +
	    "uniform vec4 ucolor;\n" +
	    "void main() {\n" +
	    "    gl_FragColor = ucolor;\n" +
	    "}\n";

	this.positions = new Float32Array([
	    p0[0], p0[1], p0[2],
	    p1[0], p1[1], p1[2],
	    p3[0], p3[1], p3[2],
	    p3[0], p3[1], p3[2],
	    p1[0], p1[1], p1[2],
	    p2[0], p2[1], p2[2]]);

	this.color = color;
	
	this.program = g.new_program(gl, vertex_shader_source, fragment_shader_source);
	gl.useProgram(this.program);
	
	this.position_attribute = gl.getAttribLocation(this.program, "position");
	this.position_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
    }

    draw(gl, view, time) {
	gl.useProgram(this.program);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
	gl.vertexAttribPointer(this.position_attribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.position_attribute);

	let trans_location = gl.getUniformLocation(this.program, "trans");

	let trans = mm.multiply_homogeneous_affine(view.P, mm.multiply_affine_affine(view.C, view.M));
	
	gl.uniformMatrix4fv(trans_location, false, trans);

	let color_location = gl.getUniformLocation(this.program, "ucolor");
	gl.uniform4f(color_location, this.color[0], this.color[1], this.color[2], 1);
	
	gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}

// solid color tetrahedron

export class Tetrahedron {
    constructor(gl, color) {
    
	let vertex_shader_source =
	    "attribute vec4 position;\n" +
	    "attribute vec3 normal;\n" +
	    "varying vec3 vnormal;\n" +
	    "uniform mat4 trans;\n" +
	    "uniform mat3 ntrans;\n" +
	    "void main() {\n" +
	    "    gl_Position = trans*position;\n" +
	    "    vnormal = ntrans*normal;\n" +
	    "}\n";
	
	let fragment_shader_source =
	    "precision mediump float;\n" +
	    "varying vec3 vnormal;\n" +
	    "uniform vec3 ulight;\n" +
	    "uniform vec4 ucolor;\n" +
	    "void main() {\n" +
	    "    float light = dot(normalize(vnormal), ulight);\n" +
	    "    gl_FragColor = ucolor;\n" +
	    "    if (light < 0.0)\n" +
	    "        gl_FragColor.rgb = clamp(0.5*gl_FragColor.rgb, 0.0, 1.0);\n" +
	    "    else\n" +
	    "        gl_FragColor.rgb = clamp(light*gl_FragColor.rgb + 0.5*gl_FragColor.rgb, 0.0, 1.0);\n" +
	    "}\n";
	
	this.positions = new Float32Array([
	    1, 1, 1,
	    1, -1, -1,
	    -1, 1, -1,
	    
	    1, 1, 1,
	    -1, 1, -1,
	    -1, -1, 1,
	    
	    1, 1, 1,
	    -1, -1, 1,
	    1, -1, -1,
	    
	    1, -1, -1,
	    -1, -1, 1,
	    -1, 1, -1]);
	
	let n =1/Math.sqrt(3)

	this.normals = new Float32Array([
	    n, n, -n,
	    n, n, -n,
	    n, n, -n,

	    -n, n, n,
	    -n, n, n,
	    -n, n, n,

	    n, -n, n,
	    n, -n, n,
	    n, -n, n,

	    -n, -n, -n,
	    -n, -n, -n,
	    -n, -n, -n]);

	this.color = color;
	
	this.program = g.new_program(gl, vertex_shader_source, fragment_shader_source);
	gl.useProgram(this.program);
	
	this.position_attribute = gl.getAttribLocation(this.program, "position");
	this.position_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

	this.normal_attribute = gl.getAttribLocation(this.program, "normal");
	this.normal_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    }
    
    draw(gl, view, time) {
	gl.useProgram(this.program);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
	gl.vertexAttribPointer(this.position_attribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.position_attribute);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
	gl.vertexAttribPointer(this.normal_attribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.normal_attribute);
	
	let trans_location = gl.getUniformLocation(this.program, "trans");

	let trans = mm.multiply_homogeneous_affine(view.P, mm.multiply_affine_affine(view.C, view.M));
	
	gl.uniformMatrix4fv(trans_location, false, trans);
	
	let ntrans_location = gl.getUniformLocation(this.program, "ntrans");
	gl.uniformMatrix3fv(ntrans_location, false, view.N);
	
	let color_location = gl.getUniformLocation(this.program, "ucolor");
	gl.uniform4f(color_location, this.color[0], this.color[1], this.color[2], 1)

	let ulight_location = gl.getUniformLocation(this.program, "ulight");
	gl.uniform3f(ulight_location, 0, 1, 0);
	
	gl.drawArrays(gl.TRIANGLES, 0, 12);
    }
}

export class Cube {
    constructor(gl, color) {
	let vertex_shader_source =
	    "attribute vec4 position;\n" +
	    "attribute vec3 normal;\n" +
	    "varying vec3 vnormal;\n" +
	    "uniform mat4 trans;\n" +
	    "uniform mat3 ntrans;\n" +
	    "void main() {\n" +
	    "    gl_Position = trans*position;\n" +
	    "    vnormal = ntrans*normal;\n" +
	    "}\n";
	
	let fragment_shader_source =
	    "precision mediump float;\n" +
	    "varying vec3 vnormal;\n" +
	    "uniform vec3 ulight;\n" +
	    "uniform vec4 ucolor;\n" +
	    "void main() {\n" +
	    "    float light = dot(normalize(vnormal), ulight);\n" +
	    "    gl_FragColor = ucolor;\n" +
	    "    if (light < 0.0)\n" +
	    "        gl_FragColor.rgb = clamp(0.5*gl_FragColor.rgb, 0.0, 1.0);\n" +
	    "    else\n" +
	    "        gl_FragColor.rgb = clamp(light*gl_FragColor.rgb + 0.5*gl_FragColor.rgb, 0.0, 1.0);\n" +
	    "}\n";

	this.positions = new Float32Array([
	    1, 1, 1,
	    1, -1, 1,
	    1, -1, -1,
	    1, 1, 1,
	    1, -1, -1,
	    1, 1, -1,

	    1, 1, 1,
	    1, 1, -1,
	    -1, 1, -1,
	    1, 1, 1,
	    -1, 1, -1,
	    -1, 1, 1,

	    1, 1, 1,
	    -1, 1, 1,
	    -1, -1, 1,
	    1, 1, 1,
	    -1, -1, 1,
	    1, -1, 1,

	    -1, -1, -1,
	    -1, -1, 1,
	    -1, 1, 1,
	    -1, -1, -1,
	    -1, 1, 1,
	    -1, 1, -1,

	    -1, -1, -1,
	    1, -1, -1,
	    1, -1, 1,
	    -1, -1, -1,
	    1, -1, 1,
	    -1, -1, 1,

	    -1, -1, -1,
	    -1, 1, -1,
	    1, 1, -1,
	    -1, -1, -1,
	    1, 1, -1,
	    1, -1, -1]);

	this.normals = new Float32Array([
	    1, 0, 0,
	    1, 0, 0,
	    1, 0, 0,
	    1, 0, 0,
	    1, 0, 0,
	    1, 0, 0,

	    0, 1, 0,
	    0, 1, 0,
	    0, 1, 0,
	    0, 1, 0,
	    0, 1, 0,
	    0, 1, 0,

	    0, 0, 1,
	    0, 0, 1,
	    0, 0, 1,
	    0, 0, 1,
	    0, 0, 1,
	    0, 0, 1,

	    -1, 0, 0,
	    -1, 0, 0,
	    -1, 0, 0,
	    -1, 0, 0,
	    -1, 0, 0,
	    -1, 0, 0,

	    0, -1, 0,
	    0, -1, 0,
	    0, -1, 0,
	    0, -1, 0,
	    0, -1, 0,
	    0, -1, 0,

	    0, 0, -1,
	    0, 0, -1,
	    0, 0, -1,
	    0, 0, -1,
	    0, 0, -1,
	    0, 0, -1]);
	
	this.color = color;
	
	this.program = g.new_program(gl, vertex_shader_source, fragment_shader_source);
	gl.useProgram(this.program);
	
	this.position_attribute = gl.getAttribLocation(this.program, "position");
	this.position_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

	this.normal_attribute = gl.getAttribLocation(this.program, "normal");
	this.normal_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    }
    
    draw(gl, view, time) {
	gl.useProgram(this.program);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
	gl.vertexAttribPointer(this.position_attribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.position_attribute);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
	gl.vertexAttribPointer(this.normal_attribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.normal_attribute);
	
	let trans_location = gl.getUniformLocation(this.program, "trans");

	let trans = mm.multiply_homogeneous_affine(view.P, mm.multiply_affine_affine(view.C, view.M));
	
	gl.uniformMatrix4fv(trans_location, false, trans);
	
	let ntrans_location = gl.getUniformLocation(this.program, "ntrans");
	gl.uniformMatrix3fv(ntrans_location, false, view.N);
	
	let color_location = gl.getUniformLocation(this.program, "ucolor");
	gl.uniform4f(color_location, this.color[0], this.color[1], this.color[2], 1)

	let ulight_location = gl.getUniformLocation(this.program, "ulight");
	let n = Math.sqrt(1.0/3.0);
	gl.uniform3f(ulight_location, n, n, n);
	
	gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}

export class Octahedron {
    constructor(gl, color) {
	let vertex_shader_source =
	    "attribute vec4 position;\n" +
	    "attribute vec3 normal;\n" +
	    "varying vec3 vnormal;\n" +
	    "uniform mat4 trans;\n" +
	    "uniform mat3 ntrans;\n" +
	    "void main() {\n" +
	    "    gl_Position = trans*position;\n" +
	    "    vnormal = ntrans*normal;\n" +
	    "}\n";
	
	let fragment_shader_source =
	    "precision mediump float;\n" +
	    "varying vec3 vnormal;\n" +
	    "uniform vec3 ulight;\n" +
	    "uniform vec4 ucolor;\n" +
	    "void main() {\n" +
	    "    float light = dot(normalize(vnormal), ulight);\n" +
	    "    gl_FragColor = ucolor;\n" +
	    "    if (light < 0.0)\n" +
	    "        gl_FragColor.rgb = clamp(0.5*gl_FragColor.rgb, 0.0, 1.0);\n" +
	    "    else\n" +
	    "        gl_FragColor.rgb = clamp(light*gl_FragColor.rgb + 0.5*gl_FragColor.rgb, 0.0, 1.0);\n" +
	    "}\n";

	this.positions = new Float32Array([
	    1, 0, 0,
	    0, 0, -1,
	    0, 1, 0,

	    1, 0, 0,
	    0, 1, 0,
	    0, 0, 1,

	    1, 0, 0,
	    0, 0, 1,
	    0, -1, 0,

	    1, 0, 0,
	    0, -1, 0,
	    0, 0, -1,

	    -1, 0, 0,
	    0, 0, 1,
	    0, 1, 0,

	    -1, 0, 0,
	    0, 1, 0,
	    0, 0, -1,

	    -1, 0, 0,
	    0, 0, -1,
	    0, -1, 0,

	    -1, 0, 0,
	    0, -1, 0,
	    0, 0, 1]);

	let n = Math.sqrt(1.0,3.0);
	this.normals = new Float32Array([
	    n, n, -n,
	    n, n, -n,
	    n, n, -n,

	    n, n, n,
	    n, n, n,
	    n, n, n,

	    n, -n, n,
	    n, -n, n,
	    n, -n, n,

	    n, -n, -n,
	    n, -n, -n,
	    n, -n, -n,

	    -n, n, n,
	    -n, n, n,
	    -n, n, n,

	    -n, n, -n,
	    -n, n, -n,
	    -n, n, -n,

	    -n, -n, -n,
	    -n, -n, -n,
	    -n, -n, -n,

	    -n, -n, n,
	    -n, -n, n,
	    -n, -n, n]);
	    
	this.color = color;
	
	this.program = g.new_program(gl, vertex_shader_source, fragment_shader_source);
	gl.useProgram(this.program);
	
	this.position_attribute = gl.getAttribLocation(this.program, "position");
	this.position_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

	this.normal_attribute = gl.getAttribLocation(this.program, "normal");
	this.normal_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    }
    
    draw(gl, view, time) {
	gl.useProgram(this.program);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
	gl.vertexAttribPointer(this.position_attribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.position_attribute);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
	gl.vertexAttribPointer(this.normal_attribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.normal_attribute);
	
	let trans_location = gl.getUniformLocation(this.program, "trans");

	let trans = mm.multiply_homogeneous_affine(view.P, mm.multiply_affine_affine(view.C, view.M));
	
	gl.uniformMatrix4fv(trans_location, false, trans);
	
	let ntrans_location = gl.getUniformLocation(this.program, "ntrans");
	gl.uniformMatrix3fv(ntrans_location, false, view.N);
	
	let color_location = gl.getUniformLocation(this.program, "ucolor");
	gl.uniform4f(color_location, this.color[0], this.color[1], this.color[2], 1)

	let ulight_location = gl.getUniformLocation(this.program, "ulight");
	let n = Math.sqrt(1.0/3.0);
	gl.uniform3f(ulight_location, n, n, n);
	
	gl.drawArrays(gl.TRIANGLES, 0, 24);
    }
}




export class Icosahedron {
    constructor(gl, color) {
	let vertex_shader_source =
	    "attribute vec4 position;\n" +
	    "attribute vec3 normal;\n" +
	    "varying vec3 vnormal;\n" +
	    "uniform mat4 trans;\n" +
	    "uniform mat3 ntrans;\n" +
	    "void main() {\n" +
	    "    gl_Position = trans*position;\n" +
	    "    vnormal = ntrans*normal;\n" +
	    "}\n";
	
	let fragment_shader_source =
	    "precision mediump float;\n" +
	    "varying vec3 vnormal;\n" +
	    "uniform vec3 ulight;\n" +
	    "uniform vec4 ucolor;\n" +
	    "void main() {\n" +
	    "    float light = dot(normalize(vnormal), ulight);\n" +
	    "    gl_FragColor = ucolor;\n" +
	    "    if (light < 0.0)\n" +
	    "        gl_FragColor.rgb = clamp(0.5*gl_FragColor.rgb, 0.0, 1.0);\n" +
	    "    else\n" +
	    "        gl_FragColor.rgb = clamp(light*gl_FragColor.rgb + 0.5*gl_FragColor.rgb, 0.0, 1.0);\n" +
	    "}\n";

	let phi = (1 + Math.sqrt(5))/2; // i.e., the Golden Ratio
	
	this.positions = new Float32Array([

	    // 1
	    phi, 1, 0,     //  1 19 3 17 7
	    1, 0, phi,     //  1 7 15 5 13
	    phi, -1, 0,    //  1 13 11 9 19

	    // 2
	    -phi, 1, 0,    //  2 12 10  8 20
	    -phi, -1, 0,   //  2 20 14  4 18
	    -1, 0, phi,    //  2 18  5 16 12
	    
	    // 3
	    phi, 1, 0,     //  1 19  3 17  7
	    1, 0, -phi,    //  3 19  9  6 16
	    0, phi, -1,    //  3 16  8 10 17

	    // 4
	    -phi, -1, 0,   //  2 20 14  4 18
	    0, -phi, -1,   //  4 14  9  6 11
	    0, -phi, 1,    //  4 11 13  5 18
	    
	    // 5
	    0, -phi, 1,    //  4 11 13  5 18
	    1, 0, phi,     //  1  7 15  5 13
	    -1, 0, phi,    //  2 18  5 16 12

	    // 6
	    0, -phi, -1,   //  4 14  9  6 11
	    -1, 0, -phi,   //  6 14 20  8 16
	    1, 0, -phi,    //  3 19  9  6 16

	    // 7
	    phi, 1, 0,     //  1 19  3 17  7
	    0, phi, 1,     //  7 17 10 12 15
	    1, 0, phi,     //  1  7 15  5 13

	    // 8
	    -phi, 1, 0,    //  2 12 10  8 20
	    0, phi, -1,    //  3 16  8 10 17
	    -1, 0, -phi,   //  6 14 20  8 16

	    // 9
	    phi, -1, 0,    //  1 13 11  9 19
	    0, -phi, -1,   //  4 14  9  6 11
	    1, 0, -phi,    //  3 19  9  6 16

	    // 10
	    -phi, 1, 0,    //  2 12 10  8 20
	    0, phi, 1,     //  7 17 10 12 15
	    0, phi, -1,    //  3 16  8 10 17

	    // 11
	    phi, -1, 0,    //  1 13 11  9 19
	    0, -phi, 1,    //  4 11 13  5 18
	    0, -phi, -1,   //  4 14  9  6 11

	    // 12
	    -phi, 1, 0,    //  2 12 10  8 20
	    -1, 0, phi,    //  2 18  5 15 12
	    0, phi, 1,     //  7 17 10 12 15

	    // 13
	    phi, -1, 0,    //  1 13 11  9 19
	    1, 0, phi,     //  1  7 15  5 13
	    0, -phi, 1,    //  4 11 13  5 18

	    // 14
	    -phi, -1, 0,   //  2 20 14  4 18
	    -1, 0, -phi,   //  6 14 20  8 16
	    0, -phi, -1,   //  4 14  9  6 11

	    // 15
	    0, phi, 1,     //  7 17 10 12 15
	    -1, 0, phi,    //  2 18  5 15 12
	    1, 0, phi,     //  1  7 15  5 13

	    // 16
	    0, phi, -1,    //  3 16  8 10 17
	    1, 0, -phi,    //  3 19  9  6 16
	    -1, 0, -phi,   //  6 14 20  8 16

	    // 17
	    phi, 1, 0,     //  1 19  3 17  7
	    0, phi, -1,    //  3 16  8 10 17
	    0, phi, 1,     //  7 17 10 12 15

	    // 18
	    -phi, -1, 0,   //  2 20 14  4 18
	    0, -phi, 1,    //  4 11 13  5 18
	    -1, 0, phi,    //  2 18  5 15 12

	    // 19
	    phi, 1, 0,     //  1 19  3 17  7
	    phi, -1, 0,    //  1 13 11  9 19
	    1, 0, -phi,    //  3 19  9  6 16

	    // 20
	    -phi, 1, 0,    //  2 12 10  8 20
	    -1, 0, -phi,   //  6 14 20  8 16
	    -phi, -1, 0,   //  2 20 14  4 18
	]);

	let p = (1 + Math.sqrt(5))/Math.sqrt(12);
	let q = ((1 + Math.sqrt(5)) - 2)/Math.sqrt(12);
	let r = 2/Math.sqrt(12);
	
	this.normals = new Float32Array([
	    p, 0, q,
	    p, 0, q,
	    p, 0, q,

	    -p, 0, q,
	    -p, 0, q,
	    -p, 0, q,

	    r, r, -r,
	    r, r, -r,
	    r, r, -r,

	    -q, -p, 0,
	    -q, -p, 0,
	    -q, -p, 0,

	    0, -q, -p,
	    0, -q, -p,
	    0, -q, -p,

	    0, -q, -p,
	    0, -q, -p,
	    0, -q, -p,

	    r, r, r,
	    r, r, r,
	    r, r, r,

	    -r, r, -r,
	    -r, r, -r,
	    -r, r, -r,

	    r, -r, -r,
	    r, -r, -r,
	    r, -r, -r,

	    -q, p, 0,
	    -q, p, 0,
	    -q, p, 0,

	    q, -p, 0,
	    q, -p, 0,
	    q, -p, 0,

	    -r, r, r,
	    -r, r, r,
	    -r, r, r,

	    r, -r, r,
	    r, -r, r,
	    r, -r, r,

	    -r, -r, -r,
	    -r, -r, -r,
	    -r, -r, -r,

	    -0, q, p,
	    -0, q, p,
	    -0, q, p,

	    0, q, -p,
	    0, q, -p,
	    0, q, -p,

	    q, p, -0,
	    q, p, -0,
	    q, p, -0,

	    -r, -r, r,
	    -r, -r, r,
	    -r, -r, r,

	    p, 0, -q,
	    p, 0, -q,
	    p, 0, -q,

	    -p, 0, -q,
	    -p, 0, -q,
	    -p, 0, -q]);

	this.color = color;
	
	this.program = g.new_program(gl, vertex_shader_source, fragment_shader_source);
	gl.useProgram(this.program);
	
	this.position_attribute = gl.getAttribLocation(this.program, "position");
	this.position_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

	this.normal_attribute = gl.getAttribLocation(this.program, "normal");
	this.normal_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    }
    
    draw(gl, view, time) {
	gl.useProgram(this.program);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
	gl.vertexAttribPointer(this.position_attribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.position_attribute);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
	gl.vertexAttribPointer(this.normal_attribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.normal_attribute);
	
	let trans_location = gl.getUniformLocation(this.program, "trans");

	let trans = mm.multiply_homogeneous_affine(view.P, mm.multiply_affine_affine(view.C, view.M));
	
	gl.uniformMatrix4fv(trans_location, false, trans);
	
	let ntrans_location = gl.getUniformLocation(this.program, "ntrans");
	gl.uniformMatrix3fv(ntrans_location, false, view.N);
	
	let color_location = gl.getUniformLocation(this.program, "ucolor");
	gl.uniform4f(color_location, this.color[0], this.color[1], this.color[2], 1)

	let ulight_location = gl.getUniformLocation(this.program, "ulight");
	let n = Math.sqrt(1.0/3.0);
	gl.uniform3f(ulight_location, n, n, n);
	
	gl.drawArrays(gl.TRIANGLES, 0, 60);
    }
}


export class Dodecahedron {
    constructor(gl, color) {
	let vertex_shader_source =
	    "attribute vec4 position;\n" +
	    "attribute vec3 normal;\n" +
	    "varying vec3 vnormal;\n" +
	    "uniform mat4 trans;\n" +
	    "uniform mat3 ntrans;\n" +
	    "void main() {\n" +
	    "    gl_Position = trans*position;\n" +
	    "    vnormal = ntrans*normal;\n" +
	    "}\n";
	
	let fragment_shader_source =
	    "precision mediump float;\n" +
	    "varying vec3 vnormal;\n" +
	    "uniform vec3 ulight;\n" +
	    "uniform vec4 ucolor;\n" +
	    "void main() {\n" +
	    "    float light = dot(normalize(vnormal), ulight);\n" +
	    "    gl_FragColor = ucolor;\n" +
	    "    if (light < 0.0)\n" +
	    "        gl_FragColor.rgb = clamp(0.5*gl_FragColor.rgb, 0.0, 1.0);\n" +
	    "    else\n" +
	    "        gl_FragColor.rgb = clamp(light*gl_FragColor.rgb + 0.5*gl_FragColor.rgb, 0.0, 1.0);\n" +
	    "}\n";

	let phi = (1 + Math.sqrt(5))/2; // i.e., the Golden Ratio
	let psi = phi - 1;              // i.e., 1/phi
	
	this.positions = new Float32Array([

/*
	    // z == 0
	    phi, psi, 0,     //  2  7 10 
	    -phi, psi 0,     //  5  6 11 
	    -phi, -psi, 0,   //  3  6 11 
	    phi, -psi, 0,    //  2  7  8 

	    // x == 0
	    0, phi, psi,    //  1  5 10 
	    0, phi, -psi,     //  5  9 10 
	    0, -phi, -psi,    //  3  8 12 
	    0, -phi, psi,   //  3  4  8 

	    // y ==0
	    psi, 0, phi,     //  1  2  4 
	    psi, 0, -phi,    //  7  9 12 
	    -psi, 0, -phi,   //  9 11 12 
	    -psi, 0, phi,   //  1  4  6 

	    // cube
	    1, 1, 1,        //  1  2 10 
	    -1, 1, 1,       //  1  6  5 
	    -1, -1, 1,      //  3  4  6 
	    1, -1, 1,       //  2  4  8 
	    1, 1, -1,         //  7  9 10 
	    -1, 1, -1,        //  5  9 11 
	    -1, -1, -1,       //  3 11 12 
	    1, -1, -1,        //  7  8 12 
*/
	    //============================================================
	    
	    // 1

	    psi, 0, phi,     //  1  2  4 
	    1, 1, 1,        //  1  2 10 
	    0, phi, psi,    //  1  5 10 
	    0, phi, psi,    //  1  5 10 
	    -1, 1, 1,       //  1  6  5 
	    -psi, 0, phi,   //  1  4  6 
	    psi, 0, phi,     //  1  2  4 
	    0, phi, psi,    //  1  5 10 
	    -psi, 0, phi,   //  1  4  6 
	    
	    // 2
	    phi, psi, 0,     //  2  7 10 	    
	    1, 1, 1,        //  1  2 10 
	    psi, 0, phi,     //  1  2  4 
	    psi, 0, phi,     //  1  2  4 
	    1, -1, 1,       //  2  4  8 
	    phi, -psi, 0,    //  2  7  8 
	    phi, psi, 0,     //  2  7 10 	    
	    psi, 0, phi,     //  1  2  4 
	    phi, -psi, 0,    //  2  7  8
	    
	    // 3	    
	    0, -phi, psi,   //  3  4  8 
	    -1, -1, 1,      //  3  4  6 
	    -phi, -psi, 0,   //  3  6 11 
	    -phi, -psi, 0,   //  3  6 11 
	    -1, -1, -1,       //  3 11 12
	    0, -phi, -psi,    //  3  8 12 
	    0, -phi, psi,   //  3  4  8 
	    -phi, -psi, 0,   //  3  6 11 
	    0, -phi, -psi,    //  3  8 12 
	    
	    // 4
	    -psi, 0, phi,   //  1  4  6 
	    -1, -1, 1,      //  3  4  6 
	    0, -phi, psi,   //  3  4  8 
	    0, -phi, psi,   //  3  4  8 
	    1, -1, 1,       //  2  4  8 
	    psi, 0, phi,     //  1  2  4 
	    -psi, 0, phi,   //  1  4  6 
	    0, -phi, psi,   //  3  4  8 
	    psi, 0, phi,     //  1  2  4 

	    // 5
	    0, phi, -psi,     //  5  9 10 
	    -1, 1, -1,        //  5  9 11 
	    -phi, psi, 0,     //  5  6 11 
	    -phi, psi, 0,     //  5  6 11 
	    -1, 1, 1,       //  1  6  5 
	    0, phi, psi,    //  1  5 10 
	    0, phi, -psi,     //  5  9 10 
	    -phi, psi, 0,     //  5  6 11 
	    0, phi, psi,    //  1  5 10 

	    // 6
	    -phi, -psi, 0,   //  3  6 11 
	    -1, -1, 1,      //  3  4  6 
	    -psi, 0, phi,   //  1  4  6 
	    -psi, 0, phi,   //  1  4  6 
	    -1, 1, 1,       //  1  6  5 
	    -phi, psi, 0,     //  5  6 11 
	    -phi, -psi, 0,   //  3  6 11 
	    -psi, 0, phi,   //  1  4  6 
	    -phi, psi, 0,     //  5  6 11 

	    // 7
	    phi, -psi, 0,    //  2  7  8 
	    1, -1, -1,        //  7  8 12 
	    psi, 0, -phi,    //  7  9 12 
	    psi, 0, -phi,    //  7  9 12 
	    1, 1, -1,         //  7  9 10 
	    phi, psi, 0,     //  2  7 10 
	    phi, -psi, 0,    //  2  7  8 
	    psi, 0, -phi,    //  7  9 12 
	    phi, psi, 0,     //  2  7 10 
	    
	    // 8
	    0, -phi, -psi,    //  3  8 12 
	    1, -1, -1,        //  7  8 12 
	    phi, -psi, 0,    //  2  7  8 
	    phi, -psi, 0,    //  2  7  8 
	    1, -1, 1,       //  2  4  8 
	    0, -phi, psi,   //  3  4  8 
	    0, -phi, -psi,    //  3  8 12 
	    phi, -psi, 0,    //  2  7  8 
	    0, -phi, psi,   //  3  4  8 

	    // 9
	    -psi, 0, -phi,   //  9 11 12 
	    -1, 1, -1,        //  5  9 11 
	    0, phi, -psi,     //  5  9 10 
	    0, phi, -psi,     //  5  9 10 
	    1, 1, -1,         //  7  9 10 
	    psi, 0, -phi,    //  7  9 12 
	    -psi, 0, -phi,   //  9 11 12 
	    0, phi, -psi,     //  5  9 10 
	    psi, 0, -phi,    //  7  9 12 

	    // 10
	    0, phi, psi,    //  1  5 10 
	    1, 1, 1,        //  1  2 10 
	    phi, psi, 0,     //  2  7 10 
	    phi, psi, 0,     //  2  7 10 
	    1, 1, -1,         //  7  9 10 
	    0, phi, -psi,     //  5  9 10 
	    0, phi, psi,    //  1  5 10 
	    phi, psi, 0,     //  2  7 10 
	    0, phi, -psi,     //  5  9 10 

	    // 11
	    -phi, psi, 0,     //  5  6 11 
	    -1, 1, -1,        //  5  9 11 
	    -psi, 0, -phi,   //  9 11 12 
	    -psi, 0, -phi,   //  9 11 12 
	    -1, -1, -1,       //  3 11 12 
	    -phi, -psi, 0,   //  3  6 11 
	    -phi, psi, 0,     //  5  6 11 
	    -psi, 0, -phi,   //  9 11 12 
	    -phi, -psi, 0,   //  3  6 11 

	    // 12
	    psi, 0, -phi,    //  7  9 12 
	    1, -1, -1,        //  7  8 12 
	    0, -phi, -psi,    //  3  8 12 
	    0, -phi, -psi,    //  3  8 12 
	    -1, -1, -1,       //  3 11 12 
	    -psi, 0, -phi,   //  9 11 12 
	    psi, 0, -phi,    //  7  9 12 
	    0, -phi, -psi,    //  3  8 12 
	    -psi, 0, -phi,   //  9 11 12 
	]);

	let r = Math.sqrt(-8*Math.sqrt(5) + 20);
	let p = -(Math.sqrt(5) - 3)/r;
	let q = -(1 - Math.sqrt(5))/r;
	
	this.normals = new Float32Array([
	    0, p, q,
	    0, p, q,
	    0, p, q,
	    0, p, q,
	    0, p, q,
	    0, p, q,
	    0, p, q,
	    0, p, q,
	    0, p, q,
	    
	    q, 0, p,
	    q, 0, p,
	    q, 0, p,
	    q, 0, p,
	    q, 0, p,
	    q, 0, p,
	    q, 0, p,
	    q, 0, p,
	    q, 0, p,
	    
	    -p, -q, 0,
	    -p, -q, 0,
	    -p, -q, 0,
	    -p, -q, 0,
	    -p, -q, 0,
	    -p, -q, 0,
	    -p, -q, 0,
	    -p, -q, 0,
	    -p, -q, 0,
	    
	    0, -p, q,
	    0, -p, q,
	    0, -p, q,
	    0, -p, q,
	    0, -p, q,
	    0, -p, q,
	    0, -p, q,
	    0, -p, q,
	    0, -p, q,
	    
	    -p, q, 0,
	    -p, q, 0,
	    -p, q, 0,
	    -p, q, 0,
	    -p, q, 0,
	    -p, q, 0,
	    -p, q, 0,
	    -p, q, 0,
	    -p, q, 0,
	    
	    -q, 0, p,
	    -q, 0, p,
	    -q, 0, p,
	    -q, 0, p,
	    -q, 0, p,
	    -q, 0, p,
	    -q, 0, p,
	    -q, 0, p,
	    -q, 0, p,
	    
	    q, 0, -p,
	    q, 0, -p,
	    q, 0, -p,
	    q, 0, -p,
	    q, 0, -p,
	    q, 0, -p,
	    q, 0, -p,
	    q, 0, -p,
	    q, 0, -p,
	    
	    p, -q, 0,
	    p, -q, 0,
	    p, -q, 0,
	    p, -q, 0,
	    p, -q, 0,
	    p, -q, 0,
	    p, -q, 0,
	    p, -q, 0,
	    p, -q, 0,
	    
	    0, p, -q,
	    0, p, -q,
	    0, p, -q,
	    0, p, -q,
	    0, p, -q,
	    0, p, -q,
	    0, p, -q,
	    0, p, -q,
	    0, p, -q,
	    
	    p, q, 0,
	    p, q, 0,
	    p, q, 0,
	    p, q, 0,
	    p, q, 0,
	    p, q, 0,
	    p, q, 0,
	    p, q, 0,
	    p, q, 0,
	    
	    -q, 0, -p,
	    -q, 0, -p,
	    -q, 0, -p,
	    -q, 0, -p,
	    -q, 0, -p,
	    -q, 0, -p,
	    -q, 0, -p,
	    -q, 0, -p,
	    -q, 0, -p,
	    
	    0, -p, -q,
	    0, -p, -q,
	    0, -p, -q,
	    0, -p, -q,
	    0, -p, -q,
	    0, -p, -q,
	    0, -p, -q,
	    0, -p, -q,
	    0, -p, -q]);


	this.color = color;
	
	this.program = g.new_program(gl, vertex_shader_source, fragment_shader_source);
	gl.useProgram(this.program);
	
	this.position_attribute = gl.getAttribLocation(this.program, "position");
	this.position_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

	this.normal_attribute = gl.getAttribLocation(this.program, "normal");
	this.normal_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    }
    
    draw(gl, view, time) {
	gl.useProgram(this.program);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
	gl.vertexAttribPointer(this.position_attribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.position_attribute);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
	gl.vertexAttribPointer(this.normal_attribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.normal_attribute);
	
	let trans_location = gl.getUniformLocation(this.program, "trans");

	let trans = mm.multiply_homogeneous_affine(view.P, mm.multiply_affine_affine(view.C, view.M));
	
	gl.uniformMatrix4fv(trans_location, false, trans);
	
	let ntrans_location = gl.getUniformLocation(this.program, "ntrans");
	gl.uniformMatrix3fv(ntrans_location, false, view.N);
	
	let color_location = gl.getUniformLocation(this.program, "ucolor");
	gl.uniform4f(color_location, this.color[0], this.color[1], this.color[2], 1)

	let ulight_location = gl.getUniformLocation(this.program, "ulight");
	let n = Math.sqrt(1.0/3.0);
	gl.uniform3f(ulight_location, n, n, n);
	
	gl.drawArrays(gl.TRIANGLES, 0, 108);
    }
}

// a View contains camera and lighting information.

export function build_view(gl, fov, camera) {
    let aspect_ratio = gl.canvas.width/gl.canvas.height;
    return new View(mm.perspective_matrix(fov, aspect_ratio, 0.1, 100),
		    mm.inverse_orthogonal(camera),
		    mm.identity_affine(),
		    mm.identity_linear());
}
	    
export class View {
    constructor (p, c, m, n) {
	this.P = p;   // perspective transform, 4d homogenous
	this.C = c;   // camera location, 3d orthogonal affine
	this.M = m;   // model transform, 3d affine (not orthogonal)
	this.N = n;   // normal transform, 3d orthogonal linear
    };
}

export function random_color() {
    return new Float32Array([Math.random(), Math.random(), Math.random()]);
}

export class Camera {
    constructor(obj, f, l) {
	this.object = obj;
	this.fov = f;
	this.location = l;
    }

    draw(gl, t) {
	g.clear_screen(gl);
	let x2 = build_view(gl,this.fov, this.location);
	this.object.draw(gl, x2, t);
    }
}

export class Follower {
    constructor(obj, f, l, p) {
	this.object = obj;
	this.fov = f;
	this.location = l;
	this.followee = p;
    }

    draw(gl, t) {
	let scale = 0.05;

	let x1 = new Float32Array(this.followee.transform);

	x1[9] += 2*x1[3] + 15*x1[6];
	x1[10] += 2*x1[4] + 15*x1[7];
	x1[11] += 2*x1[5] + 15*x1[8];

	/*
	  x1 the transform we want to move to
	  this.location the current transform
	*/

	// translation is the easy part;

	x1[9] = scale*x1[9] + (1-scale)*this.location[9];
	x1[10] = scale*x1[10] + (1-scale)*this.location[10];
	x1[11] = scale*x1[11] + (1-scale)*this.location[11];

	let x2 = mm.interpolate_rotation(this.location, x1, scale);

	this.location[0] = x2[0];
	this.location[1] = x2[1];
	this.location[2] = x2[2];
	this.location[3] = x2[3];
	this.location[4] = x2[4];
	this.location[5] = x2[5];
	this.location[6] = x2[6];
	this.location[7] = x2[7];
	this.location[8] = x2[8];
	this.location[9] = x1[9];
	this.location[10] = x1[10];
	this.location[11] = x1[11];

	g.clear_screen(gl);
	let v = build_view(gl, this.fov, this.location);
	this.object.draw(gl, v, t);
    }
}

