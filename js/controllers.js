angular.module('starter.controllers', [])
	.controller('HomeController', function($scope, $state, $sce, $ionicLoading, SearchModel, PracticesCollection) {
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
			$scope.locationButton = $sce.trustAsHtml("<i class='icon ion-loading-c'></i>");
			navigator.geolocation.getCurrentPosition(function(response){
				SearchModel.coord[0] = response.coords['latitude']
				SearchModel.coord[1] = response.coords['longitude'];
				SearchModel.calculateAddress(function() {
					$scope.$apply(function() {
						$scope.locationButton = SearchModel.address;
					});
					$state.go('age');
				});
			});
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

	.controller('PracticeController', function($scope, $stateParams, $window, PracticesCollection) {
		var self = this;
		$scope.practiceName = $stateParams.id;
		$scope.thisPractice = PracticesCollection.displayCollection[$stateParams.id];
		$scope.gmap = {
            fromCoord: PracticesCollection.displayCollection[$stateParams.id]['start'],
            endCoord: PracticesCollection.displayCollection[$stateParams.id]['end'],
            showError: function (status) {
                console.log('huge error with the map thing!');
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