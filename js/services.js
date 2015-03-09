angular.module('doctorpricer.services', [])
	.service('SearchModel', function($rootScope) {
		var self = this;
		this.address = "new zealand";
		this.displayAddress = "error";
		this.coord = [0, 0];
		this.age = 0;

		this.calculateAddress = function(successCallback, failCallback) {
			var geocoder = new google.maps.Geocoder();
			var coordsObj = new google.maps.LatLng(self.coord [0], self.coord[1])
			var geocoderProper = geocoder.geocode({'latLng': coordsObj}, function (results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					self.address = results[0].address_components[0]['short_name'] + " " + results[0].address_components[1]['short_name'] + ", " + results[0].address_components[2]['short_name'];
					self.displayAddress = results[0].address_components[0]['short_name'] + " " + results[0].address_components[1]['short_name'];
					successCallback();
				} else {
					failCallback("Error geocoding input address.");
				}
			});
		}
	})

	.service('PracticesCollection', function($ionicLoading, $window, $q, $http, $timeout, $ionicPopup, $rootScope) {
		var self = this;
		var collection = []; //initial fetch
		this.screenHeight = $window.innerHeight;
		this.displayCollection =  []; //after filtering for the users radius
		this.selectedPractice = 0;
		this.length = 0;

		var dataFail = function() {
			$ionicLoading.hide();
			var alertPopup = $ionicPopup.alert({
			     title: "Couldn't get practice data!",
			     template: "You need an internet connection to use Doctor Pricer."
			   	})
			  	.then(function(result) {
	         		ionic.Platform.exitApp();
	           	});
		}

		this.fetchData = function(lat, lng, age) {
			$ionicLoading.show({
	     		 template: 'Loading...'
	    	});
			var defer = $q.defer();
			$http.get('https://young-ocean-1948.herokuapp.com/practices/' + lat + ',' + lng + '/' + age)
				.success(function(data) {
					self.collection = data;
					$ionicLoading.hide();
					defer.resolve();
				})
				.error(function(data, status) {
					dataFail();
					defer.reject();
				})
			return defer.promise;
		};

		var updateCount = function(){
			self.length = self.displayCollection.length;
			$rootScope.$broadcast('countUpdated');
		}

		var compare = function(a,b) {
		  if (a.price < b.price)
		     return -1;
		  if (a.price > b.price)
		    return 1;
		  return 0;
		}

		this.changeRadius = function(distance) {
			var okay = [];
			angular.forEach (self.collection, function(model, i) {
				if (model['distance'] <= distance){
					okay.push(model);
				}
			});
			okay.sort(compare);
			angular.copy(okay, this.displayCollection);
			updateCount();
		};

	})