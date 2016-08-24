/**
 * This source code is licensed under the GPLv3 License.
 * Author: Alexei Nekrasov (znbiz, E-mail: nekrasov.aleks1992@gmail.com)
 */

function initShaders() {
    var fragmentShader = getShader(gl.FRAGMENT_SHADER, 'shader-fs');
    var vertexShader = getShader(gl.VERTEX_SHADER, 'shader-vs');

    shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Не удалось установить шейдеры");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexTextureAttribute = gl.getAttribLocation(shaderProgram, "aVertexTextureCoords");
    gl.enableVertexAttribArray(shaderProgram.vertexTextureAttribute);
}

// Функция создания шейдера
function getShader(type, id) {
    var source = document.getElementById(id).textContent;

    var shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("Ошибка компиляции шейдера: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function initBuffers() {

    var vertices = [
    -1, -1, 0.5,
    -1, 1, 0.5,
    1, 1, 0.5,
    1, -1, 0.5
    ];

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    vertexBuffer.itemSize = 3;

    var indices = [0, 1, 2, 2, 3, 0];
    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    indexBuffer.numberOfItems = indices.length;

    // Координаты текстуры
    var textureCoords = [
                0.0, 0.0,
                0.0, 1.0,
                1.0, 1.0,
                1.0, 0.0
    ];
    // Создание буфера координат текстуры
    textureCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    textureCoordsBuffer.itemSize = 2; // каждая вершина имеет две координаты
    textureCoordsBuffer.numItems = 4;
}

function draw() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
    vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute,
    textureCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.drawElements(gl.TRIANGLES, indexBuffer.numberOfItems, gl.UNSIGNED_SHORT, 0);

}

function setupWebGL() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
}

function setTextures() {
    texture = gl.createTexture();
    textureField = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.bindTexture(gl.TEXTURE_2D, textureField);

    var fieldWH = fieldWidthHeight(256, 256);
    var imagedWH = imageWidthHeight(500, 500);

    var fieldbuf = fillTexture(fieldWH[0], fieldWH[1]);
    var imagebuf = imageTexture(imagedWH[0], imagedWH[1]);

    handleTextureLoaded(fieldbuf, textureField, 1, fieldWH[0], fieldWH[1]);
    handleTextureLoaded(imagebuf, texture, 0, imagedWH[0], imagedWH[1]);
    setupWebGL();
    draw();
}

function handleTextureLoaded(image, texture, lav, width, height) {
    if (lav == 0) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
    } else {
        var ext = (
          gl.getExtension("WEBGL_compressed_texture_s3tc") ||
          gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
          gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc")
        );
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        var ext = (
         gl.getExtension('EXT_texture_filter_anisotropic') ||
         gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
         gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
       );
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "fieldSampler"), 1);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, image);
    }
}

function fieldWidthHeight(x, y) {
    var WH = [x, y];
    return WH;
}

function imageWidthHeight(x, y) {
    var WH = [x, y];
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "imageWidthf"), x);
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "imageHeightf"), y);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "imageWidth"), x);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "imageHeight"), y);
    return WH;
}