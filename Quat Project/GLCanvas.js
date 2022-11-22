'use strict'

class Canvas {
    constructor (width, height) {
        this.height = height;
        this.width = width;

        this.MakeCanvas();

        this.SetupGL();
        this.MakeShaders();

        this.Init();
    }


    // I don't want to expose the undrlying canvas.
    AddKeypress(Keypress) {
        this.canvas.addEventListener("keypress", Keypress);
    }

    MakeCanvas() {
        if (this.width == undefined || this.width < 0) {
           this.width = 300;
        }

        if (this.height == undefined || this.height < 0) {
           this.height = 300;
        }

         this.canvas = document.createElement('canvas')
	 this.canvas.tabIndex=0;
         this.canvas.height = this.height;
         this.canvas.width = this.width;
         this.canvas.style="border:1px solid #000000;"

         document.body.appendChild(this.canvas);
    }

    SetupGL() {
        this.gl = WebGLUtils.setupWebGL(this.canvas);
        if (!this.gl) {
            alert ("WebGL isn't available");
	    return;
        }
	this.gl.getExtension('OES_standard_derivatives');
    }

    MakeShaders() {
        this.program = initShaders(this.gl, "vertex-shader","fragment-shader");
        this.gl.useProgram(this.program);
    }

    Init() {
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.viewport(0,0, this.width, this.height);
    }

    Program() {
       return this.program;
    }

    GL() {
       return this.gl;
    }

    Clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
}
