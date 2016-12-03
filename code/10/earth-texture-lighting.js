"use strict";

var canvas;
var gl;


var rotationMatrix;
var mvpMatrix;
var nMatrix;
var mvpMatrixLoc;
var nMatrixLoc;

var vertexNormalAttribute;
var vertexPositionAttribute;
var textureCoordAttribute;

var samplerUniform;
var useLightingUniform;
var ambientColorUniform;
var lightingDirectionUniform;
var directionalColorUniform;

var vertexPositionData = [];
var textureCoordData = [];
var normalData = [];
var indexData = [];

var earthTexture;

var earthVertexPositionBuffer;
var earthVertexNormalBuffer;
var earthVertexTextureCoordBuffer;
var earthVertexIndexBuffer;

var trackballMove = false;

var m_curquat;
var m_mousex = 1;
var m_mousey = 1;

function handleLoadedTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(samplerUniform, 0);
}

function initTexture() {
    earthTexture = gl.createTexture();
    earthTexture.image = new Image();
    earthTexture.image.onload = function () {
        handleLoadedTexture(earthTexture)
    }
    
    earthTexture.image.src = "earth.jpg";
}

function initBuffers() {
    var latitudeBands = 50;
    var longitudeBands = 50;
    var radius = 2;
    
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        
        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);
            
            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);
            
            normalData.push(x);
            normalData.push(y);
            normalData.push(z);
            textureCoordData.push(u);
            textureCoordData.push(v);
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
        }
    }
    
    for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);
            
            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }
    
    earthVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    
    earthVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    
    earthVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    
    earthVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, earthVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
}

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
            //tick();
        }
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    m_curquat = trackball(0, 0, 0, 0);
    
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    rotationMatrix = mat4();
    mvpMatrix = mat4();
    mvpMatrixLoc = gl.getUniformLocation(program, "mvpMatrix");
    gl.uniformMatrix4fv(mvpMatrixLoc, false, flatten(mvpMatrix));
    
    nMatrixLoc = gl.getUniformLocation(program, "nMatrix");
    
    
    // vertex positions
    vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
    
    // vertex texture coordinates
    textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");
    gl.enableVertexAttribArray(textureCoordAttribute);
    
    // vertex normals
    vertexNormalAttribute = gl.getAttribLocation(program, "aVertexNormal");
    gl.enableVertexAttribArray(vertexNormalAttribute);
    
    samplerUniform = gl.getUniformLocation(program, "uSampler");
    useLightingUniform = gl.getUniformLocation(program, "uUseLighting");
    ambientColorUniform = gl.getUniformLocation(program, "uAmbientColor");
    lightingDirectionUniform = gl.getUniformLocation(program, "uLightingDirection");
    directionalColorUniform = gl.getUniformLocation(program, "uDirectionalColor");
    
    canvas.addEventListener("mousedown", function(event){
        m_mousex = event.clientX - event.target.getBoundingClientRect().left;
        m_mousey = event.clientY - event.target.getBoundingClientRect().top;
        trackballMove = true;
    });

    canvas.addEventListener("mouseup", function(event){
        trackballMove = false;
    });

    canvas.addEventListener("mousemove", function(event){
      if (trackballMove) {
        var x = event.clientX - event.target.getBoundingClientRect().left;
        var y = event.clientY - event.target.getBoundingClientRect().top;
        mouseMotion(x, y);
      }
    } );
    
    initBuffers();
    initTexture();
    
    tick();
}

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var lighting = document.getElementById("lighting").checked;
    gl.uniform1i(useLightingUniform, lighting);
    if (lighting) {
        gl.uniform3f(
                     ambientColorUniform,
                     parseFloat(document.getElementById("ambientR").value),
                     parseFloat(document.getElementById("ambientG").value),
                     parseFloat(document.getElementById("ambientB").value)
                     );
        
        var lightingDirection = [
                                parseFloat(document.getElementById("lightDirectionX").value),
                                parseFloat(document.getElementById("lightDirectionY").value),
                                parseFloat(document.getElementById("lightDirectionZ").value)
                                 ];
        var adjustedLD = scale(-1.0, normalize(lightingDirection));
        gl.uniform3fv(lightingDirectionUniform, adjustedLD);
        
        gl.uniform3f(
                     directionalColorUniform,
                     parseFloat(document.getElementById("directionalR").value),
                     parseFloat(document.getElementById("directionalG").value),
                     parseFloat(document.getElementById("directionalB").value)
                     );
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexPositionBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexTextureCoordBuffer);
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexNormalBuffer);
    gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    
    var m_inc = build_rotmatrix(m_curquat);
    var m_mv = mult(m_inc, rotationMatrix);
    m_mv = mult(translate(0.0, 0.0, -6.0), m_mv);
    
    mvpMatrix = mult(perspective(45, canvas.width/canvas.height, 0.1, 100.0), m_mv);
    gl.uniformMatrix4fv(mvpMatrixLoc, false, flatten(mvpMatrix));

    nMatrix = normalMatrix(m_mv, true); // return 3 by 3 normal matrix
    
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix));
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, earthVertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
}

function tick() {
    requestAnimFrame(tick);
    drawScene();
}
