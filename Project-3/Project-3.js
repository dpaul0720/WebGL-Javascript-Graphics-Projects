"use strict";

var canvas;
var gl;

var theta;
var baseColorLoc;
var circlecount;
var colors = [];
var vertices = [];
var otm;
var outerMat = [];
var inm;
var innerMat = [];
var ctm;
var centerMat = [];
var hour;
var hourMat = [];
var minute;
var minuteMat = [];
var ctmLoc;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    vertices.push(0.0);
    vertices.push(0.0);

    for( var i=0; i<=360; i+=10){
      vertices.push(0.95*Math.cos(i*Math.PI/180));
      vertices.push(0.95*Math.sin(i*Math.PI/180));
    }
    circlecount = vertices.length / 2;

    vertices.push(-0.15);
    vertices.push(-0.04);
    vertices.push(-0.15);
    vertices.push(0.04);
    vertices.push(0.15);
    vertices.push(0.04);
    vertices.push(0.15);
    vertices.push(-0.04);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    baseColorLoc = gl.getUniformLocation( program, "baseColor" );
    ctmLoc = gl.getUniformLocation( program, "modelMatrix" );

    var pmLoc = gl.getUniformLocation( program, "projMatrix" );
    var pm = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
    gl.uniformMatrix4fv(pmLoc, false, flatten(pm));
    
    render();
};


function render() {
    var scaling_l;
    var sm;
    var tm;
    var rm;
    var trans;
    gl.clear( gl.COLOR_BUFFER_BIT );
    

    //Drawomg the outer circle
    scaling_l = 1;
    sm = scalem(scaling_l, scaling_l, scaling_l);

    otm = mat4();
    otm = mult(sm, otm);
    outerMat.push(otm);
    colors.push(vec3( 1.0, 0.0, 0.0 )); //red

    gl.uniform3fv( baseColorLoc, colors[0] );
    gl.uniformMatrix4fv(ctmLoc, false, flatten(outerMat[0]));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, circlecount );


    //Drawing the inner circle
    scaling_l = .925;
    sm = scalem(scaling_l, scaling_l, scaling_l);

    inm = mat4();
    inm = mult(sm, inm);
    innerMat.push(inm);
    colors.push(vec3( 1.0, 1.0, 1.0 )); //white

    gl.uniform3fv( baseColorLoc, colors[1] );
    gl.uniformMatrix4fv(ctmLoc, false, flatten(innerMat[0]));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, circlecount );


    //Drawing the center circle
    scaling_l = .035;
    sm = scalem(scaling_l, scaling_l, scaling_l);

    ctm = mat4();
    ctm = mult(sm, ctm);
    centerMat.push(ctm);
    colors.push(vec3( 0.0, 0.0, 0.0 )); //black

    gl.uniform3fv( baseColorLoc, colors[2] );
    gl.uniformMatrix4fv(ctmLoc, false, flatten(centerMat[0]));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, circlecount );


    //Drawing the hour ticks
    scaling_l = .3;
    trans = .83
    theta = 0.0; // in degree
    

    for(var i = 0; i<12; i++){
        theta +=30;
        rm = rotateZ(theta);
        sm = scalem(scaling_l, scaling_l, scaling_l);
        tm = translate(trans, 0.0, 0.0);
        hour = mat4();
        hour = mult(sm, hour);
        hour = mult(tm, hour);
        hour = mult(rm, hour);
        hourMat.push(hour);
        colors.push(vec3(0.4, 0.4, 1.0)); //blue
        gl.uniform3fv( baseColorLoc, colors[3] );
        gl.uniformMatrix4fv(ctmLoc, false, flatten(hourMat[i]));
        gl.drawArrays( gl.TRIANGLE_FAN, circlecount, 4);

    }


    //Drawing the minute ticks
    scaling_l = .1;
    trans = .8575
    theta = 0.0; // in degree
    

    for(var i = 0; i<60; i++){
        theta +=6;
        rm = rotateZ(theta);
        sm = scalem(scaling_l, scaling_l, scaling_l);
        tm = translate(trans, 0.0, 0.0);
        minute = mat4();
        minute = mult(sm, minute);
        minute = mult(tm, minute);
        minute = mult(rm, minute);
        minuteMat.push(minute);
        colors.push(vec3(0.4, 0.4, 1.0)); //blue
        gl.uniform3fv( baseColorLoc, colors[3] );
        gl.uniformMatrix4fv(ctmLoc, false, flatten(minuteMat[i]));
        gl.drawArrays( gl.TRIANGLE_FAN, circlecount, 4);

    }
}
