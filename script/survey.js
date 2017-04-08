/**
 * Created by kiprasad on 23/10/16.
 */
var module = angular.module('surveyApp', ['ui.router','uiGmapgoogle-maps', 'configApp'])

 .config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi, googleMapAPIKey) {
        GoogleMapApi.configure({
       key: googleMapAPIKey,
            // v: '3.20',
            libraries: 'weather,geometry,visualization'
        });
    }]);


module.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state({
    name: 'survey1',
    url: '/survey',
    templateUrl: 'templates/survey.html',
    controller: 'surveyController'
  });

  $stateProvider.state({
    name: 'hitCode',
    url: '/hit',
    template: '<div>HIT Code: <h4>{{hitCode}}</h4></div>',
    controller: 'hitController',
    params: {
      hitCode: null
    }
  });

  $stateProvider.state({
      name: 'heatMap',
      url: '/heatmap',
      templateUrl: 'heatmap2.html',
      params: {
          workerId: '',
          project: ''
      },

      controller: function ($scope,$stateParams, $window, $http, heatMapProject1) {

          $scope.callSuccess = false;
          $scope.callSuccess1 = false;
          $scope.callSuccess2 = false;
          $scope.workerId = $stateParams.workerId;
          $scope.project = $stateParams.project;

          $scope.projectCodeForHeatMapHTML = heatMapProject1;

          if ($scope.project == heatMapProject1) {
              var opt = [{'name':'Green','color': '#9cdc1f','ncolor': 1},
                  {'name':'Blue','color': '#0072BC','ncolor': 5},
                  {'name':'Brown','color': '#f7941d','ncolor': 3}];
              $scope.callSuccess1 = true;
          } else {
              var opt = [{'name':'Yes','color': '#9cdc1f','ncolor': 1},
                  {'name':'No','color': '#F7941D','ncolor': 3},
                  {'name':'Maybe','color': '#FFF200','ncolor': 2}];
              $scope.callSuccess2 = true;
          }

          $scope.options = opt;


          $scope.exit = exit;
          function exit(){
              console.log('in exit');
              $window.location.href='/algalBloom.html';
          }

          $scope.icon_array =  ['/images/dots/cs_green_dot.svg',
              '/images/dots/cs_yellow_dot.svg',
              '/images/dots/cs_orange_dot.svg',
              '/images/dots/cs_red_dot.svg',
              '/images/dots/cs_blue_dot.svg',
              '/images/dots/cs_purple_dot.svg'];


          $scope.hex_array = ['#9cdc1f',
              '#FFF200',
              '#F7941D',
              '#ff0000',
              '#0072BC',
              '#8a2be2'
          ];


          var ans_colors =  {

              '1':'green',
              '2': 'yellow',
              '3': 'orange',
              '4' : 'red',
              '5': 'blue',
              '6' : 'purple',
              'all' : 'all'
          };
          var gradients = {
              red: [ 255,0,0],
              green: [ 0, 255,0],
              blue: [0,0,255],
              orange: [255,165,0],
              yellow: [255,255,0],
              purple: [138,43,226],
              all: [255,20,147]
          };

          //Function generate_gradient: gradient array based on rgb array
          //Different opacity
          function generate_gradient(color) {

              var g = [];
              var op = 0;
              //blue: 0,0,255 - 0,50,255 - 0,100,255 - 0,150,255 - 0,200,255

              for (i = 0; i < 6; i++) {
                  g.push('rgba(' + color[0] + ' , ' + color[1] + ', ' + color[2] + ', ' + op + ')');
                  op = op + 0.20;
              }
              return g;
          }

          //count unique items per key from object array
          function count_unique(arr, key){

              var flags = [], output = [], l = arr.length, i;
              for( i=0; i<l; i++) {

                  var itm = arr[i];
                  if( flags[itm[key]]) continue;
                  flags[itm[key]] = true;
                  output.push(itm[key]);
              }

              return output.length;
          }


          $scope.update_heatmap = function (answer,mapno) {

              var geodata =[];

              if (answer != 'all') {

                  //Filter data based on answer clicked
                  var answer_results = filterResponses(
                      //$scope.results1, {answer: "\"" + answer + "\""});
                      $scope.results1, {color: parseInt(answer)});

              } else {
                  var answer_results = $scope.results1;
              }
              // Transform the data for the heatmap:
              answer_results.forEach(function (item) {
                  geodata.push(new google.maps.LatLng(parseFloat(item.x), parseFloat(item.y)));
              });



              //set the data for the heatmap
              $scope.pointArr1 = new google.maps.MVCArray(geodata);
              $scope.htlayer1.setData($scope.pointArr1);
              //Change the gradient


              var gradient = generate_gradient(gradients[ans_colors[answer]]);
              $scope.htlayer1.set('gradient', gradient);



          };


          //Function for Heatmap
          function HeatLayer(heatLayer,rdata,pointArray,answer) {

              //Create lat lng from array of objects
              var geodata = [];

              //Filter data based on answer clicked
              var answer_results = filterResponses(
                  // rdata, {answer: "\"" + answer + "\""});
                  rdata, {color: parseInt(answer)});


              // Transform the data for the heatmap:
              answer_results.forEach(function (item) {
                  geodata.push(new google.maps.LatLng(parseFloat(item.x), parseFloat(item.y)));
              });


              //set the data for the heatmap
              pointArray = new google.maps.MVCArray(geodata);
              heatLayer.setData(pointArray);
              var gradient = generate_gradient(gradients[ans_colors[answer]]);
              heatLayer.set('gradient', gradient);
              heatLayer.set('opacity',1);
              heatLayer.set('radius',20);
          };


          //Function filterResponses: filter results based on some criteria
          function filterResponses(array, criteria) {
              return array.filter(function (obj) {
                  return Object.keys(criteria).every(function (c) {
                      return obj[c] == criteria[c];
                  });})
          };

          //Get the results of the first project:
          $http.get('/api/results/' + $scope.project).then(function(data){

              //Results from get
              $scope.results1 = data.data;
              //console.log($scope.results1);

              // Answer of first project
              $scope.q1 = $scope.results1[0].question;
              //Unquote
              $scope.question1 = $scope.q1.replace(/\"/g, "");

              //number of images:
              $scope.unique_images1 = count_unique($scope.results1, 'task_id');
              //Number of workers:
              $scope.unique_workers1 = count_unique($scope.results1, 'workerid');






              //Make the markers:
              $scope.workerResults = filterResponses(
                  $scope.results1, {workerid: $scope.workerId});

              // console.log($scope.workerResults);

              $scope.markerID = 0;
              $scope.workerResultsTransformed = [];
              $scope.workerResults .forEach(function (item) {

                  $scope.workerResultsTransformed.push({
                      latitude: parseFloat(item.x) ,
                      longitude: parseFloat(item.y) ,
                      title: item.answer,
                      id: $scope.markerID,
                      icon: $scope.icon_array[parseInt(item.color)-1]
                  });
                  $scope.markerID += 1;
              });

              // console.log($scope.workerResultsTransformed);

              //generate first map
              $scope.map1 = {
                  center: {
                      latitude: parseFloat($scope.results1[0].x),
                      longitude: parseFloat($scope.results1[0].y)
                  },
                  zoom: 7,
                  heatLayerCallback: function (layer) {
                      //set the heat layer from the data
                      $scope.pointArr1 = [];
                      $scope.htlayer1 = layer;
                      var htl1 = new HeatLayer($scope.htlayer1,$scope.results1,$scope.pointArr1,1);
                  },
                  showHeat: true
              };

              $scope.callSuccess = true;

          }).catch(function(error){


              console.log(error);
          });


      }
  });
  $urlRouterProvider.otherwise('/survey');
});

module.controller('appController', ['$scope', '$location', function($scope, $location) {
  $scope.params = $location.search();
  $scope.response = {};
  if (!$scope.params.code) {
    alert('missing project code');
    window.location.replace('/');
  }
}]);

module.controller('hitController', ['$scope', '$stateParams', function($scope, $stateParams) {
  $scope.hitCode = $stateParams.hitCode;
}]);

module.controller('surveyController', ['$scope', '$http', '$state', function($scope, $http, $state) {
  console.log($scope.params);
  $scope.userType = $scope.params.userType;

  $scope.submit = function() {
    var data = $scope.transformData($scope.response, $scope.userType);
    console.log(data);

    if (data != -1) {
      $http.post('/api/project/' + $scope.params.code + '/survey', JSON.stringify(data)).then(function(data) {
        console.log('data',data.data);
        //console.log(data.data.hitCode);
        if (data.data.hitCode) {
            $state.go('hitCode', {hitCode: data.data.hitCode});
        } else if (data.data.heatMap) {
            $state.go('heatMap', {project: $scope.params.code, workerId: data.data.workerId});
        }
      }, function(err) {
        alert('Something unexpected occurred');
      });
    }
  };

  $scope.transformData = function(response, userType) {
    console.log(response, userType);

    if(userType == 'kiosk'){


        return {
            'enjoy_task': response['enjoy_task'] || '',
            'enjoy_task_text': response['enjoy_task_text'] || '',
            'priorexp': response['priorexp'] || '',
            'priorexp_text': response['priorexp_text'] || '',
            'contribute': response['contribute'] || '',
            'contribute_text': response['contribute_text'] || '',
            'local_diff': response['local_diff'] || 0,
            'additional_feedback': response['additional_text'] || ''
        };

    } else {


        var whyMoreOptions = [];
        if (response.whymore1) {
            whyMoreOptions.push('instructions');
        }
        if (response.whymore2) {
            whyMoreOptions.push('paid');
        }
        if (response.whymore3) {
            whyMoreOptions.push('reject');
        }

        return {
            'why_text': response['why_text'] || '',
            'why_more': whyMoreOptions.join('|'),
            'tech_diff': response['tech_diff'] || 0,
            'tech_diff_text': response['tech_diff_text'] || '',
            'additional_feedback': response['additional_text'] || ''
        };

    }

    var whyMoreOptions = [];
    if (response.whymore1) {
      whyMoreOptions.push('instructions');
    }
    if (response.whymore2) {
      whyMoreOptions.push('paid');
    }
    if (response.whymore3) {
      whyMoreOptions.push('reject');
    }

    return {
      'why_text': response['why_text'] || '',
      'why_more': whyMoreOptions.join('|'),
      'tech_diff': response['tech_diff'] || 0,
      'tech_diff_text': response['tech_diff_text'] || '',
      'additional_feedback': response['additional_text'] || ''
    };
  };
}]);
