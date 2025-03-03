// Vertex shader program
var VSHADER_SOURCE =
    'precision mediump float;' +
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_UV;' +
    'attribute vec3 a_Normal;' +
    'varying vec2 v_UV;' +
    'varying vec3 v_Normal;' +
    'varying vec4 v_VertPos;' +
    'uniform mat4 u_ModelMatrix;' +
    'uniform mat4 u_GlobalRotateMatrix;' +
    'uniform mat4 u_ViewMatrix;' +
    'uniform mat4 u_ProjectionMatrix;' +
    'void main() {\n' +
    '    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;' +
    '    v_UV = a_UV;' +
    '    v_Normal = a_Normal;' +
    '    v_VertPos = u_ModelMatrix * a_Position;' +
    '}\n';

//Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec2 v_UV;' +
    'varying vec3 v_Normal;' +
    'uniform vec4 u_FragColor;\n' +
    'uniform sampler2D u_Sampler0;' +
    'uniform sampler2D u_Sampler1;' +
    'uniform sampler2D u_Sampler2;' +
    'uniform int u_whichTexture;' +
    'uniform vec3 u_lightPos;' +
    'uniform vec3 u_cameraPos;' +
    'uniform vec3 u_lightColor;' +
    'uniform int u_light;' +
    'uniform int u_lightC;' +
    'varying vec4 v_VertPos;' +
    '' +
    'uniform vec3 u_spotLightPos;' +
    '' +
    'void main() {\n' +
    '   if(u_whichTexture == -3){' +
    '       gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);\n' +
    '   } else if(u_whichTexture == -2){' +
    '       gl_FragColor = u_FragColor;' +
    '   } else if (u_whichTexture ==-1){' +
    '       gl_FragColor = vec4(v_UV,1.0,1.0);' +
    '   } else if(u_whichTexture == 0){' +
    '       gl_FragColor = texture2D(u_Sampler0, v_UV);' +
    '   } else if(u_whichTexture == 1){' +
    '       gl_FragColor = texture2D(u_Sampler1, v_UV);' +
    '   } else if(u_whichTexture == 2){' +
    '       gl_FragColor = texture2D(u_Sampler2, v_UV);' +
    '   } else{' +
    '       gl_FragColor = vec4(1,.2,.2,1);' +
    '   }' +
    '' +
    '   if (u_light==1){' +
    '' +
    '   vec3 lightVector = u_lightPos - vec3(v_VertPos);' +
    '   float r = length(lightVector);' +
    '   vec3 L = normalize(lightVector);' +
    '   vec3 N = normalize(v_Normal);' +
    '   float nDotL = max(dot(N,L), 0.0);' +
    '' +
    '   vec3 R = reflect(-L,N);' +
    '' +
    '   vec3 E = normalize(u_cameraPos - vec3(v_VertPos));' +
    '' +
    '   float specular = pow(max(dot(E,R), 0.0), 100.0);' +
    '' +
    '   vec3 diffuse = vec3(gl_FragColor) * nDotL;' +
    '   vec3 ambient = vec3(gl_FragColor) * 0.3;' +
    '   if(u_whichTexture == 0 || u_whichTexture == 1|| u_whichTexture == -2)' +
    '       specular = 0.0;' +
    '       if(u_lightC == 0){' +
    '       gl_FragColor = vec4(specular+diffuse+ambient, 1.0);' +
    '} else{' +
    '       gl_FragColor = vec4(u_lightColor*(diffuse+ambient), 1.0);' +
    '       }' +
    '   } else if (u_light == 2){' +
    '' +
    '   vec3 lightVector = u_spotLightPos - vec3(v_VertPos);' +
    '   vec3 L = normalize(lightVector);' +
    '   vec3 N = normalize(v_Normal);' +
    '   float nDotL = dot(N,L);' +
    '       float spotFactor = 1.0;' +
    '       vec3 D = -vec3(0,-1,0);' +
    '   float spotCosine = dot(D,L);' +
    '       float spotCosineCutoff = 0.98; ' +
    '       if (spotCosine >= spotCosineCutoff) { \n' +
    '            spotFactor = pow(spotCosine,2.0);\n' +
    '       } else { ' +
    '            spotFactor = 0.0;' +
    '       }' +
    '       if(dot(N,L) <=0.0){' +
    '           gl_FragColor = vec4(0.0,0.0,0.0,1.0);' +
    '      } else{' +
    '           vec3 diffuse = vec3(gl_FragColor) * nDotL;' +
    '           vec3 ambient = vec3(gl_FragColor) * 0.3;' +
    '           vec3 reflection = dot(L,N) * u_lightColor * diffuse;' +
    '           vec3 R = reflect(-L,N);' +
    '           vec3 E = normalize(u_cameraPos - vec3(v_VertPos));' +
    '           float specular = pow(max(dot(E,R), 0.0), 100.0);' +
    '           if(dot(R,E)>0.0){' +
    '               float factor = pow(dot(R,E),2.0);' +
    '               reflection += factor *specular* u_lightColor;' +
    '             }' +
    '           vec3 color = spotFactor*reflection;' +
    '           gl_FragColor = vec4(color, 1.0);' +
    '       }' +
    '' +
    '   }' +
    '}';

let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix
let u_whichTexture;
let a_Normal = false;
let u_cameraPos;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_light;
let g_migong = false;
let g_set_Location = 0;
let Shift_and_Click = false;
let g_globool = true;
let g_normal = false;
var g_start_time = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_start_time;
let g_camera = new Camera();

let u_spotLightPos;
let g_lightPos = [10,3,12]
let drawMap_bool = false;
let g_globalAngleY = 0;
let g_globalAngleX = 0;
let g_globalAngleZ = 0;
let g_lightColor = [1,1,1];
let g_lightMoveOn = false;
let g_spotlightPos = [10.125, g_set_Location+0.4, 7.15];
let u_lightColor;
let u_lightC;

var g_animation = true;
var g_upperAngle = 15;
var g_lowerAngle = 0;
var g_clock = 0;
var g_clockStart = performance.now() / 1000.0;

var g_antAngle = 0; // Current angle in radians for circular movement
var g_antOrbitRadius = 5.0; // Radius of the circular path
var g_antOrbitSpeed = 1.0; // Rotation speed in radians per second
var g_antOrbitCenter = [10, 0, 7]; // Center point of the circular path

var g_antPausedPosition = [10, 0, 7]; // Store last position when animation stops
var g_antPausedAngle = 0; // Store last angle



function setupCanvas() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true}); // gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }
     // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
     // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // get the storage location of u_Sample0
    var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_sampler0');
        return false;
    }

    // get the storage location of u_Sampler1
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_sampler1');
        return;
    }

    // get the storage location of u_Sampler1
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_sampler2');
        return;
    }

    // get the storage location of u_Sampler
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_sampler3');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (!a_Normal) {
        console.log("failed get a_Normal")
        return;
    }

    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
        console.log("failed get u_lightPos")
        return;
    }

    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
        console.log("failed get u_cameraPos")
        return;
    }

    u_spotLightPos = gl.getUniformLocation(gl.program, 'u_spotLightPos');
    if (!u_spotLightPos) {
        console.log('Failed to get the storage location of u_spotLightPos');
        return;
    }

    u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
    if (!u_lightColor) {
        console.log('Failed to get the storage location of u_lightColor');
        return;
    }
    u_light = gl.getUniformLocation(gl.program, 'u_light');
    if (!u_light) {
        console.log('Failed to get the storage location of u_light');
        return false;
    }
    u_lightC = gl.getUniformLocation(gl.program, 'u_lightC');
    if (!u_lightC) {
        console.log('Failed to get the storage location of u_lightC');
        return false;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionForHtmlUI() {
    document.getElementById('aniOn').onclick = function() { 
        g_animation = true;
        g_clockStart = performance.now() / 1000.0; // Reset animation clock
        renderAllShapes();
    };
    
    document.getElementById('aniOff').onclick = function() { 
        g_animation = false; // Pause movement, but keep the ant in place
        renderAllShapes();
    };
    
    
    document.getElementById('lightSlideX').addEventListener('mousemove',
        function (ev) {
            if (ev.buttons === 1) {
                g_lightPos[0] = this.value / 100;
                renderAllShapes();
            }
        });
    document.getElementById('lightSlideY').addEventListener('mousemove',
        function (ev) {
            if (ev.buttons === 1) {
                g_lightPos[1] = this.value / 100;
                renderAllShapes();
            }
        });
    document.getElementById('lightSlideZ').addEventListener('mousemove',
        function (ev) {
            if (ev.buttons === 1) {
                g_lightPos[2] = this.value / 100;
                renderAllShapes();
            }
        });

    
    document.getElementById('Light_On').onclick = function () {
        gl.uniform1i(u_light,1);
    };
    document.getElementById('Light_Off').onclick = function(){
        gl.uniform1i(u_light,0);
        gl.uniform1i(u_lightC,0);
        g_lightColor = [1,1,1];
        document.getElementById("lightRed").value = g_lightColor[0]*255;
        document.getElementById("lightGreen").value = g_lightColor[1]*255;
        document.getElementById("lightBlue").value = g_lightColor[2]*255;
    };
    document.getElementById('Spot_Light_on').onclick = function () {
        gl.uniform1i(u_light, 2);
    };
    document.getElementById('Spot_Light_off').onclick = function (){
        gl.uniform1i(u_light, 0);
        gl.uniform1i(u_lightC, 0);
        g_lightColor = [1,1,1];
        document.getElementById("lightRed").value = g_lightColor[0]*255;
        document.getElementById("lightGreen").value = g_lightColor[1]*255;
        document.getElementById("lightBlue").value = g_lightColor[2]*255;
    };

    document.getElementById('Normal_On').onclick = function () {
        g_normal = !g_normal;
    }

    document.getElementById('lightRed').addEventListener('mousemove', function (ev){
        if(ev.buttons === 1){
            gl.uniform1i(u_lightC, 1);
            g_lightColor[0] = this.value/100;
        }
    });
    document.getElementById('lightGreen').addEventListener('mousemove', function (ev){
        if(ev.buttons === 1){
            gl.uniform1i(u_lightC, 1);
            g_lightColor[1]= this.value/100;
        }
    });
    document.getElementById('lightBlue').addEventListener('mousemove', function (ev){
        if(ev.buttons === 1){
            gl.uniform1i(u_lightC, 1);
            g_lightColor[2] = this.value/100;
        }
    });
    document.getElementById('SpotlightSlideX').addEventListener('mousemove', function (ev){
        if(ev.buttons === 1){
            g_spotlightPos[0] = this.value/10;
        }
    });
    document.getElementById('SpotlightSlideY').addEventListener('mousemove', function (ev){
        if(ev.buttons === 1){
            g_spotlightPos[1]= this.value/10;
        }
    });
    document.getElementById('SpotlightSlideZ').addEventListener('mousemove', function (ev){
        if(ev.buttons === 1){
            g_spotlightPos[2] = this.value/10;
        }
    });

}

function initTextures() {
    // image 0
    var image0 = new Image();
    if (!image0) {
        console.log('Failed to create the image0 object');
        return false;
    }
    image0.onload = function () {
        sendTextureToTEXTURE0(image0);
    };
    // image 1
    var image1 = new Image();
    if (!image1) {
        console.log('Failed to create the image1 object');
        return false;
    }
    image1.onload = function () {
        sendTextureToTEXTURE1(image1);
    };
    if (g_globool === true) {
        image1.src = 'sky.webp';
    }
    //image 2
    var image2 = new Image();
    if (!image2) {
        console.log('Failed to create the image2 object');
        return false;
    }
    image2.onload = function () {
        sendTextureToTEXTURE2(image2);
    };
    if (g_globool === true) {
        image2.src = 'grass.webp';
    }
}

function sendTextureToTEXTURE0(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture0 object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler0, 0);
    console.log("successfully render the sky.jpg")
}

function sendTextureToTEXTURE1(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture1 object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler1, 1);
    console.log("successfully render the Grass.png")
}

function sendTextureToTEXTURE2(image) {
    var texture = gl.createTexture();

    if (!texture) {
        console.log('Failed to create the texture2 object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler2, 2);
    console.log("successfully render the soil.jpg")
}

function main() {
    setupCanvas();
    connectVariablesToGLSL();
    addActionForHtmlUI();
    initTextures();
    document.onkeydown = keydown;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    var currentAngle = [g_globalAngleX, g_globalAngleY];
    initEventHandlers(canvas, currentAngle);
    requestAnimationFrame(tick);
}

function drawAnt() {
    var antColor = [0.15, 0.1, 0.1, 1.0];
    var groundLevel = -0.74;

    // Use either the paused position or animated position
    var antPosition, facingAngle;

    if (g_animation) {
        // Calculate animated position
        antPosition = [
            g_antOrbitCenter[0] + Math.cos(g_antAngle) * g_antOrbitRadius,
            groundLevel + 0.3,
            g_antOrbitCenter[2] + Math.sin(g_antAngle) * g_antOrbitRadius
        ];
        facingAngle = g_antAngle * 180 / Math.PI + 90;
    } else {
        // Keep the ant in its last known position
        antPosition = [g_antPausedPosition[0], groundLevel + 0.3, g_antPausedPosition[1]];
        facingAngle = g_antPausedAngle * 180 / Math.PI + 90;
    }

    // Apply transformations
    var antMatrix = new Matrix4()
        .translate(antPosition[0], antPosition[1], antPosition[2])
        .rotate(facingAngle, 0, 1, 0);

    // Draw body segments
    var thorax = new Cube();
    thorax.color = antColor;
    thorax.matrix = new Matrix4(antMatrix)
        .scale(0.2, 0.12, 0.18);
    thorax.drawCubeFast();

    var abdomen = new Cube();
    abdomen.color = antColor;
    abdomen.matrix = new Matrix4(antMatrix)
        .translate(-0.12, -0.02, 0.22)
        .scale(0.3, 0.2, 0.4);
    abdomen.drawCubeFast();

    var head = new Cube();
    head.color = antColor;
    head.matrix = new Matrix4(antMatrix)
        .translate(-0.06, 0.03, -0.18)
        .scale(0.12, 0.12, 0.12);
    head.drawCubeFast();

    // Legs with tripod gait (stops moving when paused)
    const LEG_OFFSETS = [-0.15, 0.0, 0.15];
    for (let i = 0; i < 3; i++) {
        let phaseShift = (i % 2 === 0) ? g_clock * 6 : g_clock * 6 + Math.PI;
        let legAngle = g_animation ? Math.sin(phaseShift) * 15 : 0; // Stop legs when paused

        createLeg(antMatrix, 0.1, LEG_OFFSETS[i], 0.3, -1, legAngle);
        createLeg(antMatrix, -0.1, LEG_OFFSETS[i], 0.3, 1, -legAngle);
    }
}



function createLeg(baseMatrix, xOffset, zOffset, length, side, phase) {
    var legColor = [0, 0, 0, 1.0];

    // Coxa (hip joint)
    var coxa = new Cube();
    coxa.color = legColor;
    coxa.matrix = new Matrix4(baseMatrix)
        .translate(xOffset, -0.08, zOffset)
        .rotate(side * (30 + phase), 0, 0, 1)
        .scale(0.025, 0.025, length / 4);
    coxa.drawCubeFast();

    // Femur (upper leg)
    var femur = new Cube();
    femur.color = legColor;
    femur.matrix = new Matrix4(coxa.matrix)
        .translate(0, 0, length / 4)
        .rotate(side * (25 + phase / 2), 0, 0, 1)
        .scale(1, 1, 1.4);
    femur.drawCubeFast();

    // Tibia (lower leg)
    var tibia = new Cube();
    tibia.color = legColor;
    tibia.matrix = new Matrix4(femur.matrix)
        .translate(0, 0, length / 4 * 1.4)
        .rotate(side * (15 + phase / 4), 0, 0, 1)
        .scale(0.8, 0.8, 1.5);
    tibia.drawCubeFast();
}


function createAntenna(baseMatrix, xOffset, yOffset, zOffset, side, time) {
    var antennaColor = [0.25, 0.15, 0.15, 1.0];

    var antennaSwing = Math.sin(time * 2) * 10; // Creates a slow swaying motion

    // Base
    var base = new Cube();
    base.color = antennaColor;
    base.matrix = new Matrix4(baseMatrix)
        .translate(xOffset, yOffset, zOffset)
        .rotate(side * (30 + antennaSwing), 1, 0, 0)
        .scale(0.01, 0.01, 0.15);
    base.drawCubeFast();

    // Tip
    var tip = new Cube();
    tip.color = antennaColor;
    tip.matrix = new Matrix4(base.matrix)
        .translate(0, 0, 1)
        .rotate(side * -15, 1, 0, 0)
        .scale(1, 1, 0.8);
    tip.drawCubeFast();
}

function tick() {
    g_seconds = performance.now() / 1000.0 - g_start_time;
    g_clock = performance.now() / 1000.0 - g_clockStart;

    if (g_animation) {
        // Walking cycle with pauses
        let phase = Math.sin(g_clock * 6) * 0.5 + 0.5;
        g_upperAngle = 20 * phase;
        g_lowerAngle = -30 * phase;

        // Update walking motion
        let walkSpeed = (Math.sin(g_clock * 3) + 1.2) * 0.5 * g_antOrbitSpeed;
        g_antAngle += walkSpeed * 0.02;

        // Store last position when animation is running
        g_antPausedPosition = [
            g_antOrbitCenter[0] + Math.cos(g_antAngle) * g_antOrbitRadius,
            g_antOrbitCenter[2] + Math.sin(g_antAngle) * g_antOrbitRadius
        ];
        g_antPausedAngle = g_antAngle;
    }

    renderAllShapes();
    requestAnimationFrame(tick);
}



function keydown(ev) {
    if (ev.keyCode === 68) {
        g_camera.right();
    } else if (ev.keyCode === 65) {
        g_camera.left();
    } else if (ev.keyCode === 87) {
        g_camera.forward();
    } else if (ev.keyCode === 83) {
        g_camera.backward();
    } else if (ev.keyCode === 69) {
        g_camera.rotRight();
    } else if (ev.keyCode === 81) {
        g_camera.rotLeft();
    } else if (ev.keyCode === 90) {
        g_camera.upward();
    } else if (ev.keyCode === 88) {
        g_camera.downward();
    }
    renderAllShapes();
}

function renderAllShapes() {
    var startTime = performance.now();

    // Pass the project matrix
    var projMat = new Matrix4();
    projMat.setPerspective(60, canvas.width / canvas.height, .1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    // Pass the view matrix
    var viewMat = new Matrix4();
    viewMat.setLookAt(
        g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
        g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
        g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // Pass the global rotate matrix
    var globalRotMat = new Matrix4().rotate(g_globalAngleX, 1, 0, 0)
    globalRotMat.rotate(g_globalAngleY, 0, 1, 0);
    globalRotMat.rotate(g_globalAngleZ, 0, 0, 1);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_spotLightPos, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
    gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
    gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

    // Draw the ground
    var floor = new Cube();
    floor.textureNum = 2;
    if (g_normal) {
        floor.textureNum = -3;
    }
    floor.matrix.translate(-0, -.75, -0);
    floor.matrix.scale(20, .01, 20);
    floor.matrix.translate(0, -0.5, 0);
    floor.drawCubeFast();

    // 🔹 Adding a Cube on the Ground
    var centerCube = new Cube();
    centerCube.color = [0.8, 0.2, 0.2, 1.0];  // Red-colored cube
    centerCube.matrix.translate(10, 0, 8); // Centered at (x, y, z)
    centerCube.matrix.scale(0.5, 0.5, 0.5);   // Scale to half size
    centerCube.drawCubeFast();

    var light = new Cube();
    light.color = [2,2,0,1];
    if (g_normal) {
        light.textureNum = -3;
    }
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-.1,-.1,-.1);
    light.matrix.translate(-.5,-.5,-.5);
    light.drawCubeFast();

    drawSetting();
    if (g_migong) {
        draw_migong();
    } else if (drawMap_bool) {
        drawMap();
    }

    drawAnt();

    var duration = performance.now() - startTime;
    SendTextToHTML(" ms:" + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "fps");
}


function SendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    htmlElm.innerHTML = text;
}

function drawSetting() {
    var sky = new Cube();
    sky.textureNum = 1;
    if (g_normal) {
        sky.textureNum = -3;
    }
    sky.matrix.translate(0, 0, 0);
    sky.matrix.scale(20, 20, 20);
    sky.matrix.translate(0, -0.5, 0);
    sky.drawCubeFast();

    var sphere_1 = new Sphere()
    sphere_1.color = [0,0,0,1]
    if (g_normal) {
        sphere_1.textureNum = -3;
    }
    sphere_1.matrix.translate(12, 1, 12);
    sphere_1.render();
}

let g_map = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 2, 2, 2, 0, 2, 0, 1, 1, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 2],
    [2, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2, 0, 2],
    [2, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 2, 0, 2, 0, 2, 2, 2, 0, 0, 0, 2, 2, 2, 0, 0, 2, 2, 0, 0, 0, 2],
    [2, 2, 0, 0, 0, 0, 0, 2, 2, 0, 0, 2, 0, 2, 0, 0, 0, 2, 2, 0, 2, 2, 0, 2, 0, 0, 2, 0, 0, 2, 0, 2],
    [2, 0, 0, 0, 2, 2, 0, 0, 0, 2, 0, 2, 0, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 2],
    [2, 0, 2, 2, 0, 0, 0, 2, 0, 0, 0, 2, 2, 2, 0, 0, 2, 0, 0, 2, 2, 2, 0, 0, 0, 2, 0, 2, 0, 0, 0, 2],
    [2, 0, 2, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 2, 0, 0, 0, 0, 2, 0, 0, 0, 2, 2, 0, 0, 2, 0, 2],
    [2, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 2, 2, 0, 0, 2, 0, 0, 0, 0, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
];

function drawMap() {
    //soil == 0
    //fence == 1
    //grass == 2
    //sky == 3

    for (x = 0; x < 32; x++) {
        for (y = 0; y < 32; y++) {
            for (z = 0; z < g_map[x][y]; z++) {
                var cube_rendering = new Cube();
                if (g_map[x][y] === 0) {
                    cube_rendering.textureNum = 0;
                    cube_rendering.matrix.translate(y - 4, z - 0.75, x - 4);
                    cube_rendering.drawCubeFast();
                } else if (g_map[x][y] === 1) {
                    cube_rendering.textureNum = 2;
                    cube_rendering.matrix.translate(y - 4, z - 0.75, x - 4);
                    cube_rendering.drawCubeFast();
                } else if (g_map[x][y] >= 2) {
                    cube_rendering.textureNum = 0;
                    cube_rendering.matrix.translate(y - 4, z - 0.75, x - 4);
                    cube_rendering.drawCubeFast();
                }
            }
        }
    }
}

let g_migongmap = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 2, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 2, 0, 0, 0, 2, 0, 1, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 2, 0, 0, 0, 2, 0, 1, 2, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 2, 0, 0, 0, 0, 2, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
];

function draw_migong() {
    for (let x = 0; x < g_migongmap.length; x++) {
        for (let y = 0; y < g_migongmap[x].length; y++) {
            let height = g_migongmap[x][y];
            if (height > 0) {
                let cube_rendering = new Cube();
                cube_rendering.matrix.translate(y - 4, height - 0.75, x - 4);
                
                if (height === 0) {
                    cube_rendering.textureNum = 0; // Soil
                } else if (height === 1) {
                    cube_rendering.textureNum = 2; // Fence
                } else if (height >= 2 && height < 7) {
                    cube_rendering.textureNum = 0; // Grass
                } else if (height >= 7) {
                    cube_rendering.color = [1, 1, 1, 1]; // White color
                }
                cube_rendering.drawCubeFast();
            }
        }
    }
}


function initEventHandlers(canvas, currentAngle) {
    var dragging = false;
    var lastX = -1, lastY = -1;
    canvas.onmousedown = function (ev) {
        var x = ev.clientX, y = ev.clientY;
        var rect = ev.target.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            lastX = x;
            lastY = y;
            dragging = true;
        }
    };
    canvas.onmouseup = function () {
        dragging = false;
    }; // Mouse is released
    canvas.onmousemove = function (ev) { // Mouse is moved
        var x = ev.clientX
        var y = ev.clientY;
        if (dragging) {
            var factor = 100 / canvas.height; // The rotation ratio
            var dx = factor * (x - lastX);
            var dy = factor * (y - lastY);
            // Limit x-axis rotation angle to -90 to 90 degrees
            currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
            currentAngle[1] = currentAngle[1] + dx;
            g_globalAngleX = -currentAngle[0];
            g_globalAngleY = -currentAngle[1];

        }
        lastX = x;
        lastY = y;
    };
}
