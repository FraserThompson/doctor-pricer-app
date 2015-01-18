angular.module('doctorpricer', ['ionic', 'ion-google-place', 'doctorpricer.controllers', 'doctorpricer.services', 'doctorpricer.directives'])
  .run(function($ionicPlatform, $ionicLoading, $ionicPopup) {
    $ionicPlatform.ready(function() {
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
    });
  })

  .config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'templates/home.html',
      controller: 'HomeController'
    })

    .state('age', {
      url: '/age',
      templateUrl: 'templates/age.html',
      controller: 'HomeController'
    })

    .state('result', {
      url: '/result',
      abstract: true,
      templateUrl: 'templates/result.html',
      controller: 'MenuController'
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
     $urlRouterProvider.otherwise('/');
  })

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  })
});