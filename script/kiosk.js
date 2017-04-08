var module = angular.module('consentApp', ['ui.router', 'ngAnimate', 'ngRoute', 'uiGmapgoogle-maps','ngCookies', 'configApp'])
    .config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi, googleMapAPIKey) {
        GoogleMapApi.configure({
            key: googleMapAPIKey,
            libraries: 'weather,geometry,visualization'
        });
    }]);

module.config(function($stateProvider, $urlRouterProvider, $cookiesProvider) {
    var n = new Date();
    $cookiesProvider.defaults.expires = new Date(n.getFullYear()+10, n.getMonth(), n.getDate());

    $stateProvider.state({
        name: 'consent',
        url: '/consent',
        templateUrl: 'templates/kiosk/consent.html',
        controller: 'consentController'
    });
    $stateProvider.state({
        name: 'instruction',
        url: '/instruction',
        templateUrl: 'templates/kiosk/instructions.html',
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
        views: {
            content: {
                templateUrl: 'templates/kiosk/example.html',
            }
        },
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
        name: 'about',
        url: '/about',
        views: {
            nav: {
                templateUrl: '../navbar.html'
            },
            content: {
                templateUrl: '../about.html',
            },
            footer: {
                templateUrl: '../footer.html'
            },
        },
        controller: 'AboutController'
    });

    $stateProvider.state({
        name: 'termsOfUse',
        url: '/termsOfUse',
        views: {
            nav: {
                templateUrl: '../navbar.html'
            },
            content: {
                templateUrl: '../termsOfUse.html',
            },
            footer: {
                templateUrl: '../footer.html'
            },
        },
        controller: 'TermsController'
    });

    $stateProvider.state({
        name: 'mturk',
        url: '/mturk/:pCode',
        templateUrl: 'templates/kiosk/welcome.html',
        controller: 'mTurkController'
    });
    $stateProvider.state({
        name: 'kiosk',
        url: '/',
        views: {
            nav: {
                templateUrl: './navbar.html'
            },
            content: {
                templateUrl: 'templates/kiosk/appDefault.html',
            },
            footer: {
                templateUrl: '../footer.html'
            }
        },
        //templateUrl: 'templates/kiosk/appDefault.html',
        controller: 'kioskController'
    });

    $stateProvider.state({
        name: 'results',
        url: '/results',
        views: {
            nav: {
                templateUrl: './navbar.html'
            },
            content: {
                templateUrl: 'heatmap.html'
            },
            footer: {
                templateUrl: '../footer.html'
            }
        },
        controller: 'heatMapController'
    });

    $urlRouterProvider.otherwise('/');
});

module.controller('heatMapController', function($scope, $http, $window, heatMapProject1, heatMapProject2){

    $scope.successProject1 = false;
    $scope.successProject2 = false;
    $window.document.title ="Results"

    //gradients: initial colors
    var gradients = {
        red: [ 255,0,0],
        green: [ 0, 255,0],
        blue: [0,0,255],
        orange: [255,165,0],
        yellow: [255,255,0],
        purple: [138,43,226],
        all: [255,20,147]

    };

    var ans_colors =  {

        '1':'green',
        '2': 'yellow',
        '3': 'orange',
        '4' : 'red',
        '5': 'blue',
        '6' : 'purple',
        'all': 'all'
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


    // Exit button to front page:
    $scope.exit = exit;
    function exit(){
        console.log('in exit');
        $window.location.href='/algalBloom.html';
    }


    //Function for Heatmap
    function HeatLayer(heatLayer,rdata,pointArray,answer) {


        //Create lat lng from array of objects
        var geodata = [];


        //Filter the data
        //Initial project 1: Only Green votes
        //Initial project 2: Only Yes votes
        //Initial colors: Green


        //Filter data based on answer clicked
        var answer_results = filterResponses(
            // rdata, {answer: "\"" + answer + "\""});
            rdata, {color: parseInt(answer)});


        // Transform the data for the heatmap:
        answer_results.forEach(function (item) {
            geodata.push(new google.maps.LatLng(parseFloat(item.x), parseFloat(item.y)));
        });




        // Transform the data for the heatmap:
        answer_results.forEach(function (item) {
            geodata.push(new google.maps.LatLng(parseFloat(item.x), parseFloat(item.y)));
        });
        //set the data for the heatmap
        pointArray = new google.maps.MVCArray(geodata);
        heatLayer.setData(pointArray);
        //Set the gradient:
        var gradient = generate_gradient(gradients[ans_colors[answer]]);
        heatLayer.set('gradient', gradient);
        heatLayer.set('opacity',1);
        heatLayer.set('radius',20);


    };



    //First project code:
    $scope.projectCode1 = heatMapProject1;

    //Second project code;
    $scope.projectCode2 = heatMapProject2;


    $scope.update_heatmap = function (answer,mapno){

        var geodata = [];

        //Mapping of answers to colors:

        if (mapno =='map1') {


            if (answer != 'all') {

                //Filter data based on answer clicked
                var answer_results = filterResponses(
                    //$scope.results1, {answer: "\"" + answer + "\""});
                    $scope.results1, {color: parseInt(answer)});

            } else {
                var answer_results = $scope.results1;
            }

            //console.log(answer_results.length);

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




        } else {


            if (answer != 'all') {

                //Filter data based on answer clicked
                var answer_results = filterResponses(
                    //$scope.results2, {answer: "\"" + answer + "\""});
                    $scope.results2, {color: parseInt(answer)});

            } else {
                var answer_results = $scope.results2;
            }

            // Transform the data for the heatmap:
            answer_results.forEach(function (item) {
                geodata.push(new google.maps.LatLng(parseFloat(item.x), parseFloat(item.y)));
            });


            //console.log(answer_results.length);

            //set the data for the heatmap
            $scope.pointArr2 = new google.maps.MVCArray(geodata);
            $scope.htlayer2.setData($scope.pointArr2);

            //Change the gradient:

            //Get the gradients based on the color
            var gradient = generate_gradient(gradients[ans_colors[answer]]);
            // //Set the gradient
            $scope.htlayer2.set('gradient', gradient);



        }

    };

    //Function filterResponses: filter results based on some criteria
    function filterResponses(array, criteria) {
        return array.filter(function (obj) {
            return Object.keys(criteria).every(function (c) {
                return obj[c] == criteria[c];
            });})
    };


    //Get the results of the first project:
    $http.get('/api/results/' + $scope.projectCode1).then(function(data){

        // console.log("Results from first project", data.data);
        $scope.results1 = data.data;
        //console.log($scope.results1);

        //number of images:
        $scope.unique_images1 = count_unique($scope.results1, 'task_id');
        //Number of workers:
        $scope.unique_workers1 = count_unique($scope.results1, 'workerid');


        // Answer of first project
        $scope.q1 = $scope.results1[0].question;
        //Unquote
        $scope.question1 = $scope.q1.replace(/\"/g, "");
        //Buttons for the heatmap
        $scope.options1 = [{'name':'Green','color': '#9cdc1f','ncolor': 1},
            {'name':'Blue','color': '#0072BC','ncolor': 5},
            {'name':'Brown','color': '#f7941d','ncolor': 3}];


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
        $scope.successProject1 = true;
        //generate second heatmap
        $http.get('/api/results/' + $scope.projectCode2).then(function(data){

            //console.log("Results from second project", data.data);
            $scope.results2 = data.data;
            //console.log($scope.results2);

            //number of images:
            $scope.unique_images2 = count_unique($scope.results2, 'task_id');
            //Number of workers:
            $scope.unique_workers2 = count_unique($scope.results2, 'workerid');


            //Second Question
            $scope.q2 = $scope.results2[0].question;
            // Unquote question
            $scope.question2 = $scope.q2.replace(/\"/g, "");

            //Buttons for project 2:
            $scope.options2 = [{'name':'Yes','color': '#9cdc1f','ncolor': 1},
                {'name':'No','color': '#F7941D','ncolor': 3},
                {'name':'Maybe','color': '#FFF200','ncolor': 2}];

            //generate first map
            $scope.map2 = {
                center: {
                    latitude: parseFloat($scope.results2[0].x),
                    longitude: parseFloat($scope.results2[0].y)
                },
                zoom: 7,
                heatLayerCallback: function (layer) {
                    //set the heat layer from the data
                    $scope.pointArr2 = [];
                    $scope.htlayer2 = layer;
                    var htl2= new HeatLayer($scope.htlayer2,$scope.results2,$scope.pointArr2,1);
                },
                showHeat: true
            };

            $scope.successProject2 = true;
        }).catch(function(error){
            //Error with second http get
            console.log(error);
        });


    }).catch(function(error){

        //Error with first http get
        console.log(error);
    });
});

module.controller('appController', ['$scope', '$location', function($scope, $location) {
    $scope.params = $location.search();

}]);

module.controller('AboutController', ['$scope', '$window', function($scope, $window) {
    $window.document.title ="About Cartoscope"

}]);

module.controller('TermsController', ['$scope', '$window', function($scope, $window) {
    $window.document.title ="Terms Of Use"

}]);

module.controller(
  'exampleController', [
    '$window', '$scope', '$state', '$stateParams', 'heatMapProject2', 'heatMapProject1',
    function($window, $scope, $state, $stateParams, heatMapProject2, heatMapProject1) {
    $window.document.title = "Examples";
    //console.log('In Example Controller');
    //console.log('Scope', $scope);
    $scope.params.project= $stateParams.pCode;
    $scope.params.workerId= $stateParams.workerId;
    $scope.params.kioskId= $stateParams.kioskId;
    //console.log('$scope.params.project ', $scope.params.project);
    $scope.goTo=5;
    //console.log('params', $scope.params)

    if ($scope.params.project == heatMapProject2) {
        $scope.counter = 0;
        $scope.question = "Do you see evidence of an algal bloom?"
        $scope.goTo=2;
    }
    if ($scope.params.project == heatMapProject1) {
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
            color: '#FFEB3B',
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


            $scope.params = $location.search();

            //check for cookie and set it if it doesnt exist
            if(!$cookies.get('kiosk')){
                $cookies.put('kiosk', lil.uuid());
            }

            //getProjects Code dynamically
            $http.get('/api/anon/startKiosk/').then(function(e, data) {
                //console.log('e', e, data);
                $scope.params.project = e.data.projectID;
                $scope.workerId = e.data.workerID;

                $http.get('/api/anon/consentKiosk/' + $scope.params.project + '?' + 'workerId='+ $scope.workerId+'&cookie='+$cookies.get('kiosk')).then(function(e, data) {
                    //console.log('data ', e.data.workerId);
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

module.controller('navController', ['$scope','$window','$location', function($scope,$window, $location) {

     $scope.setPage = setPage;

    function setPage(location){
        return location === $location.path();
    }
}]);


module.controller('instructionController', ['$window','$scope', '$state','$stateParams','$location', function($window, $scope, $state, $stateParams) {
    //console.log('locations  ', $state);
    $window.document.title = "Instructions";
    if($stateParams.kioskId){
        $scope.params.project= $stateParams.pCode;
        $scope.params.workerId= $stateParams.workerId;
        $scope.params.kioskId =  $stateParams.kioskId;
    }

    $scope.showExamples = function() {


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


            $http.get('/api/anon/consent/' + $scope.params.project + '?' + qs.substr(1)).then(function(e, data) {
                $state.go('instruction', {workerId: $scope.params.workerId,
                    assignmentId: $scope.params.assignmentId, hitId:$scope.params.hitId, submitTo: $scope.params.submitTo});
            }, function(err) {
            });
        };
    }]);
