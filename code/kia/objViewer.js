"use strict"

var gl;

var a_Position;
var a_Color;
var a_Normal;
var a_TexCoord;

var u_Sampler;

var u_MvMatrix;
var u_MvpMatrix;
var u_NormalMatrix;

var u_AmbientColor;
var u_LightPosition;
var u_LightColor;

var texFileName = "";

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.enable(gl.DEPTH_TEST);

    
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    a_Position = gl.getAttribLocation(program, "a_Position");
    a_Normal = gl.getAttribLocation(program, "a_Normal");
    a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
    a_Color = gl.getAttribLocation(program, "a_Color");

    u_AmbientColor = gl.getUniformLocation(program, "u_AmbientColor");
    u_LightPosition = gl.getUniformLocation(program, "u_LightPosition");
    u_LightColor = gl.getUniformLocation(program, "u_LightColor");
    
    u_Sampler = gl.getUniformLocation(program, "u_Sampler");
    u_MvMatrix = gl.getUniformLocation(program, "u_MvMatrix");
    u_MvpMatrix = gl.getUniformLocation(program, "u_MvpMatrix");
    u_NormalMatrix = gl.getUniformLocation(program, "u_NormalMatrix");

    if (
        a_Position < 0 ||  a_Normal < 0 || a_TexCoord < 0 || a_Color < 0 ||
        !u_AmbientColor || !u_LightPosition || !u_LightColor ||
        !u_Sampler || !u_MvMatrix || !u_MvpMatrix || !u_NormalMatrix
        ) {
        console.log('Failed to get the location of attribute and uniform variables');
        return;
    }

    // Prepare empty buffer objects for vertex coordinates, colors, and normals
    var model = initVertexBuffers(gl);
    if (!model) {
        console.log('Failed to set the vertex information');
        return;
    }
    
    g_projMatrix = perspective(30.0, canvas.width/canvas.height, 1.0, 5000.0),
    
    g_viewMatrix = lookAt(vec3(0.0, 400.0, 200.0),
                          vec3(0.0, 0.0, 0.0),
                          vec3(0.0, 1.0, 0.0));
    
    // Start reading the OBJ file
    //readOBJFile('cube.obj', gl, model, 60, true);
    readOBJFile('kia.obj', gl, model, 15, true);

    initTextures(gl);
    
    var currentAngle = 0.0; // Current rotation angle [degree]
    var tick = function() {   // Start drawing
        currentAngle = animate(currentAngle); // Update current rotation angle
        draw(gl, currentAngle, model);
        requestAnimationFrame(tick, canvas);
    };
    tick();
    
};

// Create an buffer object and perform an initial configuration
function initVertexBuffers(gl) {
    var o = new Object(); // Utilize Object object to return multiple buffer objects
    o.vertexBuffer = createEmptyArrayBuffer(gl, a_Position, 3, gl.FLOAT);
    o.normalBuffer = createEmptyArrayBuffer(gl, a_Normal, 3, gl.FLOAT);
    o.textureBuffer = createEmptyArrayBuffer(gl, a_TexCoord, 2, gl.FLOAT);
    o.colorBuffer = createEmptyArrayBuffer(gl, a_Color, 4, gl.FLOAT);
    o.indexBuffer = gl.createBuffer();
    if (!o.vertexBuffer || !o.normalBuffer || !o.textureBuffer || !o.colorBuffer || !o.indexBuffer) { return null; }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return o;
}

// Create a buffer object, assign it to attribute variables, and enable the assignment
function createEmptyArrayBuffer(gl, a_attribute, num, type) {
    var buffer =  gl.createBuffer();  // Create a buffer object
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return null;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);  // Assign the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);  // Enable the assignment
    
    return buffer;
}

function initTextures(gl) {
    var texture = gl.createTexture();   // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    
    var image = new Image();  // Create the image object
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }
    // Register the event handler to be called on loading an image
    image.onload = function(){ loadTexture(gl, texture, u_Sampler, image); };
    // Tell the browser to load an image
    if(texFileName == "") {
        //alert('Texture file name not identified');
        image.src = 'kia.jpg';
    }
    else {
        //alert('Texture file name read from material');
        alert(texFileName);
        image.src = texFileName; //'kia.jpg'
    }
    return true;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

function loadTexture(gl, texture, u_Sampler, image) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler, 0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Check if the image is a power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    } else {
        // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
        // Prevents s-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // Prevents t-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
}

// Read a file
function readOBJFile(fileName, gl, model, scale, reverse) {
    var request = new XMLHttpRequest();
    
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status !== 404) {
            onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse);
        }
    }
    request.open('GET', fileName, true); // Create a request to acquire the file
    request.send();                      // Send the request
}

var g_objDoc = null;      // The information of OBJ file
var g_drawingInfo = null; // The information for drawing 3D model

// OBJ File has been read
function onReadOBJFile(fileString, fileName, gl, o, scale, reverse) {
    var objDoc = new OBJDoc(fileName);  // Create a OBJDoc object
    var result = objDoc.parse(fileString, scale, reverse); // Parse the file
    if (!result) {
        g_objDoc = null; g_drawingInfo = null;
        console.log("OBJ file parsing error.");
        return;
    }
    g_objDoc = objDoc;
}

// Coordinate transformation matrix
var g_modelMatrix = mat4();
var g_viewMatrix = mat4();
var g_projMatrix = mat4();
var g_mvpMatrix = mat4();
var g_mvMatrix = mat4();
var g_normalMatrix = mat3();

// Drawing function
function draw(gl, angle, model) {
    if (g_objDoc != null && g_objDoc.isMTLComplete()){ // OBJ and all MTLs are available
        g_drawingInfo = onReadComplete(gl, model, g_objDoc);
        g_objDoc = null;
    }
    if (!g_drawingInfo) return;
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  // Clear color and depth buffers
    
    gl.uniform3fv(u_AmbientColor, vec3(0.2, 0.2, 0.2));
    gl.uniform3fv(u_LightPosition, vec3(0.0, 300.0, 0.0));
    gl.uniform3fv(u_LightColor, vec3(1.0, 1.0, 1.0));
    
    g_modelMatrix = mult(rotateX(angle), mult(rotateY(angle), rotateZ(angle)));
    g_mvMatrix = mult(g_viewMatrix, g_modelMatrix);
    gl.uniformMatrix4fv(u_MvMatrix, false, flatten(g_mvMatrix));

    // Calculate the normal transformation matrix and pass it to u_NormalMatrix
    g_normalMatrix = normalMatrix(g_mvMatrix, true); // return 3 by 3
    gl.uniformMatrix3fv(u_NormalMatrix, false, flatten(g_normalMatrix));
    
    // Calculate the model view project matrix and pass it to u_MvpMatrix
    g_mvpMatrix = mult(g_projMatrix, g_mvMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, flatten(g_mvpMatrix));
    
    // Draw
    gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
}

// OBJ File has been read completely
function onReadComplete(gl, model, objDoc) {
    // Acquire the vertex coordinates and colors from OBJ file
    var drawingInfo = objDoc.getDrawingInfo();
    
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.textures, gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);
    
    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);
    
    return drawingInfo;
}

var ANGLE_STEP = 10;   // The increments of rotation angle (degrees)

var last = Date.now(); // Last time that this function was called
function animate(angle) {
    var now = Date.now();   // Calculate the elapsed time
    var elapsed = now - last;
    last = now;
    // Update the current rotation angle (adjusted by the elapsed time)
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle % 360;
}
