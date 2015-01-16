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
			$state.go('result');
		};
	})

	.controller('ResultController', function($scope, $state, $ionicHistory, PracticesCollection, SearchModel) {
		var self = this;
		if (SearchModel.displayAddress == "error") {
			$state.go('home');
			$ionicHistory.clearHistory()
		}
		$scope.practices = PracticesCollection.displayCollection;
		$scope.practiceCount = PracticesCollection.length;
		$scope.changeRadius = function(distance) {
			PracticesCollection.changeRadius(distance);
			$scope.practiceCount = PracticesCollection.length;
		}
		$scope.radiuses = [
			{id: 2, name: '2km'},
			{id: 5, name: '5km'},
			{id: 10, name: '10km'},
			{id: 15, name: '15km'},
		];
		$scope.address = SearchModel.displayAddress;
		PracticesCollection.filterCollection(SearchModel.coord, SearchModel.age);
		PracticesCollection.changeRadius(2);
	})

	.controller('PracticeController', function($scope, $stateParams, $ionicLoading, $ionicPopup, $window, PracticesCollection) {
		var self = this;
		$scope.practiceName = $stateParams.id;
		$scope.thisPractice = PracticesCollection.displayCollection[$stateParams.id];
		$scope.openURL = function(url) {
			var ref = window.open(url, '_system');
		}
		
		$scope.gmap = {
            fromCoord: PracticesCollection.displayCollection[$stateParams.id]['start'],
            endCoord: PracticesCollection.displayCollection[$stateParams.id]['end'],
            showError: function (status) {
			   var alertPopup = $ionicPopup.alert({
			     title: "Sorry.",
			     template: "Usually you'd see a map here but there was an unexpected error."
			   });
            }
        };
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