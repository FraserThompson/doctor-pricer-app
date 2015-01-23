angular.module('doctorpricer.directives', [])

    .directive('practiceInfo', function($window, $timeout, $rootScope, leafletData) {
        return {
            restrict: 'E',
            replace: 'true',
            templateUrl: './templates/practice-info.html',
            link: function(scope, elem, attributes) {
                function initializeMap() {
                    if (scope.arePractices){
                        $timeout(function() {
                            var mapHeight = ($window.innerHeight - 240) + 'px';
                                document.getElementById("leaflet_map").style.height = mapHeight;
                                document.getElementById("map_canvas").style.maxHeight = mapHeight;
                                leafletData.getMap().then(function(map) {
                                    map.invalidateSize()
                                });
                        }, 100);
                    }
                }

                $rootScope.$on('countUpdated', function() {
                    initializeMap();
                });

 
                initializeMap();
                $timeout(function() {
                    scope.toggleLeftSideMenu();
                }, 600)
            }
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