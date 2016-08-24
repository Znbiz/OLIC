/**
 * This source code is licensed under the GPLv3 License.
 * Author: Alexei Nekrasov (znbiz, E-mail: nekrasov.aleks1992@gmail.com)
 */
var gl;
var shaderProgram;
var vertexBuffer;
var indexBuffer;
var myCanvas;
var textureCoordsBuffer; // буфер координат текстуры
 
var texture; // переменна€ дл€ хранени€ текстуры
var textureField;
 
window.onload = function() {
 
    var canvas = document.getElementById("canvas3D");
    myCanvas = document.getElementById("myCanvas");
    try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    catch (e) { }
 
    if (!gl) {
        alert("¬аш браузер не поддерживает WebGL");
    }
    if (gl) {
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        var float_texture_ext = gl.getExtension('OES_texture_float');
 
        initShaders();
        initBuffers();
 
        setTextures();
    }
}
 
function setTextures(flagf, flagi, field, width, height, zoom, shiwtwidth, shiwtheight) {
    flagf = flagf || 1;
    flagi = flagi || 1;
    zoom = zoom || 1;
    shiwtwidth = shiwtwidth || 0;
    shiwtheight = shiwtheight || 0;  
    texture = gl.createTexture();
    textureField = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.bindTexture(gl.TEXTURE_2D, textureField);
 
    var fieldWH = fieldWidthHeight(500, 500);
    var imagedWH = imageWidthHeight(500, 500);
    //alert(zoom + '  ' + shiwtheight + '  ' + shiwtwidth);
    var fieldbuf = fillTexture(flagf, fieldWH[0], fieldWH[1], field, width, height, zoom, shiwtwidth, shiwtheight);
    var imagebuf = imageTexture(flagi, imagedWH[0], imagedWH[1]);
 
    if ((flagf != 3) && (flagf != 4)) {
        handleTextureLoaded(fieldbuf, textureField, 1, fieldWH[0], fieldWH[1]);
    } else {
        handleTextureLoaded(fieldbuf, textureField, 1, width, height);
    }
    handleTextureLoaded(imagebuf, texture, 0, imagedWH[0], imagedWH[1]);
    setupWebGL();
    draw();
}
 
function fillTexture(flagfield, width, height, field, inwidth, inheight, zoom, shiwtwidth, shiwtheight) {
    var size = width * height * 4;
    var buf = new Float32Array(size);
    var off, x, y;
    var ky = height / 2;
    var kx = width / 2;
    //alert(zoom + '  ' + shiwtheight + '  ' + shiwtwidth);
    shiwtheight = Math.ceil(shiwtheight);
    shiwtwidth = Math.ceil(shiwtwidth);
    if (flagfield == 1) {
        for (var j = 0; j < height; j++) {
            for (var i = 0; i < width; i++) {
                x = (i - kx) / zoom + shiwtwidth;
                y = (ky - j) / zoom + shiwtheight;
                off = (i + j * width) * 4;
                buf[off + 0] = x;
                buf[off + 1] = y*y+ x;
                buf[off + 2] = 0;
                buf[off + 3] = 0;
            }
        }
    }
    if (flagfield == 2) {
        for (var j = 0; j < height; j++) {
            for (var i = 0; i < width; i++) {
                x = (i - kx) / zoom + shiwtwidth;
                y = (ky - j) / zoom + shiwtheight;
                off = (i + j * width) * 4;
                buf[off + 0] = y;
                buf[off + 1] = -x;
                buf[off + 2] = 0;
                buf[off + 3] = 0;
            }
        }
    }
    if (flagfield == 3) {
        buf = new Float32Array(inheight * inwidth * 4);
        for (var j = 0; j < inheight; j++) {
            for (var i = 0; i < inwidth; i++) {
                off = (i + j * inwidth) * 4;
                buf[off + 0] = field[2 * (i + j * inwidth)];
                buf[off + 1] = field[2 * (i + j * inwidth) + 1];
                buf[off + 2] = 0;
                buf[off + 3] = 0;
            }
        }
    }
    if (flagfield == 4) {
         
    }
    return buf;
}
 
function imageTexture(flag, width, height) {
    var texdata = new Uint8Array(width * height);
    var dimPixel = 3; //размер точек
    //генератор белых точек
    for (var i = 0, l = width * height; i < l; ++i) {
        if (flag == 2) {
            if (Math.random() > 0.994) {
                var x = i % height,
                    y = (i / width) >> 0;
 
                if (x < width - dimPixel && y < height - dimPixel) {
                    for (var k = 0; k < dimPixel; ++k) {
                        for (var j = 0; j < dimPixel; ++j) {
                            texdata[(x + k) + (y + j) * width] = 255;
                        }
                    }
                }
            }
        } else {
            if ((((i % width) % 15) == 0) && ((((i / width) >> 0) % 15) == 0)) {
                var x = i % height,
                                    y = (i / width) >> 0;
 
                if (x < width - dimPixel && y < height - dimPixel) {
                    for (var k = 0; k < dimPixel; ++k) {
                        for (var j = 0; j < dimPixel; ++j) {
                            texdata[(x + k) + (y + j) * width] = 255;
                        }
                    }
                }
            }
        }
    }
    var numPixels = width * height;
    var size = numPixels * 4;
    var buf = new Uint8Array(size);
    for (var ii = 0; ii < numPixels; ++ii) {
        var off = ii * 4;
        buf[off + 0] = texdata[ii];
        buf[off + 1] = texdata[ii];
        buf[off + 2] = texdata[ii];
        buf[off + 3] = 255;
    }
    return buf;
}