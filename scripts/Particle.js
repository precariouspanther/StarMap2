/**
 *
 * @author Adam Benson <adam@precariouspanther.net>
 */

var Particle = function (position, app) {
    'use strict';

    var sprite = new PIXI.Sprite();

    sprite.blendMode = PIXI.BLEND_MODES.SCREEN;
    app.stage.addChild(sprite);

    var state = {
        ALIVE: "ALIVE",
        DYING: "DYING",
        DEAD: "DEAD"
    };

    //app.stage.addChild(joinLines);
    var $scope = {
        alpha: 1,
        state: state.ALIVE,
        sprite: sprite,
        stage: app,
        radius: 0,
        haloRadius: 0,
        colour: {
            red: 255,
            green: 255,
            blue: 255
        },
        acceleration: new Vector2(),
        velocity: new Vector2(Math.random() - 0.5, Math.random() - 0.5),
        position: position,
        init: function () {
            $scope.radius = Math.random() * 1.1 + 1;
            if (Math.random() > 0.7) {
                $scope.colour.red = Math.round(Math.random() * 100 + 55);
                $scope.colour.green = Math.round(Math.random() * 100 + 55);
                $scope.colour.blue = 255;
            }
            $scope.createTexture($scope.radius);
        },
        createTexture: function (radius) {
            $scope.haloRadius = Math.ceil(radius * 20);
            sprite.texture = new CanvasTexture(function (canvas) {
                canvas.width = $scope.haloRadius;
                canvas.height = $scope.haloRadius;
                //Core
                var ctx = canvas.getContext('2d');
                ctx.fillStyle = 'rgb(' + $scope.colour.red + ',' + $scope.colour.green + ',' + $scope.colour.blue + ')';
                ctx.beginPath();
                ctx.arc($scope.haloRadius / 2, $scope.haloRadius / 2, radius, 0, 360, false);
                ctx.fill();
                //Halo
                var grd = ctx.createRadialGradient($scope.haloRadius / 2, $scope.haloRadius / 2, radius, $scope.haloRadius / 2, $scope.haloRadius / 2, Math.ceil($scope.haloRadius));
                grd.addColorStop(0, 'rgba(' + $scope.colour.red + ',' + $scope.colour.green + ',' + $scope.colour.blue + ',' + 0.05 + ')');
                grd.addColorStop(0.3, 'rgba(' + $scope.colour.red + ',' + $scope.colour.green + ',' + $scope.colour.blue + ',0)');

                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc($scope.haloRadius / 2, $scope.haloRadius / 2, $scope.haloRadius, 0, 360, false);
                //ctx.fill();
            });
        },
        die: function () {
            //Trigger fade
            $scope.state = state.DYING;
        },
        tick: function () {
            if ($scope.state == state.DYING) {
                //Dying
                $scope.alpha -= 0.01;
                sprite.alpha = $scope.alpha;
                if ($scope.alpha <= 0) {
                    $scope.state = state.DEAD;
                    return;
                }

                return;
            } else {
                //Twinkle
                sprite.alpha = Math.random() * 0.4 + 0.6;
            }
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
            sprite.position.x = $scope.position.x - ($scope.haloRadius / 2);
            sprite.position.y = $scope.position.y - ($scope.haloRadius / 2);
        }
    };

    $scope.init();
    return $scope;
};