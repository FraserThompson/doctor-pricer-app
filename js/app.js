// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ion-google-place', 'starter.controllers', 'starter.services', 'starter.directives'])
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
      templateUrl: 'templates/result.html',
      controller: 'ResultController'
    })

    .state('practice', {
      url: '/result/practice/{id}',
      templateUrl: 'templates/practice.html',
      controller: 'PracticeController'
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