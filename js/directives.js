angular.module('doctorpricer.directives', [])
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