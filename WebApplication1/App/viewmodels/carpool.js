define(['durandal/app', 'services/logger', 'services/datacontext', 'async!http://maps.google.com/maps/api/js?sensor=false'], function (app, logger, datacontext) {
    var title = 'Details';
    var startingLocation2 = ko.observable('University of Waterloo');
    var endLocation2 = ko.observable();
    var distanceWithPooler = ko.observable();
    var distanceWithoutPooler = ko.observable();
    var distanceOfPooler = ko.observable();
    var timeWithPooler = ko.observable();
    var timeWithoutPooler = ko.observable();

    var list = ko.observableArray();

    var trip = ko.observable();

    //#region Internal Methods
    function renderMap() {
        if (trip() && trip().startingLocation() == startingLocation2() && endLocation2()) {
            var mapOptions = {
                zoom: 14
            }
            map = new google.maps.Map(document.getElementById("map"), mapOptions);
            var directionsDisplay = new google.maps.DirectionsRenderer();
            var directionsService = new google.maps.DirectionsService();
            directionsDisplay.setPanel(document.getElementById("directionsPanel"));
            directionsDisplay.setMap(map);
            var obj = {
                origin: trip().startingLocation(),
                destination: trip().endLocation(),
                waypoints: [
                  {
                      location: endLocation2(),
                      stopover: false
                  }],
                provideRouteAlternatives: true,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidTolls: true
            }
            var obj2 = {
                origin: trip().startingLocation(),
                destination: trip().endLocation(),
                provideRouteAlternatives: true,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidTolls: true
            }
            var obj3 = {
                origin: trip().startingLocation(),
                destination: endLocation2(),
                provideRouteAlternatives: true,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidTolls: true
            }
            var failed = false;

            var fail = function () {
                if (!failed) {
                    failed = true;
                    app.showMessage('No route found.', 'Error');
                }
            }

            directionsService.route(obj, function (result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(result);
                    distanceWithPooler(result.routes[0].legs[0].distance.value / 1000.0);
                    timeWithPooler(result.routes[0].legs[0].duration.value);
                    console.log(result);
                }
                else {
                    fail();
                }
            });
            directionsService.route(obj2, function (result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    distanceWithoutPooler(result.routes[0].legs[0].distance.value / 1000.0);
                    timeWithoutPooler(result.routes[0].legs[0].duration.value);
                }
                else {
                    fail();
                }
            });
            directionsService.route(obj3, function (result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    distanceOfPooler(result.routes[0].legs[0].distance.value / 1000.0);
                }
                else {
                    fail();
                }
            });
        }
    }
    
    function activate() {

        startingLocation2.subscribe(renderMap);
        endLocation2.subscribe(renderMap);
        trip.subscribe(renderMap);

        return datacontext.getTrips().then(function (trips) {
            list(trips);
        });
    }

    var distance = ko.computed(function () {
        if (distanceWithPooler() && distanceWithoutPooler()) {
            var dist = distanceWithPooler() - distanceWithoutPooler();
            return +(Math.round(dist + "e+2") + "e-2");
        }
    });

    var cost = ko.computed(function () {
        if (distance() && distanceOfPooler()) {
            var gasPrice = 1.10;
            var lpkm = 0.089;
            var c = distance() * lpkm * gasPrice + (distanceOfPooler() - distance()) * lpkm * gasPrice * 0.5;
            return +(Math.round(c + "e+2") + "e-2");
        }
    });

    var time = ko.computed(function () {
        if (timeWithPooler() && timeWithoutPooler()) {
            var t = (timeWithPooler() - timeWithoutPooler()) / 60.0;
            return +(Math.round(t + "e+2") + "e-2");
        }
    });

    var deactivate = function () {
        trip(undefined);
    }

    var vm = {
        activate: activate,
        title: title,
        startingLocation2: startingLocation2,
        endLocation2: endLocation2,
        renderMap: renderMap,
        distanceWithPooler: distanceWithPooler,
        distanceWithoutPooler: distanceWithoutPooler,
        timeWithPooler: timeWithPooler,
        timeWithoutPooler: timeWithoutPooler,
        distance: distance,
        cost: cost,
        time: time,
        list: list,
        trip: trip,
        deactivate: deactivate
    };

    return vm;
});