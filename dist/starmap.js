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
/**
 *
 * @author Adam Benson <adam@precariouspanther.net>
 */

var Particle = function (position, app) {
    'use strict';
    var radius = Math.random() * 1.1 + 1;
    var haloRadius = Math.ceil(radius * 20);
    var colour = {
        red: 255,
        green: 255,
        blue: 255
    };
    if (Math.random() > 0.7) {
        colour.red = Math.round(Math.random() * 100 + 55);
        colour.green = Math.round(Math.random() * 100 + 55);
        colour.blue = 255;
    }

    var texture = new CanvasTexture(function (canvas) {
        canvas.width = haloRadius;
        canvas.height = haloRadius;
        //Core
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgb(' + colour.red + ',' + colour.green + ',' + colour.blue + ')';
        ctx.beginPath();
        ctx.arc(haloRadius / 2, haloRadius / 2, radius, 0, 360, false);
        ctx.fill();
        //Halo
        var grd = ctx.createRadialGradient(haloRadius / 2, haloRadius / 2, radius, haloRadius / 2, haloRadius / 2, Math.ceil(haloRadius));
        grd.addColorStop(0, 'rgba(' + colour.red + ',' + colour.green + ',' + colour.blue + ',' + 0.05 + ')');
        grd.addColorStop(0.3, 'rgba(' + colour.red + ',' + colour.green + ',' + colour.blue + ',0)');

        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(haloRadius / 2, haloRadius / 2, haloRadius, 0, 360, false);
        //ctx.fill();
    });
    var sprite = new PIXI.Sprite(texture);
    //sprite.blendMode = PIXI.BLEND_MODES.ADD;
    sprite.blendMode = PIXI.BLEND_MODES.SCREEN;
    //sprite.blendMode = PIXI.BLEND_MODES.HARD_LIGHT;
    //sprite.blendMode = PIXI.BLEND_MODES.SCREEN;
    app.stage.addChild(sprite);

    //app.stage.addChild(joinLines);
    var $scope = {
        sprite: sprite,
        stage: app,
        radius: radius,
        acceleration: new Vector2(),
        velocity: new Vector2(Math.random() - 0.5, Math.random() - 0.5),
        position: position,
        colour: {
            red: 255,
            green: 255,
            blue: 255
        },
        init: function () {
            if (Math.random() > 0.7) {
                $scope.colour.red = Math.round(Math.random() * 200 + 55);
                $scope.colour.green = Math.round(Math.random() * 200 + 55);
                $scope.colour.blue = Math.round(Math.random() * 200 + 55);
            }
        },
        tick: function () {
            //Twinkle
            sprite.alpha = Math.random() * 0.4 + 0.6;

            //Move
            $scope.acceleration.set(Math.random() - 0.5, Math.random() - 0.5).scale(app.maxSpeed);
            $scope.acceleration.clampAbs(app.maxSpeed);

            $scope.velocity.add($scope.acceleration, 0.1);

            if ($scope.position.x + $scope.velocity.x > window.innerWidth || $scope.position.x + $scope.velocity.x < 1) {
                //Bounce X
                $scope.velocity.x *= -0.9;
                $scope.acceleration.x *= -0.9;

            }
            if ($scope.position.y + $scope.velocity.y > window.innerHeight || $scope.position.y + $scope.velocity.y < 1) {
                //Bounce Y
                $scope.velocity.y *= -0.9;
                $scope.acceleration.y *= -0.9;
            }
            $scope.velocity.clampAbs(app.maxSpeed);
            $scope.position.add($scope.velocity, 0.1);
            sprite.position.x = $scope.position.x - (haloRadius / 2);
            sprite.position.y = $scope.position.y - (haloRadius / 2);
        }
    };

    $scope.init();
    return $scope;
};
/**
 *
 * @author Adam Benson <adam@precariouspanther.net>
 */

var StarMap = function (width, height, starCount, threshold) {
    'use strict';
    var renderer = PIXI.autoDetectRenderer(width, height, {backgroundColor: 0x160831});
    document.body.appendChild(renderer.view);
    var stage = new PIXI.Container();
    var joinLines = new PIXI.Graphics();
    joinLines.blendMode = PIXI.BLEND_MODES.ADD;

    var backgroundTexture = new CanvasTexture(function (canvas) {
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        var grd = ctx.createRadialGradient(width / 2, height / 2, 1, width / 2, height / 2, height);
        grd.addColorStop(0, 'rgb(22,8,49)');
        grd.addColorStop(0.4, 'rgb(22,8,49)');
        grd.addColorStop(0.6, 'rgb(12,7,24)');
        grd.addColorStop(1, 'rgb(0,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
    });

    var renderTexture = new PIXI.RenderTexture(renderer, width, height);
    var renderTexture2 = new PIXI.RenderTexture(renderer, width, height);

    var backgroundSprite = new PIXI.Sprite(backgroundTexture);
    var shadowSprite = new PIXI.Sprite(renderTexture);
    var convolutionFilter = new PIXI.filters.ConvolutionFilter([
        0.1, 0.4, 0.1,
        0.4, 0.0, 0.4,
        0.1, 0.4, 0.1
    ], width, height);

    //shadowSprite.alpha = 0.49;
    shadowSprite.alpha = 0.41;
    //shadowSprite.blendMode = PIXI.BLEND_MODES.SOFT_LIGHT;

    /* var filter = new PIXI.filters.ConvolutionFilter([
     0.1,0.1,0.1,
     0.1,0.2,0.1,
     0.1,0.1,0.1
     ],width,height);*/
    shadowSprite.filters = [convolutionFilter];
    //shadowSprite.blendMode = PIXI.BLEND_MODES.OVERLAY;
    //shadowSprite.blendMode = PIXI.BLEND_MODES.ADD;
    //shadowSprite.blendMode = PIXI.BLEND_MODES.SOFT_LIGHT;
    stage.addChild(backgroundSprite);


    var thresholdSquare = Math.pow(threshold, 2);
    var mouseThreshold = threshold * 10;
    var mouseThresholdSquare = thresholdSquare * 10;
    var $scope = {
        maxSpeed: 10,
        mouse: new Vector2(),
        width: width,
        height: height,
        stage: stage,
        joinLines: joinLines,
        nodes: [],
        init: function () {
            for (var x = 0; x < starCount; x++) {
                var p = new Particle(new Vector2(Math.random() * width, Math.random() * height), $scope);
                $scope.addNode(p);
            }
            $scope.mouse.active = false;

            stage.addChild(joinLines);
            stage.addChild(shadowSprite);
        },
        addNode: function (node) {
            $scope.nodes.push(node);
        },
        removeNode: function (node) {
            $scope.nodes.splice($scope.nodes.indexOf(node), 1);
        },
        tick: function () {
            var distance;
            requestAnimationFrame($scope.tick);
            joinLines.clear();
            $scope.nodes.forEach(function (node, i) {
                //Particles
                node.tick();
                //Join lines
                $scope.nodes.slice(i).forEach(function (joinNode) {
                    var d2 = joinNode.position.distanceSquare(node.position);
                    if (d2 < thresholdSquare) {
                        distance = Math.sqrt(d2);
                        var alpha = (((threshold - distance) / threshold) * 0.4) + (Math.random() * 0.05);
                        joinLines.lineStyle(alpha * (node.radius + joinNode.radius) * 3, 0x00dbff, alpha);
                        joinLines.moveTo(node.position.x, node.position.y);
                        joinLines.lineTo(joinNode.position.x, joinNode.position.y);
                    }
                });

                //Mouse repulse
                if($scope.mouse.active) {
                    var mDist = node.position.distanceSquare($scope.mouse);
                    if (mDist < mouseThresholdSquare) {
                        distance = Math.sqrt(mDist);
                        var alpha = (((mouseThreshold - distance) / mouseThreshold) * 0.4) + (Math.random() * 0.05);
                        joinLines.lineStyle(1, 0x00dbff, alpha);
                        joinLines.moveTo(node.position.x, node.position.y);
                        joinLines.lineTo($scope.mouse.x, $scope.mouse.y);
                    }
                }

            });

            //Render stars to texture, but move it offscreen (for next frame)
            backgroundSprite.alpha = 0;
            joinLines.alpha = 0.1;
            renderTexture2.render($scope.stage, null, true);
            joinLines.alpha = 1;
            backgroundSprite.alpha = 1;

            //Bring previous frames stars onscreen for glows
            var temp = renderTexture;
            renderTexture = renderTexture2;
            renderTexture2 = temp;
            shadowSprite.texture = renderTexture;

            renderer.render($scope.stage);
        }
    };
    $scope.init();
    return $scope;
};
/**
 *
 * @author Adam Benson <adam@precariouspanther.net>
 */

/**
 *
 * @param {int} [x]
 * @param {int} [y]
 * @constructor
 */
var Vector2 = function (x, y) {
    'use strict';
    if (!x)x = 0;
    if (!y)y = 0;
    var $scope = {
        x: x,
        y: y,
        add: function (vector, scale) {
            scale = scale || 1;
            $scope.x += vector.x * scale;
            $scope.y += vector.y * scale;
            return $scope;
        },
        set: function (x, y) {
            $scope.x = x;
            $scope.y = y;
            return $scope;
        },
        scale: function (multiplier) {
            $scope.x *= multiplier;
            $scope.y *= multiplier;
            return $scope;
        },
        clamp: function (min, max) {
            $scope.x = Math.min(Math.max($scope.x, min), max);
            $scope.y = Math.min(Math.max($scope.y, min), max);
            return $scope;
        },
        clampAbs: function (val) {
            $scope.clamp(-val, val);
            return $scope;
        },
        distance: function (vector) {
            return Math.sqrt($scope.distanceSquare(vector));
        },
        distanceSquare: function (vector) {
            var dX = Math.pow(vector.x - $scope.x, 2);
            var dY = Math.pow(vector.y - $scope.y, 2);
            return dX + dY;
        }

    };
    return $scope;
};