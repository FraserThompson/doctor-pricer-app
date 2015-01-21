angular.module('doctorpricer.directives', [])
    .directive('gmap', function ($window) {
        var counter = 0;
         
        return {
            restrict: 'E',
            replace: false,
            templateUrl: './templates/gmap.html',
            link: function (scope, element, attrs, controller) {
                var self = this;
                this.model = {};

                scope.$watchGroup([attrs.start, attrs.end], function(value) {
                    self.model.fromCoord = value[0];
                    self.model.endCoord = value[1];
                    if ($window.google && $window.google.maps) {
                        gInit();
                    } else {
                        injectGoogle();
                    };
                });

                function gInit() {      
                    var Location = self.model.endCoord,
                        mapHeight = ($window.innerHeight - 240) + 'px';
                        document.getElementById("map_canvas").style.height = mapHeight;
                        directionsService = new google.maps.DirectionsService(),
                        directionsRenderer = new google.maps.DirectionsRenderer(),
                        mapOptions = {
                            center: Location,
                            zoom: 11,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        },
                        map = new google.maps.Map(document.getElementById("map_canvas"),
                        mapOptions);

                    var setDirections = function () {
                        var request = {
                            origin: self.model.fromCoord,
                            destination: self.model.endCoord,
                            travelMode: google.maps.TravelMode.DRIVING,
                            unitSystem: google.maps.UnitSystem.METRIC,
                            optimizeWaypoints: true
                        };

                        directionsService.route(request, function (response, status) {
                            if (status === google.maps.DirectionsStatus.OK) {
                                directionsRenderer.setDirections(response);
                                directionsRenderer.setMap(map);
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
                    setDirections();
                }
                function injectGoogle() {
                    var cbId = prefix + ++counter;
     
                    $window[cbId] = gInit;
     
                    var wf = document.createElement('script');
                    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
                    '://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&' + 'callback=' + cbId;
                    wf.type = 'text/javascript';
                    wf.async = 'true';
                    var s = document.getElementsByTagName('script')[0];
                    s.parentNode.insertBefore(wf, s);
                };
            }
        }
    })

    .directive('practiceInfo', function($rootScope) {
        return {
            restrict: 'E',
            replace: 'true',
            templateUrl: './templates/practice-info.html'
        }
    })

    .directive('geolocateButton', function($sce, $timeout, $ionicPopup, $state, SearchModel) {
         return {
            restrict: 'E',
            replace: 'true',
            templateUrl: './templates/geolocate-button.html',
            scope: {
                ngBindHtml: '='
            },
            link: function(scope, elem, attributes) {
                failState = function() {
                     scope.$apply(function() {
                        scope.isDisabled = false;
                        scope.htmlValue = $sce.trustAsHtml("Try again?");
                    });
                };

                loadingState = function() {
                    scope.$apply(function() {
                        scope.isDisabled = true;
                        scope.htmlValue = $sce.trustAsHtml("<i class='icon ion-loading-c'></i>");
                    });
                };

                geolocFail = function() {
                    var alertPopup = $ionicPopup.alert({
                         title: "Couldn't find you.",
                         template: "You might need to enable GPS, or the signal might be weak."
                    });
                    failState();
                };
                
                scope.isDisabled = false;
                scope.htmlValue = $sce.trustAsHtml("Find practices near you");
                elem.bind('click', function() {
                    if (navigator.geolocation) {
                        var location_timeout = $timeout(geolocFail, 10000);
                        loadingState();
                        navigator.geolocation.getCurrentPosition(function(response){
                            $timeout.cancel(location_timeout);
                            SearchModel.coord[0] = response.coords['latitude'];
                            SearchModel.coord[1] = response.coords['longitude'];
                            SearchModel.calculateAddress(function() {
                                scope.$apply(function() {
                                    scope.isDisabled = false;
                                    scope.htmlValue = SearchModel.address;
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
                })
            }
        }
    });