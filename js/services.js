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

	.service('PracticesCollection', function($ionicLoading, $window, $http, $timeout, $ionicPopup, $rootScope) {
		var self = this;
		var collection = []; //initial fetch
		this.screenHeight = $window.innerHeight;
		this.filteredCollection = []; //after filtering out distances over 15
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

		var data_timeout = $timeout(dataFail, 10000);
		$ionicLoading.show({
     		 template: 'Loading...'
    	});
		var url = "http://fraserthompson.github.io/cheap-practice-finder/data.json.js?callback=JSON_CALLBACK"
		window.callback = function(data) {
			$ionicLoading.hide();
		    $timeout.cancel(data_timeout);
		    self.collection = data['practices'];
		}
		$http.jsonp(url)

		var getPrice = function(age, prices) {
			if (!prices || prices.length == 0){
				return 1000;
			}
			for (var i = 0; i < prices.length - 1; ++i){
				if (age >= prices[i].age && age < prices[i+1].age){
					break;
				}
			}
			return prices[i].price;
			if (prices[i].price == 999){
				return -1;
			}
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
			angular.forEach (self.filteredCollection, function(model, i) {
				if (model['distance'] <= distance){
					okay.push(model);
				}
			});
			okay.sort(compare);
			angular.copy(okay, this.displayCollection);
			updateCount();
		};

		this.filterCollection = function(coord, age) {
			self.filteredCollection = [];
			angular.forEach(self.collection, function(val, key) {
				val['start'] = new google.maps.LatLng(coord[0], coord[1]);
				val['end'] = new google.maps.LatLng(val['coordinates'][0], val['coordinates'][1]);
				var distance_between = google.maps.geometry.spherical.computeDistanceBetween(val['start'], val['end']);
				val['distance'] = distance_between/1000;
				val['price'] = getPrice(age, val['prices']);
				if (val['distance'] <= 15){
					self.filteredCollection.push(val);
				}
			});
		}
	})