angular.module('doctorpricer.directives', [])
    .directive('gmap', function ($window,$parse) {
        var counter = 0;
         
        return {
            restrict: 'A',
            replace: false,
            templateUrl: './templates/gmap.html',
            link: function (scope, element, attrs, controller) {
                var getter = $parse(attrs.gmap),
                setter = getter.assign;
     
                var model = scope.gmap;
                 
                setter(scope, model);
     
                if ($window.google && $window.google.maps) {
                    gInit();
                } else {
                    injectGoogle();
                }
                
                function gInit() {
                    var Location = model.endCoord,
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

                    model.setDirections = function () {
                        var request = {
                            origin: model.fromCoord,
                            destination: model.endCoord,
                            travelMode: google.maps.TravelMode.DRIVING,
                            unitSystem: google.maps.UnitSystem.METRIC,
                            optimizeWaypoints: true
                        };

                        directionsService.route(request, function (response, status) {
                            if (status === google.maps.DirectionsStatus.OK) {
                                directionsRenderer.setDirections(response);
                                directionsRenderer.setMap(map);
                            } else {
                                if (angular.isFunction(model.showError)) {
                                    scope.$apply(function () {
                                        model.showError(status);
                                    });
                                }
                            }
                        });
                    }
     
                    // fire it up initially
                    model.setDirections();
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
    });