"use strict";

var gl;
var colorLoc;
var blockBuffer;
var boundaryBuffer;
var vPosition;
var blockCoord = [];
var boundarylines = [];
//var grid = [][];
//For movement
var xoffsetLoc;
var yoffsetLoc;
var xoffsetBlock = 0.0;
var yoffsetBlock = 0.0;
var xoffsetBlock1 = 0.0;
var yoffsetBlock1 = 0.0;
var xBlockIncrement = 0.1;
var yBlockIncrement = -0.005;
var hit = 0;
var set = 0;
var sec = 0;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( .9, .9, .9, 1.0 );


    createBlocks();
    createBounary();

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

/*
    boundaryBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, boundaryBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(boundarylines), gl.STATIC_DRAW );

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
*/


    blockBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, blockBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(blockCoord), gl.STATIC_DRAW );
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "color" );

    xoffsetLoc = gl.getUniformLocation( program, "x_offset" );
    yoffsetLoc = gl.getUniformLocation( program, "y_offset" );




    render();
};

function createBlocks(){
    blockCoord.push(vec2(-0.05, 1.1));
    blockCoord.push(vec2(-0.05, 1.0 ));
    blockCoord.push(vec2(0.05, 1.1));
    blockCoord.push(vec2(0.05, 1.0));
    blockCoord.push(vec2(-0.05, 1.2));
    blockCoord.push(vec2(-0.05, 1.0 ));
    blockCoord.push(vec2(0, 1.2));
    blockCoord.push(vec2(0, 1.0));
}

function createBounary(){
    boundarylines.push(vec2(-.25, 1));
    boundarylines.push(vec2(-.25, -1));
    boundarylines.push(vec2(.25, 1));
    boundarylines.push(vec2(.25, -1));
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    document.onkeydown = function(e) {
        switch (e.keyCode) {
            case 37:
                xoffsetBlock -= xBlockIncrement;
                console.log('left')
                break;
            case 38:
                console.log('up')
                break;
            case 39:
                xoffsetBlock += xBlockIncrement;
                console.log('right')
                break;
            case 40:
                console.log('down')
                break;
        }
    };



    if(hit == 0){
        yoffsetBlock += yBlockIncrement;
    }
    if(yoffsetBlock < -2){
        hit = 1;
    }
    if(hit == 1){
        //create new block and drop it
        //createBlocks();
        set = 1;
    }
    


    gl.uniform1f(yoffsetLoc, yoffsetBlock);
    gl.uniform1f(xoffsetLoc, xoffsetBlock);


    // draw the data as an array of points
    gl.uniform4fv( colorLoc, vec4(1.0, 1.0, 0.0, 1.0));
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    if(set == 1){
        gl.uniform1f(yoffsetLoc, yoffsetBlock1);
        gl.uniform1f(xoffsetLoc, xoffsetBlock1);
        if(sec == 0){
            yoffsetBlock1 += yBlockIncrement;
        }
        gl.uniform4fv( colorLoc, vec4(0.0, 1.0, 1.0, 1.0));
        gl.drawArrays( gl.TRIANGLE_STRIP, 4, 4 );
        if(yoffsetBlock1 < -1.9){
            sec = 1;
        }
    }



    window.requestAnimFrame(render);
}
