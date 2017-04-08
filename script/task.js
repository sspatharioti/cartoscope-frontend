/**
 * Created by kiprasad on 26/09/16.
 */
var module = angular.module('taskApp', ['ui.router']);

module.config(['$locationProvider', function($locationProvider) {
}]);

module.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider.state({
    name: 'tasks',
    url: '/',
    templateUrl: 'templates/tasks/taskTemplate.html',
    controller: 'taskController',
    resolve: {
      userData: ['$http', function($http) {
        return $http.get('/api/user').then(function(data) {
          return data.data[0];
        }).catch(function() {
          return null;
        });
      }]
    }
  });

  $urlRouterProvider.otherwise('/');

});

module.controller('defaultController', ['$scope', '$location', function($scope, $location) {
  $scope.uiMask = {};
  $scope.uiMask.show = false;
}]);

module.controller('taskController', ['$scope', '$location', '$http', 'userData', '$window',
  function($scope, $location, $http, userData, $window) {
      $window.document.title = "Tasks";
    $scope.showModal = function() {
      $scope.uiMask.show = true;
    };
    $scope.hideModal = function() {
      $scope.uiMask.show = false;
    };

    //alert('After Redirect');

    if (!$location.search().code) {
      alert('You seem to have a wrong link');
      window.location.replace('/');
      return;
    }

    $scope.userType=$location.search().type;
    console.log($scope.userType);

    $scope.tasks = [];
    $scope.dataset = null;

    $scope.getTasks = function() {
      $scope.showModal();
      $http.get('/api/tasks/gettask/' + $scope.code).then(function(e) {
        $scope.dataset = e.data.dataset;
        console.log('dataset ', $scope.dataset);
        $scope.tasks = e.data.items;
        console.log('dataset ', $scope.tasks);

        if (e.data.finished) {
          $scope.finished = true;
          $scope.handleFinish();
        }
        $scope.hideModal();
      }, function(err) {
        $scope.hideModal();
      });
    };

    $scope.handleEnd = function($window){
        if (!userData) {
            //window.location.replace('/consentForm.html#!/kiosk');
             window.location.replace('/survey.html#/survey?code=' + $scope.code+ '&userType=kiosk');
        } else {
            window.location.replace('/UserProfile.html');
        }
    };

    $scope.handleFinish = function() {
      window.alert('finished');
      if (!userData) {
        window.location.replace('/survey.html#/survey?code=' + $scope.code);
      } else {
        window.location.replace('/UserProfile.html');
      }
    };

    $scope.skipToSurvey = function() {
      console.log('Scope code', $scope.code);
      var skip = confirm('Are you sure ?');
      if (skip == true) {
        if (!userData) {
          window.location.replace('/survey.html#/survey?code=' + $scope.code+'&userType=mTurk');
        } else {
          window.location.replace('/UserProfile.html');
        }
      }
    };

    $scope.code = $location.search().code

    $http.get('/api/tasks/getInfo/' + $scope.code).then(function(data) {
      $scope.data = data.data;
      $scope.data.template = JSON.parse($scope.data.template);
      $scope.getTasks();


    }, function(err) {
      alert('You seem to have a wrong/invalid link');
    });

    $scope.getColourClass = function(color) {
      return 'c' + color;
    };

    $scope.getNextTask = function() {
      if (!$scope.dataset || $scope.tasks.length == 0) {
        return null;
      } else {
        return '/api/tasks/getImage/' + $scope.dataset + '/' + $scope.tasks[0];
      }
    };

    $scope.submit = function(option) {

      var body = {
        projectID: $scope.data.id,
        option: option,
        taskID: $scope.tasks[0]
      };

      console.log(body);

      $scope.showModal();
      $http.post('/api/tasks/submit', body).then(function() {
        $scope.tasks.shift();
        $scope.hideModal();
        $scope.data.progress = parseInt($scope.data.progress) + 1;
        if ($scope.tasks.length == 0) {
          $scope.getTasks();
        }
      });
    };
  }]);
