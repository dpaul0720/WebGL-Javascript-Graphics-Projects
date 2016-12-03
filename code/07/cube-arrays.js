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
                    [ 1.0, 1.0, 1.0, 1.0 ],  // white
                    [ 0.0, 1.0, 1.0, 1.0 ]   // cyan
];

var rxyz;

var pm = mat4(1.0); // identity matrix

// Compute the sines and cosines of theta for each of
//   the three axes in one computation.
var rotateSpeed = 0.5;
var angles = (Math.PI / 180) * (rotateSpeed);
var c = Math.cos( angles );
var s = Math.sin( angles );

var ctMatrix = mat4(1.0);
var ctMatrixLoc;

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
        colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        //colors.push(vertexColors[a]);

    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    pm = mult(rxyz[axis], pm);
    
    ctMatrix = mult(lookAt(vec3(0.0, 0.0, 3.0),
                           vec3(0.0, 0.0, 0.0),
                           vec3(0.0, 1.0, 0.0)), pm);

    //ctMatrix = mult(ortho(-1, 1, -1, 1, -1, 1), pm);
    ctMatrix = mult(perspective(45, 1.0, 0.1, 10.0), ctMatrix);
    
    gl.uniformMatrix4fv(ctMatrixLoc, false, flatten(ctMatrix));
    
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    requestAnimFrame( render );
}
