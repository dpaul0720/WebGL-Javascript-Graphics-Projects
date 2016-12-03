"use strict";

var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;

var vertices = [
                vec4( -0.5, -0.5,  0.5, 1.0 ),
                vec4( -0.5,  0.5,  0.5, 1.0 ),
                vec4(  0.5,  0.5,  0.5, 1.0 ),
                vec4(  0.5, -0.5,  0.5, 1.0 ),
                vec4( -0.5, -0.5, -0.5, 1.0 ),
                vec4( -0.5,  0.5, -0.5, 1.0 ),
                vec4(  0.5,  0.5, -0.5, 1.0 ),
                vec4(  0.5, -0.5, -0.5, 1.0 )
                ];

var vertexColors = [
                    [ 0.0, 0.0, 0.0, 1.0 ],  // black
                    [ 1.0, 0.0, 0.0, 1.0 ],  // red
                    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
                    [ 0.0, 1.0, 0.0, 1.0 ],  // green
                    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
                    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
                    [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
                    [ 1.0, 1.0, 1.0, 1.0 ]   // white
];

var rxyz, ctMatrixLoc;

var rMatrix = mat4(1.0); // identity matrix
var ctMatrix; // current transformation matrix

// Compute the sines and cosines of theta for each of
//   the three axes in one computation.
var rotateSpeed = 1.0;
var angles = (Math.PI / 180) * (rotateSpeed);
var c = Math.cos( angles );
var s = Math.sin( angles );

rxyz = [mat4( 1.0,  0.0,  0.0, 0.0,
	          0.0,  c,    -s,  0.0,
	          0.0,  s,    c,   0.0,
	          0.0,  0.0,  0.0, 1.0 ),
	mat4( c,   0.0,  s,   0.0,
	      0.0, 1.0,  0.0, 0.0,
	      -s,  0.0,  c,   0.0,
	      0.0, 0.0,  0.0, 1.0 ),
	mat4( c,    -s,  0.0, 0.0,
          s,    c,   0.0, 0.0,
          0.0,  0.0, 1.0, 0.0,
          0.0,  0.0, 0.0, 1.0 )
       ];

var radius = 0.5;
var theta = 0.0;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    
    ctMatrixLoc = gl.getUniformLocation(program, "ctMatrix");

    //event listeners for buttons

    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };

    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 ); // front face +z, red
    quad( 2, 3, 7, 6 ); // right face +x, yellow
    quad( 3, 0, 4, 7 ); // bottom face -y, green
    quad( 6, 5, 1, 2 ); // top face +y, cyan
    quad( 4, 5, 6, 7 ); // back face -z, blue
    quad( 5, 4, 0, 1 ); // left face -x, magenta
}

function quad(a, b, c, d)
{

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        
        // for interpolated colors use
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);

    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // this is correct order of multiplication
    // p stores the current tranformation matrix
    // rxyz[axis] is the new rotation matrix added
    // every time during the animation
    
    //rMatrix = mat4(1.0); // for testing only, turn off local rotations
    rMatrix = mult(rxyz[axis], rMatrix);
    
///*
    theta += 1; // in degree
    // object instancing matrix = translate * rotate * scale
    ctMatrix = mult(rMatrix, scalem(0.15, 0.15, 0.15));
    ctMatrix = mult(translate(radius, 0.0, 0.0), ctMatrix);
    // one more rotation along the z
    //ctMatrix = mult(rotateZ(theta), ctMatrix);
//*/
    
/*
    theta += 0.02; // in radian
    ctMatrix = mult(rMatrix, scalem(0.15, 0.15, 0.15));
    ctMatrix = mult(translate(radius*Math.cos(theta), radius*Math.sin(theta), 0.0), ctMatrix);
    // if you do this way, you are only doing a translation in the end
    //ctMatrix = mult(translate(radius, 0.0, 0.0), ctMatrix);
    
*/
    
    // ortho(): 5th parameter "near", 6th parameter "far"
    // we know that the z direction is pointing outward,
    // so "near" should be 1 and "far" should be -1
    // but we set "near" to -1 and "far" to 1 to flip z!
    ctMatrix = mult(ortho(-1, 1, -1, 1, -1, 1), ctMatrix);
    gl.uniformMatrix4fv(ctMatrixLoc, false, flatten(ctMatrix));

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    requestAnimFrame( render );
}
