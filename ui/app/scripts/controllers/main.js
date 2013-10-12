'use strict';

angular.module('echoInYourFaceApp')
  .controller('MainCtrl', function ($scope, socket, $http) {
	socket.forward('songChange', $scope);
	$scope.$on('socket:songChange', function (ev, data) {
		$scope.nowPlaying = data;
  });

  socket.forward('lastFmInfoUpdated', $scope);
  $scope.$on('socket:lastFmInfoUpdated', function (ev) {
    $http.get('/api/nowplaying/lastfm').success(function(data) {
      $scope.lastFmInfo = data;
    });
  });
});
