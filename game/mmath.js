export function random_int(high) {
    return Math.floor(high*Math.random());
}

export function identity_linear() {
    return new Float32Array([
	1, 0, 0,
	0, 1, 0,
	0, 0, 1]);
}

export function identity_affine() {
    return new Float32Array([
	1, 0, 0,
	0, 1, 0,
	0, 0, 1,
	0, 0, 0]);
}

export function identity_homogeneous() {
    return new Float32Array([
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1]);
}

export function orthogonal_matrix(left, right, bottom, top, near, far) {
    return new Float32Array([
	2/(right-left), 0, 0, 0,
	0, 2/(top-bottom), 0, 0,
	0, 0, -2/(far-near), 0,
	-(right + left)/(right-left), (top + bottom)/(bottom - top),
	(far + near)/(near - far), 1]);
}

export function perspective_matrix(fov, ar, near, far) {
    let f = 1/Math.tan(fov/2);
    let irange = 1/(near - far);
    return new Float32Array([
        f/ar, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near+far)*irange, -1,
        0, 0, 2*near*far*irange, 0]);
}

export function translate(A, v) {
    let B = new Float32Array(A);
    B[9] += v[0];
    B[10] += v[1];
    B[11] += v[2];
    return B;
}

export function multiply_linear_linear(A, B) {
    let C = new Float32Array(9);

    C[0] = A[0]*B[0] + A[3]*B[1] + A[6]*B[2];
    C[1] = A[1]*B[0] + A[4]*B[1] + A[7]*B[2];
    C[2] = A[2]*B[0] + A[5]*B[1] + A[8]*B[2];
    C[3] = A[0]*B[3] + A[3]*B[4] + A[6]*B[5];
    C[4] = A[1]*B[3] + A[4]*B[4] + A[7]*B[5];
    C[5] = A[2]*B[3] + A[5]*B[4] + A[8]*B[5];
    C[6] = A[0]*B[6] + A[3]*B[7] + A[6]*B[8];
    C[7] = A[1]*B[6] + A[4]*B[7] + A[7]*B[8];
    C[8] = A[2]*B[6] + A[5]*B[7] + A[8]*B[8];

    return C;
}

export function multiply_affine_linear(A, B) {
    let C = new Float32Array(12);

    C[0] = A[0]*B[0] + A[3]*B[1] + A[6]*B[2];
    C[1] = A[1]*B[0] + A[4]*B[1] + A[7]*B[2];
    C[2] = A[2]*B[0] + A[5]*B[1] + A[8]*B[2];
    C[3] = A[0]*B[3] + A[3]*B[4] + A[6]*B[5];
    C[4] = A[1]*B[3] + A[4]*B[4] + A[7]*B[5];
    C[5] = A[2]*B[3] + A[5]*B[4] + A[8]*B[5];
    C[6] = A[0]*B[6] + A[3]*B[7] + A[6]*B[8];
    C[7] = A[1]*B[6] + A[4]*B[7] + A[7]*B[8];
    C[8] = A[2]*B[6] + A[5]*B[7] + A[8]*B[8];
    C[9] = A[9];
    C[10] = A[10];
    C[11] = A[11];

    return C;
}

export function multiply_linear_affine(A, B) {
    let C = new Float32Array(12);
    
    C[0] = A[0]*B[0] + A[3]*B[1] + A[6]*B[2];
    C[1] = A[1]*B[0] + A[4]*B[1] + A[7]*B[2];
    C[2] = A[2]*B[0] + A[5]*B[1] + A[8]*B[2];
    C[3] = A[0]*B[3] + A[3]*B[4] + A[6]*B[5];
    C[4] = A[1]*B[3] + A[4]*B[4] + A[7]*B[5];
    C[5] = A[2]*B[3] + A[5]*B[4] + A[8]*B[5];
    C[6] = A[0]*B[6] + A[3]*B[7] + A[6]*B[8];
    C[7] = A[1]*B[6] + A[4]*B[7] + A[7]*B[8];
    C[8] = A[2]*B[6] + A[5]*B[7] + A[8]*B[8];
    C[9] = A[0]*B[9] + A[3]*B[10] + A[6]*B[11];
    C[10] = A[1]*B[9] + A[4]*B[10] + A[7]*B[11];
    C[11] = A[2]*B[9] + A[5]*B[10] + A[8]*B[11];

    return C;
}
    
export function multiply_affine_affine(A, B) {
    let C = new Float32Array(12);
    
    C[0] = A[0]*B[0] + A[3]*B[1] + A[6]*B[2];
    C[1] = A[1]*B[0] + A[4]*B[1] + A[7]*B[2];
    C[2] = A[2]*B[0] + A[5]*B[1] + A[8]*B[2];
    C[3] = A[0]*B[3] + A[3]*B[4] + A[6]*B[5];
    C[4] = A[1]*B[3] + A[4]*B[4] + A[7]*B[5];
    C[5] = A[2]*B[3] + A[5]*B[4] + A[8]*B[5];
    C[6] = A[0]*B[6] + A[3]*B[7] + A[6]*B[8];
    C[7] = A[1]*B[6] + A[4]*B[7] + A[7]*B[8];
    C[8] = A[2]*B[6] + A[5]*B[7] + A[8]*B[8];
    C[9] = A[0]*B[9] + A[3]*B[10] + A[6]*B[11] + A[9];
    C[10] = A[1]*B[9] + A[4]*B[10] + A[7]*B[11] + A[10];
    C[11] = A[2]*B[9] + A[5]*B[10] + A[8]*B[11] + A[11];

    return C;
}

export function multiply_homogeneous_affine(A, B) {
    let C = new Float32Array(16);
    
    C[0] = A[0]*B[0] + A[4]*B[1] + A[8]*B[2];
    C[1] = A[1]*B[0] + A[5]*B[1] + A[9]*B[2];
    C[2] = A[2]*B[0] + A[6]*B[1] + A[10]*B[2];
    C[3] = A[3]*B[0] + A[7]*B[1] + A[11]*B[2];
    C[4] = A[0]*B[3] + A[4]*B[4] + A[8]*B[5];
    C[5] = A[1]*B[3] + A[5]*B[4] + A[9]*B[5];
    C[6] = A[2]*B[3] + A[6]*B[4] + A[10]*B[5];
    C[7] = A[3]*B[3] + A[7]*B[4] + A[11]*B[5];
    C[8] = A[0]*B[6] + A[4]*B[7] + A[8]*B[8];
    C[9] = A[1]*B[6] + A[5]*B[7] + A[9]*B[8];
    C[10] = A[2]*B[6] + A[6]*B[7] + A[10]*B[8];
    C[11] = A[3]*B[6] + A[7]*B[7] + A[11]*B[8];
    C[12] = A[0]*B[9] + A[4]*B[10] + A[8]*B[11] + A[12];
    C[13] = A[1]*B[9] + A[5]*B[10] + A[9]*B[11] + A[13];
    C[14] = A[2]*B[9] + A[6]*B[10] + A[10]*B[11] + A[14];
    C[15] = A[3]*B[9] + A[7]*B[10] + A[11]*B[11] + A[15];
    
    return C;
}

export function multiply_homogeneous_homogeneous(A, B) {
    let C = new Float32Array(16);

    C[0] = A[0]*B[0] + A[4]*B[1] + A[8]*B[2] + A[12]*B[3];
    C[1] = A[1]*B[0] + A[5]*B[1] + A[9]*B[2] + A[13]*B[3];
    C[2] = A[2]*B[0] + A[6]*B[1] + A[10]*B[2] + A[14]*B[3];
    C[3] = A[3]*B[0] + A[7]*B[1] + A[11]*B[2] + A[15]*B[3];
    C[4] = A[0]*B[4] + A[4]*B[5] + A[8]*B[6] + A[12]*B[7];
    C[5] = A[1]*B[4] + A[5]*B[5] + A[9]*B[6] + A[13]*B[7];
    C[6] = A[2]*B[4] + A[6]*B[5] + A[10]*B[6] + A[14]*B[7];
    C[7] = A[3]*B[4] + A[7]*B[5] + A[11]*B[6] + A[15]*B[7];
    C[8] = A[0]*B[8] + A[4]*B[9] + A[8]*B[10] + A[12]*B[11];
    C[9] = A[1]*B[8] + A[5]*B[9] + A[9]*B[10] + A[13]*B[11];
    C[10] = A[2]*B[8] + A[6]*B[9] + A[10]*B[10] + A[14]*B[11];
    C[11] = A[3]*B[8] + A[7]*B[9] + A[11]*B[10] + A[15]*B[11];
    C[12] = A[0]*B[12] + A[4]*B[13] + A[8]*B[14] + A[12]*B[15];
    C[13] = A[1]*B[12] + A[5]*B[13] + A[9]*B[14] + A[13]*B[15];
    C[14] = A[2]*B[12] + A[6]*B[13] + A[10]*B[14] + A[14]*B[15];
    C[15] = A[3]*B[12] + A[7]*B[13] + A[11]*B[14] + A[15]*B[15];
    
    return C;
}
    
// calculate the invere of an affine transform where the linear part is orthogonal

export function inverse_orthogonal(A) {
    let B = new Float32Array(12);

    B[0] = A[0];  B[1] = A[3];  B[2] = A[6];
    B[3] = A[1];  B[4] = A[4];  B[5] = A[7];
    B[6] = A[2];  B[7] = A[5];  B[8] = A[8];
    B[9] = -(A[0]*A[9] + A[1]*A[10] + A[2]*A[11]);
    B[10] = -(A[3]*A[9] + A[4]*A[10] + A[5]*A[11]);
    B[11] = -(A[6]*A[9] + A[7]*A[10] + A[8]*A[11]);

    return B;
}


