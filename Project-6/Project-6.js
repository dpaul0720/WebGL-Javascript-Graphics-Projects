"use strict";
var gl;
var canvas;

var toggleani = true;
var oldspeed =1;

var normalsArray = [];
var mvMatrix;
var mvMatrixLoc;
var nMatrix;
var nMatrixLoc;
var normalLoc;
var commonMVMatrix;
var commonMVPMatrix;

var printDay;

var mvpMatrix;
var projectionMatrix;
var stack = [];

var positionLoc;
var colorLoc;
var mvpMatrixLoc;

// Last time that this function was called
var g_last = Date.now();
var elapsed = 0;
var mspf = 1000/30.0;  // ms per frame

// scale factors
var rSunMult = 45;      // keep sun's size manageable
var rPlanetMult = 2000;  // scale planet sizes to be more visible

// surface radii (km)
var rSun = 696000;
var rMercury = 2440;
var rVenus = 6052;
var rEarth = 6371;
var rMoon = 1737;

// orbital radii (km)
var orMercury = 57909050;
var orVenus = 108208000;
var orEarth = 149598261;
var orMoon = 384399;

// orbital periods (Earth days)
var pMercury = 88;
var pVenus = 225;
var pEarth = 365;
var pMoon = 27;

// time
var currentDay;
var daysPerFrame;

var projectionScale;

var useLightingUniform;

var red = 1;
var green = 1;
var blue = 1;

var lightPosition = vec4(0, 0, 1.0, 0.0 );

var lightAmbient = vec4(red, green, blue, 1.0 );
var lightDiffuse = vec4( red, green, blue, 1.0 );
var lightSpecular = vec4( red, green, blue, 1.0 );

/*
var diffuse0 = vec4(1.0, 0.0, 0.0, 1.0);
var ambient0 = vec4(1.0, 0.0, 0.0, 1.0);
var specular0 = vec4(1.0, 0.0, 0.0, 1.0);
var light0_pos = vec4(1.0, 2.0, 3,0, 1.0);
*/

var materialAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var materialDiffuse = vec4(1.0, 1, 1, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 100.0


// vertices
var circleVertexPositionData = [];
var sphereVertexPositionData = [];
var sphereVertexIndexData = [];
var textureCoordData = [];

var circleVertexPositionBuffer;
var sphereVertexPositionBuffer;
var sphereVertexIndexBuffer;
var textureCoordBuffer = [];

var textureCoordAttribute;

var nBuffer;

// for trackball
var m_curquat;
var m_mousex = 1;
var m_mousey = 1;
var trackballMove = false;

var orMoonUpdate = Math.max( orMoon, ( rEarth + rMoon ) * rPlanetMult );
var topm;
var matrixtrans;

var samplerUniform;

var sunTexture;
var earthTexture;
var moonTexture;
var mercuryTexture;
var venusTexture;


function handleLoadedTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

}

function initTexture() {
    earthTexture = gl.createTexture();
    earthTexture.image = new Image();
    earthTexture.image.onload = function () {
        handleLoadedTexture(earthTexture)
    }
    
    earthTexture.image.src = "earth.jpg";

    sunTexture = gl.createTexture();
    sunTexture.image = new Image();
    sunTexture.image.onload = function () {
        handleLoadedTexture(sunTexture)
    }
    
    sunTexture.image.src = "sun.jpg";

    
    venusTexture = gl.createTexture();
    venusTexture.image = new Image();
    venusTexture.image.onload = function () {
        handleLoadedTexture(venusTexture)
    }
    
    venusTexture.image.src = "venus.jpg";

    

    mercuryTexture = gl.createTexture();
    mercuryTexture.image = new Image();
    mercuryTexture.image.onload = function () {
        handleLoadedTexture(mercuryTexture)
    }
    
    mercuryTexture.image.src = "mercury.jpg";
    
    moonTexture = gl.createTexture();
    moonTexture.image = new Image();
    moonTexture.image.onload = function () {
        handleLoadedTexture(moonTexture)
    }
    
    moonTexture.image.src = "moon.jpg";
}


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
    printDay = document.getElementById("printDay");
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.85, 0.85, 0.85, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    // for trackball
    m_curquat = trackball(0, 0, 0, 0);

    currentDay = 0;
    daysPerFrame = 1.0;
    projectionScale = 1.0 / ( orEarth + orMoon
                             + ( rEarth + 2 * rMoon ) * rPlanetMult );
    setupCircle();
    setupSphere();
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv( gl.getUniformLocation(program,
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program,
       "shininess"),materialShininess );



    nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );


    circleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, circleVertexPositionBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(circleVertexPositionData), gl.STATIC_DRAW );

    sphereVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVertexPositionData), gl.STATIC_DRAW);

    //Texture Related

    textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    
    //

    sphereVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereVertexIndexData), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer


    // vertex texture coordinates
    textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");
    gl.enableVertexAttribArray(textureCoordAttribute);
    samplerUniform = gl.getUniformLocation(program, "uSampler");
    //

    normalLoc = gl.getAttribLocation( program, "vNormal" );
    gl.enableVertexAttribArray( normalLoc );

    positionLoc = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( positionLoc );


    colorLoc = gl.getUniformLocation( program, "vColor" );
    useLightingUniform = gl.getUniformLocation( program, "uUseLighting" );

    mvpMatrixLoc = gl.getUniformLocation( program, "mvpMatrix" );

    mvMatrixLoc = gl.getUniformLocation( program, "mvMatrix" );
    nMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );



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

    document.getElementById("redslid").onchange = function(event) {
        red = event.target.value;

        lightAmbient = vec4(red, green, blue, 1.0 );
        lightDiffuse = vec4( red, green, blue, 1.0 );
        lightSpecular = vec4( red, green, blue, 1.0 );

        ambientProduct = mult(lightAmbient, materialAmbient);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        specularProduct = mult(lightSpecular, materialSpecular);

        gl.uniform4fv( gl.getUniformLocation(program,
           "ambientProduct"),flatten(ambientProduct) );
        gl.uniform4fv( gl.getUniformLocation(program,
           "diffuseProduct"),flatten(diffuseProduct) );
        gl.uniform4fv( gl.getUniformLocation(program,
           "specularProduct"),flatten(specularProduct) );
    };
    document.getElementById("greenslid").onchange = function(event) {
        green = event.target.value;

        lightAmbient = vec4(red, green, blue, 1.0 );
        lightDiffuse = vec4( red, green, blue, 1.0 );
        lightSpecular = vec4( red, green, blue, 1.0 );

        ambientProduct = mult(lightAmbient, materialAmbient);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        specularProduct = mult(lightSpecular, materialSpecular);

        gl.uniform4fv( gl.getUniformLocation(program,
           "ambientProduct"),flatten(ambientProduct) );
        gl.uniform4fv( gl.getUniformLocation(program,
           "diffuseProduct"),flatten(diffuseProduct) );
        gl.uniform4fv( gl.getUniformLocation(program,
           "specularProduct"),flatten(specularProduct) );
    };
    document.getElementById("blueslid").onchange = function(event) {
        blue = event.target.value;

        lightAmbient = vec4(red, green, blue, 1.0 );
        lightDiffuse = vec4( red, green, blue, 1.0 );
        lightSpecular = vec4( red, green, blue, 1.0 );

        ambientProduct = mult(lightAmbient, materialAmbient);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        specularProduct = mult(lightSpecular, materialSpecular);

        gl.uniform4fv( gl.getUniformLocation(program,
           "ambientProduct"),flatten(ambientProduct) );
        gl.uniform4fv( gl.getUniformLocation(program,
           "diffuseProduct"),flatten(diffuseProduct) );
        gl.uniform4fv( gl.getUniformLocation(program,
           "specularProduct"),flatten(specularProduct) );
    };
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(samplerUniform, 0);
    initTexture();
    render();
};


function setupCircle() {
    var increment = 0.1;
    for (var theta=0.0; theta < Math.PI*2; theta+=increment) {
        circleVertexPositionData.push(vec3(Math.cos(theta+increment), 0.0, Math.sin(theta+increment)));
    }
}

function setupSphere() {
    var latitudeBands = 50;
    var longitudeBands = 50;
    var radius = 1.0;
    
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
            
            sphereVertexPositionData.push(radius * x);
            sphereVertexPositionData.push(radius * y);
            sphereVertexPositionData.push(radius * z);

            // Texture related
            textureCoordData.push(u);
            textureCoordData.push(v);

            normalsArray.push(x,y,z);



        }
    }
    
    for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            sphereVertexIndexData.push(first);
            sphereVertexIndexData.push(second);
            sphereVertexIndexData.push(first + 1);
            
            sphereVertexIndexData.push(second);
            sphereVertexIndexData.push(second + 1);
            sphereVertexIndexData.push(first + 1);
        }
    }
}

function drawCircle(color, size) {
    // set uniforms
    gl.uniform3fv( colorLoc, color );
    var topm = stack[stack.length-1]; // get the matrix at the top of stack
    mvpMatrix = mult(topm, scalem(size, size, size));

    gl.uniform1i(useLightingUniform, false)

    mvpMatrix = mult(commonMVPMatrix, mvpMatrix);
    gl.uniformMatrix4fv(mvpMatrixLoc, false, flatten(mvpMatrix) );
    
    gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexPositionBuffer);
    gl.vertexAttribPointer( positionLoc, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.LINE_LOOP, 0, circleVertexPositionData.length );
}

function drawSphere(size, texture) {
    // set uniforms
    var topm = stack[stack.length-1]; // get the matrix at the top of stack
    mvpMatrix = mult(topm, scalem(size, size, size));

    gl.uniform1i(useLightingUniform, true);


    mvMatrix = mult(commonMVMatrix, mvpMatrix);
    gl.uniformMatrix4fv(mvMatrixLoc, false, flatten(mvMatrix));

    nMatrix = normalMatrix(mvMatrix, true);

    gl.uniformMatrix3fv(nMatrixLoc,false, flatten(nMatrix));


    mvpMatrix = mult(commonMVPMatrix, mvpMatrix);
    gl.uniformMatrix4fv(mvpMatrixLoc, false, flatten(mvpMatrix) );
    

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);


    //Texture Stuff

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);


    //

    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, sphereVertexIndexData.length, gl.UNSIGNED_SHORT, 0);
}

function drawOrbits() {
    var gray = vec3( 0.2, 0.2, .2);
   // var gray = vec3( 0.8, 0.8, .8);
    var angleOffset = currentDay * 360.0;  // days * degrees
    stack.push(mat4());
    drawCircle( gray, orVenus );    // Venus

    drawCircle( gray, orEarth );    // Eartj

    drawCircle( gray, orMercury );    // Mercury

    matrixtrans = mult(rotateY(angleOffset/pEarth),translate(orEarth, 0.0, 0.0));
    stack.push(matrixtrans);
    drawCircle(gray, orMoonUpdate);
    stack.pop();
  
    stack.pop();
}

function drawBodies() {
    var size;
    var angleOffset = currentDay * 360.0;  // days * degrees
    
    // Sun
    size = rSun * rSunMult;
    stack.push(mat4());
    drawSphere(size, sunTexture  );
    stack.pop();

    // Venus
    size = rVenus * rPlanetMult;
    matrixtrans = mult(rotateY(angleOffset/pVenus), translate(orVenus, 0.0, 0.0))
    stack.push(matrixtrans);
    drawSphere(size, venusTexture );
    stack.pop();

    // Mercury
    size = rMercury * rPlanetMult;
    matrixtrans = mult(rotateY(angleOffset/pMercury), translate(orMercury, 0.0, 0.0));
    stack.push(matrixtrans);
    drawSphere(size, mercuryTexture );
    stack.pop();


    //NEW STUFF I ADDED
    // Earth
    size = rEarth * rPlanetMult;
    matrixtrans = mult(rotateY(angleOffset/pEarth), translate(orEarth, 0.0, 0.0));
    stack.push(matrixtrans);
    drawSphere(size, earthTexture );

    //MOON CODE GOES HERE
    //set the transformation matrix for the Moon
    
    matrixtrans = mult(rotateY(angleOffset/pMoon),translate(orMoonUpdate, 0.0, 0.0));

    // get the transformation matrix for the Earth
    topm = stack[stack.length-1];               //orbit code
    stack[stack.length-1] = mult(topm, matrixtrans);
    size = rMoon * rPlanetMult;
    drawSphere(size, moonTexture); 


    stack.pop();
   
}

function drawDay() {
    var string = 'Day ' + currentDay.toString();
    printDay.innerHTML = string;
}

function drawAll()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    
    // all planets and orbits will take the following transformation

    // global scaling
    commonMVMatrix = mult(rotateX(30.0), scalem(projectionScale,projectionScale,projectionScale));

    commonMVMatrix = mult(build_rotmatrix(m_curquat), commonMVMatrix);

    // standard orthogonal projection

    commonMVPMatrix = mult(ortho(-1.0, 1.0, -0.5, 0.5, -2.0, 2.0),
                            commonMVMatrix);


    if (document.getElementById("orbon").checked == true)
        drawOrbits();
    
    drawBodies();
    if (document.getElementById("dayon").checked == true)
        drawDay();
    else
        printDay.innerHTML = "";

}



var render = function() {
    // Calculate the elapsed time
    var now = Date.now(); // time in ms
    document.getElementById("Increase").onclick = function(){
        daysPerFrame = daysPerFrame * 2;
        oldspeed = daysPerFrame;
    }; 
    document.getElementById("Decrease").onclick = function(){
        daysPerFrame = daysPerFrame / 2;
        oldspeed = daysPerFrame;
    }; 
    elapsed += now - g_last;
    g_last = now;
    if (elapsed >= mspf) {
        currentDay += daysPerFrame;
        elapsed = 0;
    }
    if (document.getElementById("anion").checked == true){
        toggleani = true;
        daysPerFrame = oldspeed; 
    }
    if (document.getElementById("anioff").checked == true){
        toggleani = false;
        daysPerFrame = 0;
    }
    requestAnimFrame(render);

    if(toggleani == true){
        drawAll();
    }

};