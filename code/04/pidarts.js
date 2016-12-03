"use strict"

var gl;

var Interval = 50000;
var NumPoints = 1000000;
var points = new Float32Array(NumPoints*2);
// Last time that this function was called
var g_last = Date.now();
var currentCount = 0;
var newCount = 0;
var canvas;
var statPrint;
var ctx;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    var hud = document.getElementById("head-up-display");
    statPrint = document.getElementById("statPrint");
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    // Get the rendering context for HUD
    ctx = hud.getContext('2d');
    
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    points[0] = 0.0;
    points[1] = 0.0;
    
    for (var i=1; i<NumPoints; i++){
        var x = Math.random() * 2.0 - 1.0;
        var y = Math.random() * 2.0 - 1.0;
        points[2*i] = x;
        points[2*i+1] = y;
    }

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
    
    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vPosition);
    
    tick();
};

function print() {
  var inc = 0;
  var outc = 0;
  var x, y, distance;
  var total, estimate;
  var string;

  for (var i=0; i<currentCount; i++){
    x = points[2*i];
    y = points[2*i+1];
    distance = x*x + y*y;
    if (distance <= 1.0)
        inc++;
    else
        outc++;
  }
    total = inc+outc;
    estimate = 4.0 * inc / (inc+outc);
    string = inc.toString()+' in, '+outc.toString()+' out '+total.toString()+' total '+' est '+estimate.toString();
    
    // print to console
    //console.log(string);
    
    // print to browser window
    //statPrint.innerHTML = string;
    
    // print to head up display
    draw2D(ctx, string);
}


function draw2D(ctx, string) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '20px "Time New Roman"';
    ctx.fillstyle = 'rgba(255, 255, 255, 1)';
    ctx.fillText(string, 10, 50);
}

// Start drawing
var tick = function() {
    currentCount = animate(currentCount);  // Update the count
    gl.drawArrays(gl.POINTS, 0, currentCount);
    print();
    requestAnimationFrame(tick, canvas); // Request that the browser calls tick
};

function animate(count) {
    // Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
    
    // Update the current count (adjusted by the elapsed time)
    
    // run one pass
    /*
    if (newCount < NumPoints)
    {
        newCount = count + (Interval * elapsed) / 1000.0;
    }
    */
    // repeat
    ///*
    newCount = count + (Interval * elapsed) / 1000.0;
    if (newCount >= NumPoints)
    {
        newCount = newCount - NumPoints;
        gl.clear( gl.COLOR_BUFFER_BIT );
    }
    //*/
    
    return newCount;
}
