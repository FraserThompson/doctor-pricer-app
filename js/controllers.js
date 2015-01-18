angular.module('doctorpricer.controllers', [])
	.controller('HomeController', function($scope, $state, $timeout, $sce, $ionicLoading, $ionicPopup, SearchModel, PracticesCollection) {
		$scope.locationButton = $sce.trustAsHtml("Find practices near you");

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

		$scope.continue = function() {		
			geolocFail = function() {
			   	var alertPopup = $ionicPopup.alert({
				     title: "Couldn't find you.",
				     template: "You might need to enable GPS, or the signal might be weak."
			   	});
				$scope.locationButton = $sce.trustAsHtml("Try again?");
			};
			if (navigator.geolocation) {
				var location_timeout = $timeout(geolocFail, 10000);
				$scope.locationButton = $sce.trustAsHtml("<i class='icon ion-loading-c'></i>");
				navigator.geolocation.getCurrentPosition(function(response){
					$timeout.cancel(location_timeout);
					SearchModel.coord[0] = response.coords['latitude'];
					SearchModel.coord[1] = response.coords['longitude'];
					SearchModel.calculateAddress(function() {
						$scope.$apply(function() {
							$scope.locationButton = SearchModel.address;
						});
						$state.go('age');
					});
				}, 
				function() {
					$timeout.cancel(location_timeout);
					geolocFail();
				}, {enableHighAccuracy:true});
			} else {
				geolocFail();
			}
		};

		$scope.finish = function(user) {
			SearchModel.age = user.age;
			PracticesCollection.filterCollection(SearchModel.coord, SearchModel.age);
			PracticesCollection.changeRadius(2);
			$state.go('result.practice');
		};
	})

	.controller('MenuController', function($scope, $state, $window, $ionicSideMenuDelegate, $ionicHistory, PracticesCollection, SearchModel) {
		var self = this;

		$scope.practices = PracticesCollection.displayCollection;
		$scope.practiceCount = PracticesCollection.length;
		$scope.menuWidth = $window.innerWidth < 360 ? $window.innerWidth : 360; // Width of the menu should be no more than 360
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
        	console.log('Toggling left');
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

		$scope.thisPractice = PracticesCollection.displayCollection[SearchModel.selectedPractice];
		$scope.$watch(function() {
			return SearchModel.selectedPractice;
		}, function(val) {
			$scope.thisPractice = PracticesCollection.displayCollection[SearchModel.selectedPractice];
			$scope.practiceName =  $scope.thisPractice['name'];
        };

        });

		$scope.openURL = function(url) {
			var ref = window.open(url, '_system');
		};

		$scope.gmap = {
            fromCoord: $scope.thisPractice['start'],
            endCoord: $scope.thisPractice['end'],
            showError: function (status) {
			   var alertPopup = $ionicPopup.alert({
			     title: "Sorry.",
			     template: "Usually you'd see directions here but there was an unexpected error. Check your connection."
			   });
            }
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