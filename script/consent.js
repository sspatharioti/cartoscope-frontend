var module = angular.module('consentApp', ['ui.router', 'ngAnimate', 'ngRoute']);
module.config(function($stateProvider, $urlRouterProvider) {

    var n = new Date();

  $stateProvider.state({
    name: 'consent',
    url: '/consent',
    templateUrl: 'templates/consent/consent.html',
    controller: 'consentController'
  });
  $stateProvider.state({
    name: 'instruction',
    url: '/instruction',
    templateUrl: 'templates/consent/instructions.html',
      params: {
        pCode: '',
        workerId:'',
        kioskId:'',
        assignmentId:'',
        hitId:'',
        submitTo:''
      },
    controller: 'instructionController'
  });
  
  $stateProvider.state({
    name: 'examples',
    url: '/examples/:pCode',
    templateUrl: 'templates/consent/example.html',
    params: {
        pCode: '',
        workerId:'',
        kioskId:'',
        assignmentId:'',
        hitId:'',
        submitTo:''
    },
    controller: 'exampleController'
  });

  $stateProvider.state({
      name: 'mturk',
      url: '/mturk/:pCode',
      templateUrl: 'templates/consent/welcome.html',
      controller: 'mTurkController'
  });
  $stateProvider.state({
      name: 'kiosk',
      url: '/',
      templateUrl: 'templates/consent/appDefault.html',
      //templateUrl: '../cmnh.html',
      controller: 'kioskController'
  });
  
  $urlRouterProvider.otherwise('/');
});

module.controller('appController', ['$scope', '$location', function($scope, $location) {
  $scope.params = $location.search();

}]);

module.controller('exampleController', ['$window', '$scope', '$state', '$stateParams', function($window, $scope, $state, $stateParams) {
    $window.document.title = "Examples";
  console.log('In Example Controller');
  console.log('Scope', $scope);
  $scope.params.project= $stateParams.pCode;
  $scope.params.workerId= $stateParams.workerId;
  $scope.params.kioskId= $stateParams.kioskId;
  console.log('$scope.params.project ', $scope.params.project);
  $scope.goTo=5;
  console.log('params', $scope.params)

    if ($scope.params.project == 'RPoFzDjhHLdV') {
        $scope.counter = 0;
        $scope.question = "Do you see evidence of an algal bloom?"
        $scope.goTo=2;
    }
    if ($scope.params.project == 'ASNWK1dZEY1z') {
        $scope.counter = 3;
        $scope.question = "What color is the water?"
        $scope.goTo=5;
    } else {
        $scope.counter = 0;
        $scope.question = "Do you see evidence of an algal bloom?"
        $scope.goTo=2;
    }


    $scope.tutorial = [
        {
            image: '../../images/G0020835.jpg',
            answer: 'Yes',
            text: 'The green colored streaks in the water are likely from algae growing.  Algae is a plant that looks green because it is photosynthesizing.',
            color: '#9cdc1f',
            options: [{'name':'Yes','color': '#9cdc1f'}, {'name':'No','color': '#F7941D'},{'name':'Maybe','color': '#FFF200'}]
        },
        {
            image: '../../images/Port-Clinton-Ohio.jpg',
            answer: 'No',
            text: 'The water is mostly blue indicating that it is unlikely that algae is present at potentially harmful levels. This image is taken from the same bay when an algal bloom is not occurring.',
            color: '#F7941D',
            options: [{'name':'Yes','color': '#9cdc1f'}, {'name':'No','color': '#F7941D'},{'name':'Maybe','color': '#FFF200'}]
        },
        {
            image: '../../images/Old-Woman-Creek-Ohio-anot.jpg',
            answer: 'Maybe',
            text: 'The brownish plume in the water where the river enters the bay indicates the particulate matter is suspended in the water from the river. This run off is likely nutrient rich and could cause an algal bloom in the future because algae will feed on the nutrients.',
            color: '#FFF200',
            options: [{'name':'Yes','color': '#9cdc1f'}, {'name':'No','color': '#F7941D'},{'name':'Maybe','color': '#FFF200'}]
        },
        {
            image: '../../images/G0020835.jpg',
            answer: 'Green',
            text: 'The green colored streaks in the water are likely from algae growing.  Algae is a plant that looks green because it is photosynthesizing.',
            color: '#9cdc1f',
            options: [{'name':'Green','color': '#9cdc1f'}, {'name':'Blue','color': '#0072BC'},{'name':'Brown','color': '#f7941d'}]
        },
        {
            image: '../../images/Port-Clinton-Ohio.jpg',
            answer: 'Blue',
            text: 'The water is mostly blue indicating that it is unlikely that algae is present at potentially harmful levels. This image is taken from the same bay when an algal bloom is not occurring.',
            color: '#0072BC',
            options: [{'name':'Green','color': '#9cdc1f'}, {'name':'Blue','color': '#0072BC'},{'name':'Brown','color': '#f7941d'}]
        },
        {
            image: '../../images/Old-Woman-Creek-Ohio-anot.jpg',
            answer: 'Brown',
            text: 'The brownish plume in the water where the river enters the bay indicates the particulate matter is suspended in the water from the river. This run off is likely nutrient rich and could cause an algal bloom in the future because algae will feed on the nutrients.',
            color: '#f7941d',
            options: [{'name':'Green','color': '#9cdc1f'}, {'name':'Blue','color': '#0072BC'},{'name':'Brown','color': '#f7941d'}]
        }

    ];


    $scope.next_button = function () {
        //console.log('in Next Button');
        //$scope.counter = Number($scope.counter) + Number(1);

        if ($scope.counter < $scope.tutorial.length - 1) {
            $scope.counter = Number($scope.counter) + Number(1);
            console.log($scope.counter , $scope.goTo);
            document.getElementById("correct-note").style.visibility = "hidden";
            document.getElementById("tut_next").style.visibility = "hidden";
        }

        if ($scope.counter == $scope.goTo) {
            document.getElementById("tut_next").style.display = "none";
        }
    };

    $scope.show_Correct_Options = function () {
        document.getElementById("correct-note").style.visibility = "visible";
        document.getElementById("tut_next").style.visibility = "visible";

        if ($scope.counter == $scope.goTo) {
            document.getElementById("tut_start").style.visibility = "visible";
        }
        $('html,body').animate({
                scrollTop: $("#correct-note").offset().top},
            'slow');
    };

    $scope.start = function() {
    var reqParams = {};
    for (var i in $scope.params) {
      if (i == 'workerId' || i == 'assignmentId' || i == 'hitId' || i == 'submitTo' || i == 'kioskId') {
        reqParams[i] = $scope.params[i];
      }
    }

    var qs = '';
    
    for (i in reqParams) {
      qs += '&' + i + '=' + reqParams[i];
    }
    console.log('reqParams ', reqParams);
    if(reqParams.kioskId==1){
        window.location.replace('/api/anon/startKiosk/' + $scope.params.project + '?' + 'workerId='+ $scope.params.workerId+'&kioskUser=1');
    } else{
        window.location.replace('/api/anon/startAnon/' + $scope.params.project + '?' + qs.substr(1));
    }


  };

}]);

module.controller('mTurkController', ['$window','$scope','$location','$state','$stateParams',function($window, $scope,$location,$state,$stateParams){

    $window.document.title = "Cartoscope";
    $scope.begin = function() {
      console.log('Begin....');
      console.log($stateParams);

        $scope.params = $location.search();
        $scope.params.project= $stateParams.pCode;

        var reqParams = {};
        for (var i in $scope.params) {
            if (i == 'workerId' || i == 'assignmentId' || i == 'hitId' || i == 'submitTo') {
                reqParams[i] = $scope.params[i];
            }
        }

        var qs = '';

        for (i in reqParams) {
            qs += '&' + i + '=' + reqParams[i];
        }

        window.location.replace('/api/anon/startAnon/' + $scope.params.project + '?' + qs.substr(1));
    }
}]);

module.controller('kioskController', ['$window','$scope','$location','$state','$stateParams','$http', '$cookies',
    function($window,$scope,$location,$state,$stateParams,$http, $cookies){
    $window.document.title = "Cartoscope";
    $scope.begin = function() {
        console.log('Begin in Kiosk Controller....');
        //console.log($stateParams);

        $scope.params = $location.search();
        //check for cookie and set it if it doesnt exist
        console.log('get cookie', $cookies.get('kioskUser'));
        if(!$cookies.get('kioskUser')){
            $cookies.put('kioskUser', new Date().getMilliseconds(),{
                expires: '99983090'
            });
        }

        console.log('cookies ', $cookies.get('kioskUser'));


        //getProjects Code dynamically
        $http.get('/api/anon/startKiosk/').then(function(e, data) {
            console.log('e', e, data);
            $scope.params.project = e.data.projectID;
            $scope.workerId = e.data.workerID;

            $http.get('/api/anon/consentKiosk/' + $scope.params.project + '?' + 'workerId='+ $scope.workerId).then(function(e, data) {
                console.log('data ', e.data.workerId);
                $state.go('examples', {pCode: $scope.params.project, workerId: e.data.workerId, kioskId:1});
                //window.location.replace('/api/anon/startKiosk/' + $scope.params.project+ '?workerId='+e.data.workerId+'&kioskId=1');
            }, function(err) {
                alert('error'+ err);
            });

        }, function(err) {
             console.log('error', err);
        });
    }
}]);

module.controller('instructionController', ['$window','$scope', '$state','$stateParams','$location', function($window, $scope, $state, $stateParams) {
    console.log('locations  ', $state);
    $window.document.title = "Instructions";
    if($stateParams.kioskId){
        $scope.params.project= $stateParams.pCode;
        $scope.params.workerId= $stateParams.workerId;
        $scope.params.kioskId =  $stateParams.kioskId;
    }

    $scope.showExamples = function() {
        console.log('params', $scope, $scope.params);
        console.log('examples/:' + $scope.params.project);

        if ($stateParams.kioskId) {
            $state.go('examples', {
                pCode: $scope.params.project,
                workerId: $scope.params.workerId,
                kioskId: $scope.params.kioskId
            });
        } else {
            $state.go('examples', {
                pCode: $scope.params.project,
                workerId: $scope.params.workerId
            });
        }

    }

}]);

module.controller('consentController', ['$scope', '$http', '$state',
  function($scope, $http, $state) {
    
    $scope.agree = function() {
      var reqParams = {};
      for (var i in $scope.params) {
        if (i == 'workerId' || i == 'assignmentId' || i == 'hitId' || i == 'submitTo') {
          reqParams[i] = $scope.params[i];
        }
      }
      
      var qs = '';
      
      for (i in reqParams) {
        qs += '&' + i + '=' + reqParams[i];
      }

      console.log(qs.substr(1));
      $http.get('/api/anon/consent/' + $scope.params.project + '?' + qs.substr(1)).then(function(e, data) {
        $state.go('instruction', {workerId: $scope.params.workerId,
            assignmentId: $scope.params.assignmentId, hitId:$scope.params.hitId, submitTo: $scope.params.submitTo});
        // window.location.replace('/api/anon/startAnon/' + $scope.params.project + '?' + qs.substr(1));
      }, function(err) {
        // alert('error');
      });
    };
  }]);
