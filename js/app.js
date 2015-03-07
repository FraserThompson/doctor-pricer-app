angular.module('doctorpricer', ['ionic', 'leaflet-directive', 'ion-google-place', 'doctorpricer.controllers', 'doctorpricer.services', 'doctorpricer.directives'])
  .run(function($ionicPlatform, $ionicLoading, $ionicPopup, $state) {
    $ionicPlatform.registerBackButtonAction(function (event) {
    if ($state.$current.name=="home"){
          ionic.Platform.exitApp();
        } else {
            navigator.app.backHistory();
        }
    }, 100);
    $ionicPlatform.ready(function() {
        navigator.splashscreen.hide()
        //Check for wifi
        if(window.Connection) {
          if(navigator.connection.type == Connection.NONE) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: "Couldn't get practice data",
                content: "You'll need an active internet connection to use Doctor Pricer."
            })
            .then(function() {
              ionic.Platform.exitApp();
            });
          }
        }
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
          StatusBar.styleDefault();
        }
    });
  })

  .config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: 'templates/home.html',
      controller: 'HomeController'
    })

    .state('age', {
      url: '/age',
      templateUrl: 'templates/age.html',
      controller: 'AgeController'
    })

    .state('result', {
      url: '/result',
      abstract: true,
      templateUrl: 'templates/result.html',
      controller: 'MenuController',
      onEnter: function(PracticesCollection, SearchModel) {
        PracticesCollection.filterCollection(SearchModel.coord, SearchModel.age);
        PracticesCollection.changeRadius(2);
      }
    })

    .state('result.practice', {
      url: '/practice',
      views: {
        'menuContent': {
          templateUrl: 'templates/practice.html',
          controller: 'PracticeController'
        }
      }
    });
     $urlRouterProvider.otherwise('/home');
});