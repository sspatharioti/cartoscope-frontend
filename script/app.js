/**
 * Created by kiprasad on 12/09/16.
 */
var module = angular.module('app', ['ui.router', 'angucomplete-alt', 'ngAnimate']);

module.run(['$state', '$rootScope', function($state, $rootScope) {

  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    event.preventDefault();
    if (toState.name.indexOf('root.projectEdit') != -1) {
      $state.go('root.projects');
    } else if (!fromState.views) {
      $state.go('root.home');
    }
  });
}]);

module.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  $httpProvider.interceptors.push('busyIndicator');

    $stateProvider.state({
        name: 'login',
        url: '/login',
        templateUrl: 'logon.html',
        controller: 'loginController'
    });

    $stateProvider.state({
        name: 'cmnh',
        url: '/museum',
        controller: function($scope, $window) {
            $window.location.href = '/algalBloom.html';
        }
    });


  $stateProvider.state({
    name: 'noLoggedIn',
    url: '/test',
    templateUrl: 'index.html',
    controller: function($scope, $state) {
      $state.go('cmnh');
       // $window.location.href ='/museum.html';
    }
  });

  $stateProvider.state({
    name: 'root',
    abstract: true,
    resolve: {
      userData: ['$http', function($http) {
        return $http.get('/api/user').then(function(data) {
          return data.data[0];
        }).catch(function() {
          return undefined;
        });
      }]
    },
    onEnter: function(userData, $state) {
      if (!userData) {
        $state.go('noLoggedIn');
      }
    },
    templateUrl: 'templates/userProfile/pageTemplate.html',
    controller: 'appController'
  });

  $stateProvider.state({
    name: 'root.home',
    url: '/home',
    templateUrl: 'templates/userProfile/appDefault.html',
    controller: 'defaultController'
  });

  $stateProvider.state({
    name: 'root.userProfile',
    url: '/profile',
    templateUrl: 'templates/userProfile/userProfileTemplate.html',
    controller: 'userProfileController'
  });

  $stateProvider.state({
    name: 'root.projects',
    url: '/projects',
    templateUrl: 'templates/project/projectsPageTemplate.html',
    controller: 'projectsPageController',
    resolve: {
      projects: ['$http', function($http) {
        return $http.get('/api/user/projects').then(function(data) {
          return data.data;
        }).catch(function(error) {
          return undefined;
        });
      }]
    }
  });

  $stateProvider.state({
    name: 'root.project',
    url: '/project/view/:id',
    templateUrl: 'templates/project/projectPageTemplate.html',
    controller: 'projectPageController',
    resolve: {
      projectData: ['$http', '$stateParams', function($http, $stateParams) {
        return $http.get('/api/tasks/getInfoId/' + $stateParams.id).then(function(data) {
          return data.data;
        }).catch(function(error) {
          return undefined;
        });
      }]
    },
    onEnter: ['$state', 'projectData', '$timeout', function($state, projectData, $timeout) {
      $timeout(function() {
        if (!projectData) {
          $state.go('root.home');
        }
      }, 0);
    }]
  });

  $stateProvider.state({
    name: 'root.projectEdit',
    url: '/project/edit/:id',
    templateUrl: 'templates/userProfile/projectEditTemplate.html',
    params: {
      project: null
    },
    controller: 'projectEditController',
    abstract: true,
    resolve: {
      project: ['$stateParams', '$q', '$http', function($stateParams, $q, $http) {

        return $q(function(resolve, reject) {
          if ($stateParams.project && $stateParams.project.id) {
            resolve($stateParams.project);
          } else {
            $http.get('/api/tasks/getInfoId/' + $stateParams.id).then(function(data) {
              resolve(data.data);
            }).catch(function(error) {
              reject('server error');
            });
          }
        });
      }]
    }
  });

  $stateProvider.state({
    name: 'root.projectEdit.step1',
    url: '/step1',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step1.html',
        controller: ['$scope', 'project', function($scope, project) {
          $scope.$on('validate', function(e) {
            $scope.validate();
          });

          $scope.validate = function() {
            $scope.$emit('moveNext');
          };
        }]
      }
    }
  });

  $stateProvider.state({
    name: 'root.projectEdit.step2',
    url: '/step2',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step2.html',
        controller: 'stepTwoController'
      }
    }
  });

  $stateProvider.state({
    name: 'root.projectEdit.step3',
    url: '/step3',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step3.html',
        controller: 'stepThreeController'
      }
    },
    resolve: {
      'admins': function($http, project) {
        return $http.get('/api/project/admins/' + project.id).then(function(data) {
          return data.data;
        }).catch(function(err) {
          return [];
        });
      }
    }
  });

  $stateProvider.state({
    name: 'root.projectEdit.step4',
    url: '/step4',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step4.html',
        controller: 'stepFourController'
      }
    }
  });

  $stateProvider.state({
    name: 'root.projectEdit.step5',
    url: '/step5',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step5.html',
        controller: 'stepFiveController'
      }
    }
  });

  $stateProvider.state({
    name: 'root.projectEdit.step6',
    url: '/step6',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step6.html',
        controller: 'stepSixController'
      }
    }
  });

  $stateProvider.state({
    name: 'root.projectCreation',
    url: '/project/new',
    templateUrl: 'templates/userProfile/newProjectTemplate.html',
    controller: 'projectCreationController',
    abstract: true
  });

  $stateProvider.state({
    name: 'root.projectCreation.step1',
    url: '/step1',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step1.html',
        controller: 'stepOneController'
      }
    }
  });

  $stateProvider.state({
    name: 'root.projectCreation.step2',
    url: '/step2',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step2.html',
        controller: 'stepTwoController'
      }
    },
    params: {
      project: null
    },
    resolve: {
      project: ['$stateParams', '$timeout', '$q', function($stateParams, $timeout, $q) {
        return $q(function(resolve, reject) {
          $timeout(function() {
            if ($stateParams.project && $stateParams.project.id) {
              resolve($stateParams.project);
            } else {
              reject('no id');
            }
          }, 50);
        });
      }]
    }
  });

  $stateProvider.state({
    name: 'root.projectCreation.step3',
    url: '/step3',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step3.html',
        controller: 'stepThreeController'
      }
    },
    params: {
      project: null
    },
    resolve: {
      project: ['$stateParams', '$timeout', '$q', function($stateParams, $timeout, $q) {
        return $q(function(resolve, reject) {
          $timeout(function() {
            if ($stateParams.project && $stateParams.project.id) {
              resolve($stateParams.project);
            } else {
              reject('no id');
            }
          }, 50);
        });
      }],
      admins: function() {
        return [];
      }
    }
  });

  $stateProvider.state({
    name: 'root.projectCreation.step4',
    url: '/step4',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step4.html',
        controller: 'stepFourController'
      }
    },
    params: {
      project: null
    },
    resolve: {
      project: ['$stateParams', '$timeout', '$q', function($stateParams, $timeout, $q) {
        return $q(function(resolve, reject) {
          $timeout(function() {
            if ($stateParams.project && $stateParams.project.id) {
              resolve($stateParams.project);
            } else {
              reject('no id');
            }
          }, 50);
        });
      }]
    }
  });

  $stateProvider.state({
    name: 'root.projectCreation.step5',
    url: '/step5',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step5.html',
        controller: 'stepFiveController'
      }
    },
    params: {
      project: null
    },
    resolve: {
      project: ['$stateParams', '$timeout', '$q', function($stateParams, $timeout, $q) {
        return $q(function(resolve, reject) {
          $timeout(function() {
            if ($stateParams.project && $stateParams.project.id) {
              resolve($stateParams.project);
            } else {
              reject('no id');
            }
          }, 50);
        });
      }]
    }
  });

  $stateProvider.state({
    name: 'root.projectCreation.step6',
    url: '/step6',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step6.html',
        controller: 'stepSixController'
      }
    },
    params: {
      project: null
    },
    resolve: {
      project: ['$stateParams', '$timeout', '$q', function($stateParams, $timeout, $q) {
        return $q(function(resolve, reject) {
          $timeout(function() {
            if ($stateParams.project && $stateParams.project.id) {
              resolve($stateParams.project);
            } else {
              reject('no id');
            }
          }, 50);
        });
      }]
    }
  });

  $urlRouterProvider.otherwise('/home');
});

module.controller('appController', ['$scope', '$http', 'userData', function($scope, $http, userData) {

  $scope.user = userData;
  $scope.user.profilePic = '/api/user/getProfilePic/' + $scope.user['profile_photo'];

  $scope.logout = function() {
    $http.get('/api/logout').then(function() {
      //window.location = '/';
        window.location.href='/login';
    }, function() {
      alert('Couldn\'t sign you out');
    });
  };
}]);

module.controller('projectEditController', ['$scope', '$http', '$state', 'swalService', 'project',
  function($scope, $http, $state, swalService, project) {
    $scope.project = project;

    if (!$scope.project.editing) {
      $scope.project.editing = true;
      $scope.project.task = JSON.parse($scope.project.template);
      $scope.project.privacy = $scope.project['access_type'];
      delete $scope.project.template;
      delete $scope.project['access_type'];
    }

    $scope.goTo = function(to) {
      if ($scope.project.id) {
        $state.go(to);
      }
    };

    $scope.isActive = function(stateName) {
      return $state.current && $state.current.name == stateName;
    };

    $scope.getNextText = function() {
      return 'Save';
    };

    $scope.goNext = function() {
      if ($state.current && $state.current.name == 'root.projectCreation.step6') {
        $scope.openPublishPopup();
      } else {
        $scope.$broadcast('validate');
      }
    };

    $scope.$on('moveNext', function(e, d) {
      var curr = $state.current.name;
      var stateMap = {
        'root.projectEdit.step1': '^.step2',
        'root.projectEdit.step2': '^.step3',
        'root.projectEdit.step3': '^.step4',
        'root.projectEdit.step4': '^.step5',
        'root.projectEdit.step5': '^.step6',
        'root.projectEdit.step6': '^.step7'
      };
      try {
        $state.go(stateMap[curr], {project: $scope.project});
      }
      catch (e) {

      }
    });
    $scope.verifyCanPublish = function() {
      return $scope.project.id && $scope.project.templateSaved && $scope.project.dataSetID;
    };

    $scope.verifyCanImportData = function() {
      return $scope.project.id && $scope.project.templateSaved;
    };

    $scope.openPublishPopup = function() {
      if ($scope.verifyCanPublish()) {
        $('#publishPopup').modal('show');
      } else {
        swalService.showErrorMsg('Please make sure you\'ve filled up the required details and created the ' +
          'task template before you try to publish.');
      }
    };

    $scope.publish = function() {
      if ($scope.project.id) {
        $http.post('/api/project/publish', {projectID: $scope.project.id}).then(function(data) {
          $scope.showPublish = false;
          $scope.project.published = true;
          $('#publishPopup').modal('hide');
        }, function(response) {
          var msg = response.data.error || 'Couldn\'t publish your project, please try again';
          swalService.showErrorMsg(msg);
          $('#publishPopup').modal('hide');
        });
      }
    };

  }]);

module.controller('projectCreationController', ['$scope', '$http', '$state', 'swalService',
  function($scope, $http, $state, swalService) {
    $scope.goTo = function(to) {
      if ($scope.project.id) {
        $state.go(to);
      }
    };

    $scope.isActive = function(stateName) {
      return $state.current && $state.current.name == stateName;
    };

    $scope.getNextText = function() {
      if ($state.current && $state.current.name == 'root.projectCreation.step6') {
        return 'Publish';
      } else {
        return 'Next';
      }
    };

    $scope.goNext = function() {
      if ($state.current && $state.current.name == 'root.projectCreation.step6') {
        $scope.openPublishPopup();
      } else {
        $scope.$broadcast('validate');
      }
    };

    $scope.project = {};
    $scope.project.editing = false;
    $scope.project.task = {
      options: []
    };

    $scope.project.privacy = 0;
    $scope.showPublish = true;
    $scope.$on('moveNext', function(e, d) {
      var curr = $state.current.name;
      var stateMap = {
        'root.projectCreation.step1': '^.step2',
        'root.projectCreation.step2': 'root.projectCreation.step3',
        'root.projectCreation.step3': 'root.projectCreation.step4',
        'root.projectCreation.step4': 'root.projectCreation.step5',
        'root.projectCreation.step5': 'root.projectCreation.step6',
        'root.projectCreation.step6': 'root.projectCreation.step7'
      };
      try {
        $state.go(stateMap[curr], {project: $scope.project});
      }
      catch (e) {

      }
    });
    $scope.verifyCanPublish = function() {
      return $scope.project.id && $scope.project.templateSaved && $scope.project.dataSetID;
    };

    $scope.verifyCanImportData = function() {
      return $scope.project.id && $scope.project.templateSaved;
    };

    $scope.openPublishPopup = function() {
      if ($scope.verifyCanPublish()) {
        $('#publishPopup').modal('show');
      } else {
        swalService.showErrorMsg('Please make sure you\'ve filled up the required details and created the ' +
          'task template before you try to publish.');
      }
    };

    $scope.publish = function() {
      if ($scope.project.id) {
        $http.post('/api/project/publish', {projectID: $scope.project.id}).then(function(data) {
          $scope.showPublish = false;
          $('#publishPopup').modal('hide');
        }, function(response) {
          var msg = response.data.error || 'Couldn\'t publish your project, please try again';
          swalService.showErrorMsg(msg);
          $('#publishPopup').modal('hide');
        });
      }
    };

  }]);

module.controller('stepOneController', ['$scope', '$state', '$http', 'swalService',
  function($scope, $state, $http, swalService) {

    $scope.$on('validate', function(e) {
      $scope.validate();
    });

    $scope.validate = function() {
      if (!$scope.project.name || !$scope.project.description) {
        $scope.showErr = true;
        swalService.showErrorMsg('Please enter a name and description for the project.');
      } else {
        $scope.createProject();
      }
    };

    $scope.createProject = function() {
      if ($scope.project.id) {
        $scope.$emit('moveNext');
      } else {
        var fd = new FormData();
        if ($scope.coverPic) {
          fd.append('photo', $scope.coverPic);
        }
        fd.append('name', $scope.project.name);
        fd.append('description', $scope.project.description);
        $http.post('api/project/add', fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
        }).then(function(response) {
          var data = response.data;
          $scope.project.id = data.id;
          $scope.project['unique_code'] = data.code;
          $scope.$emit('moveNext');
        }, function(response) {
          var msg = response.data.error || 'Couldn\'t create the project';
          swalService.showErrorMsg(msg);
        });
      }
    };

    var handleImage = function(f) {
      var canvas = document.getElementById('imageCanvas');
      var ctx = canvas.getContext('2d');
      var reader = new FileReader();
      reader.onload = function(event) {
        var img = new Image();
        img.onload = function() {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(f);
    };

    $scope.$watch('coverPic', function() {
      if ($scope.coverPic) {
        handleImage($scope.coverPic);
      }
    });

  }]);

module.controller('stepTwoController', ['$scope', '$state', '$stateParams', '$http', 'swalService',
  function($scope, $state, $stateParams, $http, swalService) {
    $scope.$on('validate', function() {
      $scope.validate();
    });

    $scope.validate = function() {
      if (!$scope.project.task.question || $scope.project.task.options.length <= 1) {
        swalService.showErrorMsg('Please make sure you have a question and two options for the task');
        return;
      }
      var data = {
        template: JSON.stringify($scope.project.task),
        projectID: $scope.project.id
      };
      $http.post('/api/project/updateTemplate', data).then(function(data) {
        $scope.project.templateSaved = true;
        $scope.$emit('moveNext');
      }, function(response) {
        var msg = response.data.error || 'couldn\'t save the template at this time';
        swalService.showErrorMsg(msg);
      })
      ;
    };

    $scope.addOption = function() {
      if ($scope.project.task.options.length < 10) {
        $scope.project.task.options.push({color: 1});
      }
    };

    $scope.removeOption = function(index) {
      $scope.project.task.options.splice(index, 1);
    };

  }
]);

module.controller('stepThreeController', ['$scope', '$templateCache', '$http', 'swalService', 'admins',
  function($scope, $templateCache, $http, swalService, admins) {
    $scope.project.admins = admins || [];
    var TEMPLATE_URL = 't1.html';

    // Set the default template for this directive
    $templateCache.put(TEMPLATE_URL,
      '<div class="angucomplete-holder" ng-class="{\'angucomplete-dropdown-visible\': showDropdown}">' +
      '  <input id="{{id}}_value" class="invite" name="{{inputName}}" tabindex="{{fieldTabindex}}" ' +
      'ng-class="{\'angucomplete-input-not-empty\': notEmpty}" ng-model="searchStr" ng-disabled="disableInput" ' +
      'type="{{inputType}}" placeholder="{{placeholder}}" maxlength="{{maxlength}}" ng-focus="onFocusHandler()" ' +
      'class="{{inputClass}}" ng-focus="resetHideResults()" ng-blur="hideResults($event)" autocapitalize="off" ' +
      'autocorrect="off" autocomplete="off" ng-change="inputChangeHandler(searchStr)"/>' +
      '  <div id="{{id}}_dropdown" class="angucomplete-dropdown" ng-show="showDropdown">' +
      '    <div class="angucomplete-searching" ng-show="searching" ng-bind="textSearching"></div>' +
      '    <div class="angucomplete-searching" ng-show="!searching && (!results || results.length == 0)" ' +
      'ng-bind="textNoResults"></div>' +
      '    <div class="angucomplete-row" ng-repeat="result in results" ng-click="selectResult(result)" ' +
      'ng-mouseenter="hoverRow($index)" ng-class="{\'angucomplete-selected-row\': $index == currentIndex}">' +
      '      <div class="angucomplete-title" ng-if="matchClass" ng-bind-html="result.title"></div>' +
      '      <div class="angucomplete-title" ng-if="!matchClass">{{ result.title }}</div>' +
      '      <div ng-if="matchClass && result.description && result.description != \'\'" ' +
      'class="angucomplete-description" ng-bind-html="result.description"></div>' +
      '      <div ng-if="!matchClass && result.description && result.description != \'\'" ' +
      'class="angucomplete-description">{{result.description}}</div>' +
      '    </div>' +
      '  </div>' +
      '</div>'
    );

    $scope.deleteAdmin = function(index) {
      var admin = $scope.project.admins[index];
      $http.post('/api/project/admin/delete',
        {
          userID: admin.id,
          projectID: $scope.project.id
        }).then(function(data) {
        $scope.project.admins.splice(index, 1);
      }).catch(function(err) {
        swalService.showErrorMsg('Couldn\'t Delete the admin, please try again');
      });
    };

    $scope.invite = function() {
      var userID = $scope.project.invite.selectedUser.originalObject.id;
      $http.post('/api/project/admin/add',
        {
          userID: userID,
          projectID: $scope.project.id
        }).then(function() {
        $scope.project.admins.push($scope.project.invite.selectedUser.originalObject);
      }).catch(function() {
        swalService.showErrorMsg('Couldn\'t add this admin, please try again');
      });
    };

    $scope.$on('validate', function(e) {
      $scope.validate();
    });

    $scope.validate = function() {
      $scope.$emit('moveNext');
    };

  }]);

module.controller('stepFourController', ['$scope', '$state', '$http', 'swalService',
  function($scope, $state, $http, swalService) {

    $scope.sendDataSet = function() {
      if ($scope.project.dataSetLink) {
        $http.post('/api/test/upload', {
          'file': $scope.project.dataSetLink,
          'projectID': $scope.project.id,
          'regex': $scope.project.regex || ''
        }).then(function(data) {
          if (data.data.uniqueCode) {
            $scope.project.dataSetID = data.data.uniqueCode;
          }
        }, function(err) {
          alert('Something wrong with the uploaded data set');
        });
      } else {
        swalService.showErrorMsg('Please enter a data set url');
      }
    };

    $scope.$on('validate', function(e) {
      $scope.validate();
    });

    $scope.validate = function() {
      $scope.$emit('moveNext');
    };

    $scope.getProgressUrl = function() {
      return '/status.html#/?id=' + $scope.project.dataSetID;
    };
  }]);

module.controller('stepFiveController', ['$scope', '$state', '$http', function($scope, $state, $http) {
  $scope.$on('validate', function(e) {
    $scope.validate();
  });

  $scope.startTaskPath = window.location.protocol + '//' + window.location.host + '/api/tasks/startProject/';

  $scope.getPathToStart = function() {
    return $scope.startTaskPath + '' + $scope.project['unique_code'];
  };

  $scope.validate = function() {
    $http.post('/api/project/changePrivacy', {
      'projectID': $scope.project.id,
      'privacy': $scope.project.privacy
    }).then(function() {
      $scope.$emit('moveNext');
    }, function() {
      alert('couldn\'t update privacy at this time');
    });
  };
}]);

module.controller('stepSixController', ['$scope', '$state', '$http', function($scope, $state, $http) {

  $scope.$on('validate', function(e) {
    $scope.validate();
  });

  $scope.validate = function() {
    $scope.$emit('moveNext');
  };
}]);

module.controller('defaultController', ['$scope', 'userData', function($scope, userData) {
}]);

module.controller('projectPageController', ['$scope', 'userData', 'projectData',
  function($scope, userData, projectData) {

  }]);

module.controller('projectsPageController', ['$scope', 'userData', 'projects', '$timeout', '$http', 'swalService',
  '$state', function($scope, userData, projects, $timeout, $http, swalService, $state) {

    $scope.projects = projects;

    $scope.toggleArchive = function(project) {
      if (project.archived) {
        $scope.unArchiveProject(project);
      } else {
        $scope.archiveProject(project);
      }
    };

    $scope.archiveProject = function(project) {
      $http.get('/api/project/' + project.id + '/archive').then(function() {
        project.archived = 1;
      }).catch(function(error) {
        swalService.showErrorMsg(error.code || 'Couldn\'t archive the project, please try again.');
      });
    };

    $scope.unArchiveProject = function(project) {
      $http.get('/api/project/' + project.id + '/unarchive').then(function() {
        project.archived = 0;
      }).catch(function(error) {
        swalService.showErrorMsg(error.code || 'Couldn\'t archive the project, please try again.');
      });
    };

    var startTaskPath = window.location.protocol + '//' + window.location.host + '/api/tasks/startProject/';

    var getPathToStart = function(code) {
      return startTaskPath + code;
    };

    var showLinkModal = $('#show-link-modal');
    $scope.showLink = function(project) {
      if (project.published) {
        $scope.link = getPathToStart(project['unique_code']);
        showLinkModal.modal('show');
      }
    };

    $scope.copyToClip = function() {
      $('#link-text-inp').select();
      try {
        document.execCommand('copy');
        $scope.showCopiedMsg = true;
        $timeout(function() {
          $scope.showCopiedMsg = false;
          showLinkModal.modal('hide');
        }, 2000);
      } catch (err) {
        alert('Your browser doesn\'t support this feature yet. Please press ctrl+c to copy');
      }
    };

    $scope.goToEdit = function(project) {
      $state.go('root.projectEdit.step1', {project: project, id: project.id});
    };
  }]);

module.controller('userProfileController', ['$scope', function($scope) {

  $scope.editProfile = function() {
    // $('#modalPopup').modal('show');
  };
}]);

module.directive('fileModel', ['$parse', '$timeout', function($parse, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var setter = model.assign;

      element.bind('change', function() {
        $timeout(function() {
          setter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);

module.factory('busyIndicator', ['$q', '$rootScope', function($q, $rootScope) {
  var numLoadings = 0;
  return {
    request: function(config) {
      numLoadings++;
      $rootScope.$broadcast('loader_show');
      return config || $q.when(config);
    }, response: function(response) {
      if ((--numLoadings) === 0) {
        $rootScope.$broadcast('loader_hide');
      }
      return response || $q.when(response);
    }, responseError: function(response) {
      if (!(--numLoadings)) {
        $rootScope.$broadcast('loader_hide');
      }
      return $q.reject(response);
    }
  };
}]);

module.directive('loader', function() {
  return function($scope, element) {
    $scope.$on('loader_show', function() {
      element.addClass('loader').removeClass('hidden');
    });
    return $scope.$on('loader_hide', function() {
      element.removeClass('loader').addClass('hidden');
    });
  };
});

module.directive('csTooltip', function($rootScope) {
  return function($scope, element, attrs) {
    $(element).tooltip();
  };
});

module.factory('swalService', function() {
  var service = {};

  service.showErrorMsg = function(errorMsg) {
    swal({
      title: 'Error!',
      confirmButtonColor: '#9cdc1f',
      allowOutsideClick: true,
      text: errorMsg,
      type: 'error',
      confirmButtonText: 'Back'
    });
  };
  return service;
});


// login module

module.controller('loginController', [
  '$scope', '$http', '$location', function($scope, $http, $location) {
    $scope.userRegData = {};
    $scope.loginData = {};

    $scope.checkLogin = function() {
        $http.get('/api/user').then(function(response) {
            window.location.replace('/UserProfile.html');
        }, function(response) {

        });
    };
    $scope.checkLogin();

    $scope.register = function() {
        var fd = new FormData();
        fd.append('profilePic', $scope.myFile);

        if (!$scope.userRegData.username) {

            swal({
                title: 'Error!',
                confirmButtonColor: '#9cdc1f',
                allowOutsideClick: true,
                text: 'Please enter a username',
                type: 'error',
                confirmButtonText: 'Back'
            });
            return;
        } else {
            fd.append('username', $scope.userRegData.username);
        }

        if (!$scope.userRegData.password) {
            swal({
                title: 'Error!',
                confirmButtonColor: '#9cdc1f',
                allowOutsideClick: true,
                text: 'Please enter a password',
                type: 'error',
                confirmButtonText: 'Back'
            });
            return;
        } else if ($scope.userRegData.password != $scope.userRegData.repPassword) {
            swal({
                title: 'Error!',
                confirmButtonColor: '#9cdc1f',
                allowOutsideClick: true,
                text: 'Passwords do not match',
                type: 'error',
                confirmButtonText: 'Back'
            });
            return;
        } else {
            fd.append('password', $scope.userRegData.password);
        }

        if (!validateEmail($scope.userRegData.email)) {
            swal({
                title: 'Error!',
                confirmButtonColor: '#9cdc1f',
                allowOutsideClick: true,
                text: 'Invalid/Missing Email',
                type: 'error',
                confirmButtonText: 'Back'
            });
            return;
        } else {
            fd.append('email', $scope.userRegData.email);
        }
        if ($scope.userRegData.profilePic) {
            fd.append('profilePic', $scope.userRegData.profilePic);
        }

        if (!$scope.userRegData.agreePrivacyPolicy) {
            swal({
                title: 'Error!',
                confirmButtonColor: '#9cdc1f',
                allowOutsideClick: true,
                text: 'Please agree to our privacy policy',
                type: 'error',
                confirmButtonText: 'Back'
            });
            return;
        }

        fd.append('agreeMail', $scope.userRegData.agreeMail);
        fd.append('agreeNewProject', $scope.userRegData.agreeNewProject);

        $http.post('api/user/add', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(function(response) {
            var data = response.data;
            if ('id' in data) {
                document.location.href = '/index.html';
            }
        }, function(response) {
            var msg = response.data.error || 'error';
            swal({
                title: 'Error!',
                confirmButtonColor: '#9cdc1f',
                allowOutsideClick: true,
                text: msg,
                type: 'error',
                confirmButtonText: 'Back'
            });
        });
    };

    $scope.login = function() {
        var data = {};
        data.username = $scope.loginData.email;
        data.rememberMe = $scope.loginData.rememberMe;
        if (!data.username) {
            swal({
                title: 'Error!',
                confirmButtonColor: '#9cdc1f',
                allowOutsideClick: true,
                text: 'Invalid Username',
                type: 'error',
                confirmButtonText: 'Back'
            });
            return;
        }
        data.password = $scope.loginData.password;

        if (!data.password) {
            swal({
                title: 'Error!',
                confirmButtonColor: '#9cdc1f',
                allowOutsideClick: true,
                text: 'Please enter a password',
                type: 'error',
                confirmButtonText: 'Back'
            });
            return;
        }

        $http.post('api/login', data).then(function(response) {
            var data = response.data;
            if ('id' in data) {
                document.location.href = '/UserProfile.html#/';
            }
        }, function(response) {
            var msg = response.data.error || 'error';
            swal({
                title: 'Error!',
                confirmButtonColor: '#9cdc1f',
                allowOutsideClick: true,
                text: msg,
                type: 'error',
                confirmButtonText: 'Back'
            });
        });
    };

    function handleImage(f) {
        var canvas = document.getElementById('imageCanvas');
        var ctx = canvas.getContext('2d');
        var reader = new FileReader();
        reader.onload = function(event) {
            var img = new Image();
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(f);
    }

    $scope.$watch('userRegData.profilePic', function() {
        if ($scope.userRegData.profilePic) {
            handleImage($scope.userRegData.profilePic);
        }
    });

    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
}]);

module.directive('fileModel', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function() {
                scope.$apply(function() {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

module.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind('keydown keypress', function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});
