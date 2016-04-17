/**
 *
 * @author Adam Benson <adam@precariouspanther.net>
 */

var StarMap = function (width, height, maxStars) {
    'use strict';
    var threshold = Math.max(((width + height) / 2 ) / 40,30);
    var maxLines = maxStars * 7;
    var renderer = PIXI.autoDetectRenderer(width, height, {backgroundColor: 0x160831});
    document.body.appendChild(renderer.view);
    var stage = new PIXI.Container();
    var joinLines = new PIXI.Graphics();
    joinLines.blendMode = PIXI.BLEND_MODES.ADD;
    var counter = $('<span class="counter"></span>').appendTo(document.body);

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
    stage.addChild(backgroundSprite);

    var lineCount,joinCount;
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
        deadNodes: [],
        init: function () {
            for (var x = 0; x < maxStars; x++) {
                $scope.addStar(new Vector2(Math.random() * width, Math.random() * height), $scope);
            }
            $scope.mouse.active = false;

            stage.addChild(joinLines);
            stage.addChild(shadowSprite);
        },
        addStar: function (position) {
            var p = new Particle(position, $scope);
            $scope.addNode(p);
            if ($scope.nodes.length > maxStars) {
                $scope.killNode();
            }
        },
        addNode: function (node) {
            $scope.nodes.push(node);
        },
        killNode: function () {
            var dead = $scope.nodes.shift();
            $scope.deadNodes.push(dead);
            dead.die();
        },
        tick: function () {
            var distance;
            counter.html($scope.nodes.length + $scope.deadNodes.length);
            //Cull too many stars
            if ($scope.nodes.length > maxStars) {
                $scope.killNode();
            }

            lineCount = 0;
            requestAnimationFrame($scope.tick);
            joinLines.clear();
            $scope.nodes.forEach(function (node, i) {
                //Particles
                node.tick();
                if (lineCount < maxLines) {
                    joinCount=0;
                    $scope.nodes.slice(i).forEach(function (joinNode) {
                        if (lineCount > maxLines || joinCount > 12) {
                            return;
                        }
                        var d2 = joinNode.position.distanceSquare(node.position);
                        if (d2 < thresholdSquare) {
                            lineCount++;
                            joinCount++;
                            distance = Math.sqrt(d2);
                            var alpha = (((threshold - distance) / threshold) * 0.4) + (Math.random() * 0.05);
                            joinLines.lineStyle(alpha * (node.radius + joinNode.radius) * 3, 0x00dbff, alpha);
                            joinLines.moveTo(node.position.x, node.position.y);
                            joinLines.lineTo(joinNode.position.x, joinNode.position.y);
                        }
                    });
                }

                //Mouse active
                if ($scope.mouse.active) {
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
            //Draw our deadnodes separately (they fade out but shouldn't have lines)
            $scope.deadNodes.forEach(function(node,i){
                node.tick();
                if(node.state == "DEAD"){
                    stage.removeChild(node.sprite);
                    $scope.deadNodes.splice($scope.deadNodes.indexOf(node), 1);
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