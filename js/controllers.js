angular.module('doctorpricer.controllers', [])
	.controller('HomeController', function($scope, $state, $ionicLoading, SearchModel, PracticesCollection) {

		// Going from typing address to age
		$scope.update = function(user) {
			$ionicLoading.show({
     		 	template: "Hold on..."
    		});
			SearchModel.address = user.location['formatted_address'];
			SearchModel.coord[0] = user.location.geometry.location['k'];
			SearchModel.coord[1] = user.location.geometry.location['D'];
			SearchModel.displayAddress = user.location.address_components[0]['short_name'] + " " + user.location.address_components[1]['short_name'];
			$state.go('age');
			$ionicLoading.hide();
		};

		// Going from age to results
		$scope.finish = function(user) {
			SearchModel.age = user.age;
			PracticesCollection.filterCollection(SearchModel.coord, SearchModel.age);
			PracticesCollection.changeRadius(2);
			$state.go('result.practice');
		};
	})

	.controller('MenuController', function($scope, $state, $window, $ionicSideMenuDelegate, $ionicHistory, PracticesCollection, SearchModel) {
		var self = this;

		$scope.notTablet = $window.innerWidth < 768 ? 1 : 0;
		$scope.practices = PracticesCollection.displayCollection;
		$scope.practiceCount = PracticesCollection.length;
		$scope.menuWidth = $scope.notTablet ? $window.innerWidth : 310; // Width of the menu should be restricted if we're on a tablet
		$scope.address = SearchModel.displayAddress;

		if (SearchModel.displayAddress == "error") {
			$state.go('home');
			$ionicHistory.clearHistory()
		}

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
			$scope.practiceCount = PracticesCollection.length;
		};

		$scope.navPractice = function(id) {
			SearchModel.selectedPractice = id;
		};

		$scope.isActive = function(id) {
        	return id == SearchModel.selectedPractice;
        };
		
        $scope.setFirst = function(id, first) {
        	if (first) {
        		SearchModel.selectedPractice = id;
        	}
        };
	})

	.controller('PracticeController', function($scope, $timeout, $ionicPopup, $window, SearchModel, PracticesCollection) {
		var self = this;

		SearchModel.selectedPractice = Object.keys(PracticesCollection.displayCollection)[0];

		$scope.$watch(function() {
			return SearchModel.selectedPractice;
		}, function(val) {
			$scope.thisPractice = PracticesCollection.displayCollection[SearchModel.selectedPractice];
			$scope.practiceName =  $scope.thisPractice['name'];
        });

		$scope.openURL = function(url) {
			var ref = window.open(url, '_system');
		};

		$timeout(function () { // Wait for DOM and then wait a bit longer 
			$timeout(function() {
		    	$scope.toggleLeftSideMenu();
			}, 20);
		});
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