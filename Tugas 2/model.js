//sudut rotasi
let cubeRotation = 0.0;

main();

function main() {
  //mencari elemen HTML dengan atribut id "model-container"
  const canvas = document.querySelector("#model-container");

  //menginisialisasi webgl pada canvas
  const wgl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  //jika webgl tidak tersedia
  if (!wgl) {
    alert("Try to enable WebGL in Chrome.");
    return;
  }

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  //menginisialisasi shader
  const shaderProgram = initShaderProgram(wgl, vsSource, fsSource);

  //menyimpan informasi
  const programInfo = {
    program: shaderProgram,
    //mencari atribut lokasi
    attribLocations: {
      vertexPosition: wgl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexColor: wgl.getAttribLocation(shaderProgram, "aVertexColor"),
    },
    //mengirim data yang tidak berubah selama render
    uniformLocations: {
      projectionMatrix: wgl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ),
      modelViewMatrix: wgl.getUniformLocation(
        shaderProgram,
        "uModelViewMatrix"
      ),
    },
  };

  const buffers = initBuffers(wgl);

  let then = 0;

  function render(now) {
    now *= 0.001; // convert to seconds
    const deltaTime = now - then;
    then = now;

    drawScene(wgl, programInfo, buffers, deltaTime);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function initBuffers(wgl) {
  const positionBuffer = wgl.createBuffer();

  wgl.bindBuffer(wgl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    //bagian depan
    -2.0, -2.0, 2.0, 2.0, -2.0, 2.0, 2.0, 2.0, 2.0, -2.0, 2.0, 2.0,

    //bagian belakang
    -2.0, -2.0, -2.0, -2.0, 2.0, -2.0, 2.0, 2.0, -2.0, 2.0, -2.0, -2.0,

    //bagian atas
    -2.0, 2.0, -2.0, -2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, -2.0,

    //bagian bawah
    -2.0, -2.0, -2.0, 2.0, -2.0, -2.0, 2.0, -2.0, 2.0, -2.0, -2.0, 2.0,

    //bagian kanan
    2.0, -2.0, -2.0, 2.0, 2.0, -2.0, 2.0, 2.0, 2.0, 2.0, -2.0, 2.0,

    //bagian kiri
    -2.0, -2.0, -2.0, -2.0, -2.0, 2.0, -2.0, 2.0, 2.0, -2.0, 2.0, -2.0,
  ];

  wgl.bufferData(
    wgl.ARRAY_BUFFER,
    new Float32Array(positions),
    wgl.STATIC_DRAW
  );

  const faceColors = [
    [0.8, 0.4, 0.4, 1.0],  // Merah pucat
    [0.4, 0.8, 0.4, 1.0],  // Hijau pucat
    [0.4, 0.4, 0.8, 1.0],  // Biru pucat
    [0.8, 0.8, 0.4, 1.0],  // Kuning pucat
    [0.6, 0.4, 0.6, 1.0],  // Ungu pucat
    [0.8, 0.6, 0.4, 1.0]   // Jingga pucat
];

  let colors = [];

  faceColors.map((faceColor) => {
    colors = colors.concat(faceColor, faceColor, faceColor, faceColor);
  });

  const colorBuffer = wgl.createBuffer();

  wgl.bindBuffer(wgl.ARRAY_BUFFER, colorBuffer);
  wgl.bufferData(wgl.ARRAY_BUFFER, new Float32Array(colors), wgl.STATIC_DRAW);

  const indexBuffer = wgl.createBuffer();

  wgl.bindBuffer(wgl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const indices = [
    0,
    1,
    2,
    0,
    2,
    3, // front
    4,
    5,
    6,
    4,
    6,
    7, // back
    8,
    9,
    10,
    8,
    10,
    11, // top
    12,
    13,
    14,
    12,
    14,
    15, // bottom
    16,
    17,
    18,
    16,
    18,
    19, // right
    20,
    21,
    22,
    20,
    22,
    23, // left
  ];

  wgl.bufferData(
    wgl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    wgl.STATIC_DRAW
  );

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
}

function drawScene(wgl, programInfo, buffers, deltaTime) {
  wgl.clearColor(1.0, 0.85, 0.85, 1.0); // Warna pink yang lebih muda
  wgl.clearDepth(1.0);
  wgl.enable(wgl.DEPTH_TEST);
  wgl.depthFunc(wgl.LEQUAL);

  wgl.clear(wgl.COLOR_BUFFER_BIT | wgl.DEPTH_BUFFER_BIT);

  const fieldOfView = (45 * Math.PI) / 180; // in radians
  const aspect = wgl.canvas.clientWidth / wgl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  const modelViewMatrix = mat4.create();

  mat4.translate(modelViewMatrix, modelViewMatrix, [-2.0, 0.5, -10.0]); // Ubah koordinat translasi
  mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * 1.5, [0, 1, 0]); // Ubah sudut rotasi dan sumbu rotasi
  mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * 0.3, [1, 0, 0]); // Ubah sudut rotasi dan sumbu rotasi lainnya

  const scaleFactor = 0.75; // Faktor skala untuk membuat kubus lebih kecil
  mat4.scale(modelViewMatrix, modelViewMatrix, [scaleFactor, scaleFactor, scaleFactor]);

  {
    const numComponents = 3;
    const type = wgl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    wgl.bindBuffer(wgl.ARRAY_BUFFER, buffers.position);
    wgl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    wgl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }

  {
    const numComponents = 4;
    const type = wgl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    wgl.bindBuffer(wgl.ARRAY_BUFFER, buffers.color);
    wgl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    wgl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
  }

  wgl.bindBuffer(wgl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  wgl.useProgram(programInfo.program);

  wgl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );

  wgl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  {
    const vertexCount = 36;
    const type = wgl.UNSIGNED_SHORT;
    const offset = 0;
    wgl.drawElements(wgl.TRIANGLES, vertexCount, type, offset);
  }

  cubeRotation += deltaTime;
}

function initShaderProgram(wgl, vsSource, fsSource) {
  const vertexShader = loadShader(wgl, wgl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(wgl, wgl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = wgl.createProgram();

  wgl.attachShader(shaderProgram, vertexShader);
  wgl.attachShader(shaderProgram, fragmentShader);
  wgl.linkProgram(shaderProgram);

  if (!wgl.getProgramParameter(shaderProgram, wgl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        wgl.getProgramInfoLog(shaderProgram)
    );
    return null;
  }

  return shaderProgram;
}

function loadShader(wgl, type, source) {
  const shader = wgl.createShader(type);

  wgl.shaderSource(shader, source);

  wgl.compileShader(shader);

  if (!wgl.getShaderParameter(shader, wgl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shaders: " + wgl.getShaderInfoLog(shader)
    );

    wgl.deleteShader(shader);

    return null;
  }

  return shader;
}
