"use strict";

var canvas;
var gl;

var theta = 0.0;
var baseColorLoc;

var ctm;
var ctmLoc;

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

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var vertices = [
        vec2(  0,  1 ),
        vec2(  1,  0 ),
        vec2( -1,  0 ),
        vec2(  0, -1 )
    ];
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    baseColorLoc = gl.getUniformLocation( program, "baseColor" );
    ctmLoc = gl.getUniformLocation( program, "ctMatrix" );

    var pmLoc = gl.getUniformLocation( program, "projMatrix" );
    var pm = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
    gl.uniformMatrix4fv(pmLoc, false, flatten(pm));
    
    render();
};


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    theta += 1.0; // in degree
    var scaling_l = 0.25;
    var scaling_s = 0.025;
    var trans = 0.5;
    
    var rm = rotateZ(theta);
    var sm = scalem(scaling_l, scaling_l, scaling_l);
    var tm = translate(trans, 0.0, 0.0);
    
    ctm = mat4();
    
// since we have three transformations here, we will explore six different ways of concatenation of these three matrices (translation, rotation, scaling)
    
/*
    // #1 ctm = trans * rot * scale
    ctm = mult(sm, ctm);
    ctm = mult(rm, ctm);
    ctm = mult(tm, ctm);
    
*/
    
/*
    // #2 ctm = trans * scale * rot
    ctm = mult(rm, ctm);
    ctm = mult(sm, ctm);
    ctm = mult(tm, ctm);
 
*/

/*
    // #3 ctm = rot * trans * scale
    ctm = mult(sm, ctm);
    ctm = mult(tm, ctm);
    ctm = mult(rm, ctm);

*/


///*
    // #4 ctm = scale * trans * rot
 ctm = mult(rm, ctm);
 ctm = mult(tm, ctm);
 ctm = mult(sm, ctm);

//*/
    
/*
    // #5 ctm = rot * scale * trans

*/

/*
    // #6 ctm = scale * rot * trans

*/
    
    // orthogonal projection
    
    gl.uniform3fv( baseColorLoc, vec3( 1.0, 0.0, 0.0 ) );
    gl.uniformMatrix4fv(ctmLoc, false, flatten(ctm));

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
    
    // orthogonal projection
    

    gl.uniform3fv( baseColorLoc, vec3( 0.0, 0.0, 0.0 ) );
    ctm = mat4();
    sm = scalem(scaling_s, scaling_s, scaling_s);
    ctm = mult(sm, ctm);
    gl.uniformMatrix4fv(ctmLoc, false, flatten(ctm));
    
    // draw the 2nd square as the origin for reference
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
    
    window.requestAnimFrame(render);
}
