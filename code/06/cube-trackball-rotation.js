"use strict";

var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var rotationMatrix;
var ctMatrix;
var ctMatrixLoc;

// for trackball
var m_curquat;
var m_mousex = 1;
var m_mousey = 1;
var trackballMove = false;

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

// for trackball
function mouseMotion( x,  y)
{
        var lastquat;
        if (m_mousex != x || m_mousey != y)
        {
            lastquat = trackball(
                  (2.0*m_mousex - canvas.width) / canvas.width,
                  (canvas.height - 2.0*m_mousey) / canvas.height,
                  (2.0*x - canvas.width) / canvas.width,
                  (canvas.height - 2.0*y) / canvas.height);
            m_curquat = add_quats(lastquat, m_curquat);
            m_mousex = x;
            m_mousey = y;
            //render();
        }
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    // for trackball
    m_curquat = trackball(0, 0, 0, 0);
    
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

    rotationMatrix = mat4();
    ctMatrix = mat4();
    ctMatrixLoc = gl.getUniformLocation(program, "ctMatrix");
    gl.uniformMatrix4fv(ctMatrixLoc, false, flatten(ctMatrix));

    // for trackball
    canvas.addEventListener("mousedown", function(event){
        m_mousex = event.clientX - event.target.getBoundingClientRect().left;
        m_mousey = event.clientY - event.target.getBoundingClientRect().top;
        trackballMove = true;
    });

    // for trackball
    canvas.addEventListener("mouseup", function(event){
        trackballMove = false;
    });

    // for trackball
    canvas.addEventListener("mousemove", function(event){
      if (trackballMove) {
        var x = event.clientX - event.target.getBoundingClientRect().left;
        var y = event.clientY - event.target.getBoundingClientRect().top;
        mouseMotion(x, y);
      }
    } );

    render();

}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
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
    // solution 1, flipping z in shader
    // you should uncomment "gl_Position.z = -gl_Position.z;" in shader
/*
        // for trackball
        var m_inc = build_rotmatrix(m_curquat);
        ctMatrix = mult(m_inc, rotationMatrix);
        gl.uniformMatrix4fv(ctMatrixLoc, false, flatten(ctMatrix));
*/
    // solution 2, use orthogonal projection, flipping z
    // you should comment out "gl_Position.z = -gl_Position.z;" in shader
///*
        // for trackball
        var m_inc = build_rotmatrix(m_curquat);
        ctMatrix = mult(m_inc, rotationMatrix);
        ctMatrix = mult(ortho(-1, 1, -1, 1, -1, 1), ctMatrix);
        gl.uniformMatrix4fv(ctMatrixLoc, false, flatten(ctMatrix));
//*/
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    requestAnimFrame( render );
}