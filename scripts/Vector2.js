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