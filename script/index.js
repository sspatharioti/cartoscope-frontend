/**
 * Created by kiprasad on 02/08/16.
 */
var app = angular.module('app', []);

app.controller('controller', function($scope, $http) {
  $http.get('/api/user').then(function(response) {
    $scope.data = response.data;
  }, function(response) {
    $scope.data = 'NOT LOGGED IN';
  });
  $scope.login = function() {
    $http.post('/api/login', $scope.user);
  };

  $scope.call = function() {
    $http.get('/api/user').then(function(response) {
      $scope.data = response.data;
    }, function(response) {
      $scope.data = 'NOT LOGGED IN';
    });
  };

  $scope.logout = function($window) {
    $http.get('/api/logout').then(function(response) {
        $window.location.href='#/login';
    });
  };
});
