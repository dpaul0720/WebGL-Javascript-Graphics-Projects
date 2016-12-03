// metaball example
// Jamie Wong
// http://jamie-wong.com/2016/07/06/metaballs-and-webgl/

"use strict";

var canvas;
var gl;

var NUM_METABALLS = 5;
var WIDTH;
var HEIGHT;

var vertices = [];
var metaballs = [];
var metaballsLoc;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );

    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    console.log(WIDTH);
    console.log(HEIGHT);
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    vertices.push(vec2(-1.0, 1.0));
    vertices.push(vec2(-1.0, -1.0));
    vertices.push(vec2(1.0, 1.0));
    vertices.push(vec2(1.0, -1.0));

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    for (var i = 0; i < NUM_METABALLS; i++) {
        var radius = Math.random() * 60 + 10;
        metaballs.push({
                       x: Math.random() * (WIDTH - 2 * radius) + radius,
                       y: Math.random() * (HEIGHT - 2 * radius) + radius,
                       vx: Math.random() * 10 - 5,
                       vy: Math.random() * 10 - 5,
                       r: radius
                       });
    }
    console.log(metaballs[1]);

    metaballsLoc = gl.getUniformLocation(program, 'metaballs');
    
    var widthLoc = gl.getUniformLocation(program, 'width'); // Connect with shader
    gl.uniform1f(widthLoc, WIDTH * 1.0);                    // Sends new data to shader

    var heightLoc = gl.getUniformLocation(program, 'height');
    gl.uniform1f(heightLoc, HEIGHT * 1.0);
    
    render();

};

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    // Update positions and speeds
    
    for (var i = 0; i < NUM_METABALLS; i++) {
        var mb = metaballs[i];
        
        mb.x += mb.vx;
        if (mb.x - mb.r < 0) {
            mb.x = mb.r + 1;
            mb.vx = Math.abs(mb.vx);
        } else if (mb.x + mb.r > WIDTH) {
            mb.x = WIDTH - mb.r;
            mb.vx = -Math.abs(mb.vx);
        }
        mb.y += mb.vy;
        if (mb.y - mb.r < 0) {
            mb.y = mb.r + 1;
            mb.vy = Math.abs(mb.vy);
        } else if (mb.y + mb.r > HEIGHT) {
            mb.y = HEIGHT - mb.r;
            mb.vy = -Math.abs(mb.vy);
        }
    }
        console.log(metaballs[1]);
    
    // To send the data to the GPU, we first need to
    // flatten our data into a single array.
    var dataToSendToGPU = new Float32Array(3 * NUM_METABALLS);
    for (var i = 0; i < NUM_METABALLS; i++) {
        var baseIndex = 3 * i;
        var mb = metaballs[i];
        dataToSendToGPU[baseIndex + 0] = mb.x;
        dataToSendToGPU[baseIndex + 1] = mb.y;
        dataToSendToGPU[baseIndex + 2] = mb.r;
    }
        console.log(metaballs[1]);
    gl.uniform3fv(metaballsLoc, dataToSendToGPU);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    //window.requestAnimFrame(render);
}
