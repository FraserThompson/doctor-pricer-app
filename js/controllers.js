angular.module('doctorpricer.controllers', [])
	.controller('HomeController', function($scope, $state, $ionicLoading, $ionicPopup, SearchModel, PracticesCollection) {

		// Going from typing address to age
		$scope.update = function(user) {
			$ionicLoading.show({
     		 	template: "Hold on..."
    		});
    		if (!user.location){
				$ionicLoading.hide();
	    		var alertPopup = $ionicPopup.alert({
				     title: "Couldn't geolocate your address!",
				     template: "Try selecting one of the suggestions in the list."
				   })
	    	}
	    	else if (user.location.address_components.length == 1) {
	    		$ionicLoading.hide();
	    		var alertPopup = $ionicPopup.alert({
				     title: "Error",
				     template: "Your address isn't specific enough."
				   })
    		} else {
				SearchModel.address = user.location['formatted_address'];
				SearchModel.coord[0] = user.location.geometry.location['k'];
				SearchModel.coord[1] = user.location.geometry.location['D'];
				SearchModel.displayAddress = user.location.address_components[0]['short_name'] + " " + user.location.address_components[1]['short_name'];
				$state.go('age');
				$ionicLoading.hide();
			}
		};
	})

	.controller('AgeController', function($state, $scope, $rootScope, SearchModel) {
		// Going from age to results
		$scope.finish = function(user) {
			SearchModel.age = user.age;
			$rootScope.$broadcast('newSearch');
			$state.go('result.practice');
		};
	})

	.controller('MenuController', function($scope, $state, $rootScope, $window, $ionicSideMenuDelegate, $ionicHistory, SearchModel, PracticesCollection) {
		$scope.notTablet = $window.innerWidth < 768 ? 1 : 0;
		$scope.menuWidth = $scope.notTablet ? $window.innerWidth : 310;
		$scope.practices = PracticesCollection.displayCollection;

		$rootScope.$on('newSearch', function() {
			PracticesCollection.selectedPractice = 0;
        	$scope.address = SearchModel.displayAddress;
		})

		$rootScope.$on('countUpdated', function() {
			$scope.practiceCount = PracticesCollection.length;
		})

		$scope.radiuses = [
			{id: 2, name: '2km'},
			{id: 5, name: '5km'},
			{id: 10, name: '10km'},
			{id: 15, name: '15km'},
		];

		$scope.goHome = function () {
			$state.go('home');
		};

        $scope.toggleLeftSideMenu = function() {
    		$ionicSideMenuDelegate.toggleLeft();
  		};

		$scope.changeRadius = function(distance) {
			PracticesCollection.changeRadius(distance);
		};

		$scope.navPractice = function(id) {
			PracticesCollection.selectedPractice = id;
			$scope.$broadcast('changePractice');
		};

		$scope.isActive = function(id) {
        	return id == PracticesCollection.selectedPractice;
        };
		
	})

	.controller('PracticeController', function($scope, $rootScope, $timeout, $ionicPopup, $window, PracticesCollection) {

		$scope.$on('changePractice', function(e) {
			$scope.thisPractice = PracticesCollection.displayCollection[PracticesCollection.selectedPractice];
		});

		$scope.openURL = function(url) {
			var ref = window.open(url, '_system');
		};

		$rootScope.$on('countUpdated', function() {
			if (PracticesCollection.length > 0){
				$scope.arePractices = 1;
				$timeout(function() {
					$scope.thisPractice = PracticesCollection.displayCollection[0];
				}, 50);
			} else {
				$timeout(function() {
					$scope.thisPractice = {'name': 'No results'}
				}, 50);
                $scope.arePractices = 0;
			}
		})

	 	// Wait for DOM and then wait a bit longer  before sliding menu
    	$timeout(function () {
			$timeout(function() {
		    	$scope.toggleLeftSideMenu();
			}, 50);
		});

        // Initialize the shit
        $rootScope.$broadcast('newSearch');
		$rootScope.$broadcast('countUpdated', {'count': PracticesCollection.length});
	})

	.filter('orderObjectBy', function() { //This isn't a controller lol
    return function(items, field, reverse) {
      var filtered = [];
      angular.forEach(items, function(item) {
        filtered.push(item);
      });
      filtered.sort(function (a, b) {
        return (a[field] > b[field] ? 1 : -1);
      });
      if(reverse) filtered.reverse();
      return filtered;
    };
  });