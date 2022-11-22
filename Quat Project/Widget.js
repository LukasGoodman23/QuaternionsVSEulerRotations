'use strict'

class Widget {
    
    constructor(gl, program, posName, ltName, originName, edges, canvas, shaderIndex) {
        this.canvas= canvas;
        this.visible = true;
	    this.size = edges.length;
	    this.SetupVBO(gl, edges);
        this.originName= originName;
        this.program= program;
        this.shaderIndex= shaderIndex;

        this.FindMove(edges);

	    this.vpos =  gl.getAttribLocation(program, posName);
	    this.localTransform = gl.getUniformLocation(program, ltName);

        this.Viewport(0,0,this.canvas.width, this.canvas.height);
    }


    // I want the thing centered on 0,0 and scaled nicely to fit in the 
    // view cube.
    FindMove(edges) {
        // ... is a flatten operation
        // originally i did let upperRight = edges[0]
        // but that did not do a deep copy.
        let lowerLeft = [...edges[0]] 
        let upperRight = [...edges[0]];

        // find the corners of the bounding box.
        for(let i = 1; i< edges.length; ++i) {
            for(let j=0; j < 3; ++j) {
                lowerLeft[j] = Math.min(lowerLeft[j], edges[i][j]);
                upperRight[j] = Math.max(upperRight[j], edges[i][j]);
            }
        }

        // find the dimensions of the bounding box.
        let diff = subtract(upperRight, lowerLeft);


        // start with the identity matrix.
        this.transform = mat4(1)

        // find the center of the bounding box.
        let diff2 = mult(diff, [1/2, 1/2, 1/2]);
        let center = add(lowerLeft,diff2);
        center = mult(center, [-1,-1,-1]);

        //send over the center coordinates
        let origin= this.canvas.GL().getUniformLocation(this.canvas.Program(), this.originName);
        this.canvas.GL().uniform3fv(origin, center);

        let max = Math.max(...diff);
        // this is a guess so it looks nice.
        let scale = 1.7/max;

        //Then scale it.
        this.transform = mult(this.transform, scalem(scale,scale,scale));
        // translate the center to 0,0,0
        this.transform = mult(this.transform, translate(center))
    }

    SetupVBO(gl, edges) {
        this.vbuf =  gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuf);
	    gl.bufferData(gl.ARRAY_BUFFER,flatten(edges),gl.STATIC_DRAW);
    }

    Show() {
        this.visible = true;
    }

    Hide() {
        this.visible = false;
    }

    Visible() {
        return this.visible;
    }

    Viewport(x,y,w,h) {
        this.vx = x;
        this.vy = y;
        this.vw = w;
        this.vh = h;
    }

    Display(gl) {
        if (this.visible) {

            let shader= gl.getUniformLocation(this.program, 'shaderIndex');
            gl.uniform1f(shader, this.shaderIndex);

            // send over the first transformation matrix
            gl.uniformMatrix4fv(this.localTransform, false, flatten(this.transform));

            gl.viewport(this.vx, this.vy, this.vw, this.vh);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuf);

            gl.vertexAttribPointer(this.vpos, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.vpos);

            for(let i =0; i < this.size;++i) {
                gl.drawArrays(gl.LINE_LOOP, 3*i, 3);
            }
	    }
    }
}
