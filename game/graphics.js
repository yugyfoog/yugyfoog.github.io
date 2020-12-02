"use strict";

// initialize webgl.
//    The HTML file should have a canvas tag with an id="canvas3d"
//    Use HTML/CSS to size the canvas
//    If the canvas size is static, call resize_display() once before drawing
//    If the canvas size can change, call resize_display() before drawing each frame.

export function init_graphics() {
    let gl = document.querySelector("#canvas3d").getContext("webgl");
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);
    return gl;
}

// create a WebGL program from shader sources.

export function new_program(gl, vertex_source, fragment_source) {
    let vs = create_shader(gl, gl.VERTEX_SHADER, vertex_source);
    let fs = create_shader(gl, gl.FRAGMENT_SHADER, fragment_source);
    return create_program(gl, vs, fs);
}

// create a OpenGL program with shaders

export function create_program(gl, vertex_shader, fragment_shader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertex_shader);
    gl.attachShader(program, fragment_shader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
	return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

// compile a shader from source

export function create_shader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success)
	return shader;
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

export function clear_screen(gl) {
    resize_display(gl);
    clear(gl);
}

// resize the gl.canvas size to match the html canvas size.
//    call this function before drawing each frame if the html canvas can change its size.

export function resize_display(gl) {
    let pixel_ratio = window.devicePixelRatio;
    
    let display_width = Math.floor(pixel_ratio*gl.canvas.clientWidth);
    let display_height = Math.floor(pixel_ratio*gl.canvas.clientHeight);
    if (gl.canvas.width !== display_width || gl.canvas.height !== display_height) {
	gl.canvas.width = display_width;
	gl.canvas.height = display_height;
    }
}

// clear the color buffer

export function clear(gl) {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.70, 0.80, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
}

// draw a triangle

export function triangle(gl, verticies) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticies), gl.STATIC_DRAW);
}

// draw a rectangle

export function rectangle(gl, x, y, width, height) {
    let x1 = x;
    let x2 = x + width;
    let y1 = y;
    let y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	x1, y1,
	x2, y1,
	x1, y2,
	x1, y2,
	x2, y1,
	x2, y2]), gl.STATIC_DRAW);
}
