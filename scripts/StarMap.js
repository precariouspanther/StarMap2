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