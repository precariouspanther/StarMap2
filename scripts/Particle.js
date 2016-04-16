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