'use strict';

angular.module('echoInYourFaceApp')
  .controller('MainCtrl', function ($scope, socket) {
	socket.forward('songChange', $scope);
	$scope.$on('socket:songChange', function (ev, data) {
		$scope.nowPlaying = data;
	});
  });
