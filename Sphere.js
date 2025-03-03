function sin(t) {
    return Math.sin(t);
}
function cos(t) {
    return Math.cos(t);
}

class Sphere {
    constructor() {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.verts32 = new Float32Array([]);
        this.matrix.translate(2, 1, -3); 
    }

    render() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var d = Math.PI / 20; 
        var dd = Math.PI / 20;

        var v1 = [];
        var uv1 = [];
        var v2 = [];
        var uv2 = [];

        for (var t = 0; t < Math.PI; t += d) {
            for (var r = 0; r < (2 * Math.PI); r += d) {
                var distortion = 0.05 * sin(10 * t) * cos(10 * r); 
                
                var p1 = [(sin(t) + distortion) * cos(r), (sin(t) + distortion) * sin(r), cos(t)];
                var p2 = [(sin(t + dd) + distortion) * cos(r), (sin(t + dd) + distortion) * sin(r), cos(t + dd)];
                var p3 = [(sin(t) + distortion) * cos(r + dd), (sin(t) + distortion) * sin(r + dd), cos(t)];
                var p4 = [(sin(t + dd) + distortion) * cos(r + dd), (sin(t + dd) + distortion) * sin(r + dd), cos(t + dd)];
                
                v1 = v1.concat(p1); uv1 = uv1.concat([0, 0]);
                v1 = v1.concat(p2); uv1 = uv1.concat([0, 1]);
                v1 = v1.concat(p4); uv1 = uv1.concat([1, 1]);
                
                v2 = v2.concat(p1); uv2 = uv2.concat([0, 0]);
                v2 = v2.concat(p4); uv2 = uv2.concat([1, 1]);
                v2 = v2.concat(p3); uv2 = uv2.concat([1, 0]);
            }
        }
        
        gl.uniform4f(u_FragColor, 0.5, 0.0, 0.5, 1);
        drawTriangle3DUVNormal(v1, uv1, v1);
        gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1);
        drawTriangle3DUVNormal(v2, uv2, v2);
    }
}
