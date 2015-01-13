angular.module('starter.services', [])
	.service('SearchModel', function() {
		var self = this;
		this.address = "29 dundas street, dunedin, new zealand";
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
					console.log("Error geocoding input address from coords: " + status);
					failCallback("Error geocoding input address.");
				}
			});
		}
	})

	.service('PracticesCollection', function($ionicLoading, $http) {
		var self = this;
		var collection = []; //initial fetch
		this.filteredCollection = []; //after filtering out distances over 15
		this.displayCollection =  {}; //after filtering for the users radius
		this.length = 0;
		$ionicLoading.show({
     		 template: 'Loading...'
    	});
		$http.get('data.json')
			.then(function(res) {
   				$ionicLoading.hide();
				self.collection = res.data;
			});

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

		var updateCount = function (){
			self.length = Object.keys(self.displayCollection).length;
		}

		this.changeRadius = function(distance) {
			var okay = {};
			angular.forEach (self.filteredCollection, function(model, i) {
				if (model['distance'] <= distance){
					okay[model['name']] = model;
				}
			});
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
			updateCount();
		}
	})