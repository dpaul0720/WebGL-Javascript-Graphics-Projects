"use strict";

var gl;
var offset = 0.0;
var vOffset;
var increment = 0.01;
var vertices = [];

// The onload event occurs when all the script files are read;
// it causes init() function to be executed
window.onload = function init()
{
    // create WebGL context which is a JavaScript object that contains all the WebGL
    // functions and parameters
    // "gl-canvas" is the id of the canvas specified in the HTML file
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points

    vertices.push(0.0);
    vertices.push(0.0);

    for( var i=0; i<=360; i+=10){
      vertices.push(0.5*Math.cos(i*Math.PI/180));
      vertices.push(0.5*Math.sin(i*Math.PI/180));
    }
    console.log(vertices.length);
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    // create a vertex buffer object (VBO) in the GPU and later place our data in that object
    var bufferId = gl.createBuffer();
    // gl.ARRAY_BUFFER: vertex attribute data rather than indices to data
    // the binding operation makes this buffer the current buffer until a differ buffer is binded
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );

    // gl.bufferData accepts only arrays of native data type values and not JavaScript objects;
    // function flatten (defined in MV.js) converts JavaScript objects into the data format
    // accepted by gl.bufferData
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    // gl.getAttribLocation returns the index of an attribute variable in the vertex shader
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    // describe the form of the data in the vertex array
    // 4th parameter false: no data normalization;
    // 5th parameter 0: values are contiguous;
    // 6th parameter 0: address in the buffer where the data begin
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    // enable the vertex attributes that are in the shader
    gl.enableVertexAttribArray( vPosition );

    // Initialize event handlers
    document.getElementById("Offset").onclick = function () {
        if (offset>=0.5)
        {
            increment = increment * -1.0;
        }
        else if (offset<=-0.5)
        {
            increment = increment * -1.0;
        }
          offset += increment;
    };

    vOffset = gl.getUniformLocation( program, "vOffset" );
    
    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.uniform1f( vOffset, offset );
    // draw the data as an array of points
    gl.drawArrays( gl.TRIANGLE_FAN, 0, vertices.length / 2 );
    requestAnimFrame(render);
}
