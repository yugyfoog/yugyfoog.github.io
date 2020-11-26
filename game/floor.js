import * as g from "./graphics.js";
import * as m from "./mmath.js";

// hand build a checker board floor object

export class floor {
    constructor(gl) {
	let vertex_shader_source =
	    "attribute vec4 position;\n" +
	    "attribute vec4 acolor;\n" +
	    "uniform mat4 trans;\n" +
	    "varying vec4 vcolor;\n" +
	    "void main() {\n" +
	    "    gl_Position = trans*position;\n" +
	    "    vcolor = acolor;\n" +
	    "}\n";

	let fragment_shader_source =
	    "precision mediump float;\n" +
	    "varying vec4 vcolor;\n" +
	    "void main() {\n" +
	    "    gl_FragColor = vcolor;\n" +
	    "}\n";


	this.program = g.new_program(gl, vertex_shader_source, fragment_shader_source);
	gl.useProgram(this.program);

	this.position_attribute = gl.getAttribLocation(this.program, "position");
	this.position_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);

	this.positionsx = new Float32Array(50*50*18);
	this.colorsx = new Float32Array(50*50*18);
	let black = new Float32Array([0.1, 0.1, 0.1]);
	let white = new Float32Array([0.9, 0.9, 0.9]);
	let color;
	let k = 0;
	
	for (let i = 0; i < 50; i++) {
	    for (let j = 0; j < 50; j++) {
		if (((i+j)&1) === 0)
		    color = black
		else
		    color = white

		this.positionsx[k] = i;
		this.colorsx[k++] = color[0]
		this.positionsx[k] = 0;
		this.colorsx[k++] = color[1]
		this.positionsx[k] = j;
		this.colorsx[k++] = color[2]
		
		this.positionsx[k] = i;
		this.colorsx[k++] = color[0];
		this.positionsx[k] = 0;
		this.colorsx[k++] = color[1];
		this.positionsx[k] = j+1;
		this.colorsx[k++] = color[2];

		this.positionsx[k] = i+1;
		this.colorsx[k++] = color[0];
		this.positionsx[k] = 0;
		this.colorsx[k++] = color[1];
		this.positionsx[k] = j+1;
		this.colorsx[k++] = color[2];

		this.positionsx[k] = i;
		this.colorsx[k++] = color[0];
		this.positionsx[k] = 0;
		this.colorsx[k++] = color[1];
		this.positionsx[k] = j;
		this.colorsx[k++] = color[2];

		this.positionsx[k] = i+1;
		this.colorsx[k++] = color[0];
		this.positionsx[k] = 0;
		this.colorsx[k++] = color[1];
		this.positionsx[k] = j+1;
		this.colorsx[k++] = color[2];

		this.positionsx[k] = i+1;
		this.colorsx[k++] = color[0];
		this.positionsx[k] = 0;
		this.colorsx[k++] = color[1];
		this.positionsx[k] = j;
		this.colorsx[k++] = color[2];
		
	    }
	}

	gl.bufferData(gl.ARRAY_BUFFER, this.positionsx, gl.STATIC_DRAW);

	this.color_attribute = gl.getAttribLocation(this.program, "acolor");
	this.color_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);

	gl.bufferData(gl.ARRAY_BUFFER, this.colorsx, gl.STATIC_DRAW);
    }

    draw(gl, view) {
	gl.useProgram(this.program);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
	gl.vertexAttribPointer(this.position_attribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.position_attribute);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
	gl.vertexAttribPointer(this.color_attribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.color_attribute);

	let trans_location = gl.getUniformLocation(this.program, "trans");

	let trans = m.multiply_homogeneous_affine(view.P, m.multiply_affine_affine(view.C, view.M));
	gl.uniformMatrix4fv(trans_location, false, trans);
	
	gl.drawArrays(gl.TRIANGLES, 0, 50*50*6);
    }
}
