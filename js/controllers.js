angular.module('doctorpricer.controllers', [])
	.controller('HomeController', function($scope, $state, $ionicLoading, $ionicPopup, SearchModel, PracticesCollection) {
		// Going from typing address to age
		$scope.update = function(user) {
    		if (!user.location){
	    		var alertPopup = $ionicPopup.alert({
				     title: "Couldn't geolocate your address!",
				     template: "Try selecting one of the suggestions in the list."
				   })
	    	}
	    	else if (user.location.address_components.length == 1) {
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
		$scope.innerWidth = $window.innerWidth;
		$scope.practices = PracticesCollection.displayCollection;
  		$scope.userAddress = SearchModel.address;

		$scope.$on('newSearch', function() {
			PracticesCollection.selectedPractice = 0;
        	$scope.address = SearchModel.displayAddress;
		})

		$scope.$on('countUpdated', function() {
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
        	if (!$ionicSideMenuDelegate.isOpen()) {
    			$ionicSideMenuDelegate.toggleLeft();
    		}
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

	.controller('PracticeController', function($scope, $rootScope, $timeout, $ionicPopup, $window, leafletData, PracticesCollection) {
		var directionsService = new google.maps.DirectionsService();
		// Stuff to initialize the map with
        angular.extend($scope, {
			center: {
				lat: 0,
				lng: 0,
				zoom: 10
			},
            paths: {},
            markers: {},
            scrollWheelZoom: false,
            layers: {
            	baselayers: {
            		osm: {
            			name: 'OSM',
            			url: 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png',
            			type: 'xyz',
            			layerOptions: {
                            attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_system">MapQuest</a>',
                        }
            		}
            	}
            }
        });

		$scope.$on('changePractice', function(e) {
			$scope.thisPractice = PracticesCollection.displayCollection[PracticesCollection.selectedPractice];
			updateMap(function() {});
		});

		$scope.openURL = function(url) {
			var ref = window.open(url, '_system');
		};

		$scope.openDirections = function() {
			var url = "http://maps.apple.com/?saddr=" + $scope.userAddress + "&daddr=" + $scope.thisPractice.address;
			var ref = window.open(url, '_system');
		}

         /* Icons for markers */
	   	var local_icons = {
	        markerBlue: {
	        	type: 'awesomeMarker',
	        	icon: 'icon ion-home',
	        	markerColor: 'blue'
	        },
	       	markerRed: {
	            type: 'awesomeMarker',
	            icon: 'icon ion-medkit',
	            markerColor: 'red'
	    	}
	   	};

		var initializeMap = function(callback) {
            $timeout(function() {
                var mapHeight = (PracticesCollection.screenHeight - 240) + 'px';
                    document.getElementById("leaflet_map").style.height = mapHeight;
                    document.getElementById("map_canvas").style.maxHeight = mapHeight;
                    leafletData.getMap().then(function(map) {
                        map.invalidateSize();
                        callback();
                    });
            }, 100);
        }

        var setDirections = function (callback) {
            var request = {
                origin: $scope.thisPractice.start,
                destination: $scope.thisPractice.end,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC,
                optimizeWaypoints: true
            };

            directionsService.route(request, function (response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                	var latlngs = L.Polyline.fromEncoded(response.routes[0].overview_polyline).getLatLngs();
                	$scope.paths.p1 = {
                		color: '#387ef5', 
                		weight: 6,
                		latlngs: latlngs,
                		type: 'polyline'
                	}
                	callback();
                } else {
                    scope.$apply(function () {
                       var alertPopup = $ionicPopup.alert({
                         title: "Sorry.",
                         template: "Usually you'd see directions here but there was an unexpected error. Check your connection."
                       });
                    });
                }
            });
        }

		var updateMap = function(callback) {
			setDirections(function() {
				$scope.markers = {
		            end: {
		            	title: "Destination",
		                lat: $scope.thisPractice.end.k,
		                lng: $scope.thisPractice.end.D,
		                focus: true,
		                icon: local_icons.markerRed
		            },
		            start: {
		            	title: "Start",
		            	lat: $scope.thisPractice.start.k,
		            	lng: $scope.thisPractice.start.D,
		            	icon: local_icons.markerBlue
		            }
		       	}

				var bounds = L.latLngBounds([$scope.thisPractice.end.k, $scope.thisPractice.end.D], [$scope.thisPractice.start.k, $scope.thisPractice.start.D])
				leafletData.getMap().then(function(map) {
					map.fitBounds(bounds, {padding: [15, 15]});
					callback();
	            });
            })
		}

		// After a new search
		$scope.$on('countUpdated', function() {
			if (PracticesCollection.length > 0){
				$scope.arePractices = 1;
				initializeMap(function() {
					$scope.thisPractice = PracticesCollection.displayCollection[0];
			        updateMap(function() {
			        	$scope.toggleLeftSideMenu();
			        });
				});
			} else {
                $scope.arePractices = 0;
				$timeout(function() {
					$scope.thisPractice = {'name': 'No results'}
					$scope.toggleLeftSideMenu();
				}, 100);
			}
		})

        // Initialize the shit
        $rootScope.$broadcast('newSearch');
		$rootScope.$broadcast('countUpdated');
	});