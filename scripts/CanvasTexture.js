/**
 *
 * @param cb
 * @returns {PIXI.BaseTexture|PIXI.Texture}
 * @constructor
 * @author Adam Benson <adam@precariouspanther.net>
 */
var CanvasTexture = function (cb) {
    var canvas = document.createElement('canvas');
    if (typeof cb == 'function') cb(canvas);
    return PIXI.Texture.fromCanvas(canvas);
};