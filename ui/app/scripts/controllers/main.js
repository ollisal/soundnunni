'use strict';

angular.module('echoInYourFaceApp')
  .controller('MainCtrl', function ($scope, $http) {
    $http.get('/api/nowplaying').success(function(data) {
    	$scope.nowPlaying = data;
    });
  });
