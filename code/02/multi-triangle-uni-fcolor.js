"use strict";

var gl;
var colorLoc;

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

    // Three vertices
    
    var vertices = [
        vec2( -0.75, -0.75 ),
        vec2(  -0.5,  -0.25 ),
        vec2(  -0.25, -0.75 ),
        vec2( 0.25, 0.25 ),
        vec2(  0.5,  0.75 ),
        vec2(  0.75, 0.25 )
    ];

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
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

    colorLoc = gl.getUniformLocation( program, "color" );

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    // draw the data as an array of points
    gl.uniform4fv( colorLoc, vec4(1.0, 0.0, 0.0, 1.0));
    gl.drawArrays( gl.TRIANGLES, 0, 3 );
    gl.uniform4fv( colorLoc, vec4(0.0, 0.0, 1.0, 1.0));
    gl.drawArrays( gl.TRIANGLES, 3, 3 );
}
