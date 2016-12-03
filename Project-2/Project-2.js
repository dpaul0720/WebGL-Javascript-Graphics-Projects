"use strict";

var gl;
var offset = 0.0;
//var vOffset;
var increment = 0.01;
var vertices = [];
var x = 0;
var y = .95;
var circlecount;
var colorLoc;
var ball_x_increment = 0.005;
var ball_y_increment = -0.005;
var paddle_x_increment = 0.05;
var xoffsetLoc;
var yoffsetLoc;
var x_offset_ball = 0.0;
var y_offset_ball = 0.0;
var x_offset_paddle = 0.0;
var y_offset_paddle = 0.0;
var xdirection = 1;
var ydirection = 1;
var bounce = 0;
var requestId;
var gameover = 0;

window.onload = function init()
{

    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }


    

    vertices.push(x);
    vertices.push(y);

    for( var i=0; i<=360; i+=10){
      vertices.push(x+0.05*Math.cos(i*Math.PI/180));
      vertices.push(y+0.05*Math.sin(i*Math.PI/180));
    }
    circlecount = vertices.length / 2;
    vertices.push(-.125);
    vertices.push(-1);
    vertices.push(-.125);
    vertices.push(-0.95);
    vertices.push(0.125);
    vertices.push(-.95);
    vertices.push(0.125);
    vertices.push(-1);


//    console.log(vertices.length);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );


    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

   
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "color" );

//    vOffset = gl.getUniformLocation( program, "vOffset" );
    
    xoffsetLoc = gl.getUniformLocation( program, "x_offset" );
    yoffsetLoc = gl.getUniformLocation( program, "y_offset" );



    render();
};


function render() {

    document.getElementById("bounces").innerHTML = bounce;
//    requestId = window.requestAnimationFrame(render);


    console.log(x_offset_paddle);
    
    if(xdirection == 1){
        x_offset_ball += ball_x_increment;
    }
    if(xdirection == 0){
        x_offset_ball -= ball_x_increment;
    }
    if (x_offset_ball > .95){
        xdirection = 0;
    }
    if(x_offset_ball < -.95){
        xdirection = 1;
    }
    if(ydirection == 1){
        y_offset_ball += ball_y_increment;
    
    }
    if(ydirection == 0){
        y_offset_ball -= ball_y_increment;
    
    }
    if(y_offset_ball < -1.85 && x_offset_ball < (x_offset_paddle + .125) && x_offset_ball > (x_offset_paddle - .125)){
        ydirection = 0;
        bounce += 1;

        
    }
    if(y_offset_ball < -2){
        gameover = 1;
    }
    if(y_offset_ball > 0){
        ydirection = 1;
    }




    gl.clear( gl.COLOR_BUFFER_BIT );


    gl.uniform1f(xoffsetLoc, x_offset_ball); // x_offset_ball keeps track of the current offset in x
    gl.uniform1f(yoffsetLoc, y_offset_ball); // y_offset_ball keeps track of the current offset in y
    // now you draw the ball

    gl.uniform4fv( colorLoc, vec4(0.4, 0.4, 1.0, 1.0));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, circlecount);
    


    document.getElementById("right").onclick = function () {
        if (x_offset_paddle >.99){
        }
        else{
            x_offset_paddle += paddle_x_increment;
        } 
    };
    document.getElementById("left").onclick = function () {
         if (x_offset_paddle < -.99){
        }
        else{
            x_offset_paddle -= paddle_x_increment;
        } 

    };
    document.getElementById("speedplus").onclick = function () {
        ball_x_increment += .0025;
        ball_y_increment -= .0025;
    };
    document.getElementById("speedminus").onclick = function () {
        ball_x_increment -= .0025;
        ball_y_increment += .0025;
    };


    
    y_offset_paddle = 0; // because paddle only moves along the horizontal direction
    gl.uniform1f(xoffsetLoc, x_offset_paddle);
    gl.uniform1f(yoffsetLoc, y_offset_paddle);
    // now you draw the paddle

    gl.uniform4fv( colorLoc, vec4(1.0, 0.4, 0.4, 1.0));
    gl.drawArrays( gl.TRIANGLE_FAN, circlecount, 4);
   
 
    if (gameover == 1){
        if (requestId) {
        window.cancelAnimationFrame(requestId);
        requestId = undefined;
        }
        alert("Game Over!");

    }
    


    requestId = window.requestAnimationFrame(render);
    //requestAnimFrame(render);

};

