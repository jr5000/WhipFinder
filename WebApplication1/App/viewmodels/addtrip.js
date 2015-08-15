define(['durandal/app', 'services/logger', 'services/datacontext', 'async!http://maps.google.com/maps/api/js?sensor=false'], function (app, logger, datacontext) {
    var title = 'Home';
    var trip = ko.observable();
    var successful = ko.observable(false);

    function activate() {
        var theTrip = datacontext.createTrip();

        trip(theTrip);

        trip().startingLocation.subscribe(renderMap);
        trip().endLocation.subscribe(renderMap);

        trip().startingLocation('University of Waterloo');
        trip().endLocation(undefined);
        trip().dateOfDeparture(undefined);
        trip().timeOfDeparture(undefined);
        trip().maxDeviation(undefined);

        trip().dateOfDeparture.extend({
            pattern: {
                message: 'Must be in yyyy/mm/dd',
                params: '^[0-9]{4}[/-]{1}[0-9]{2}[/-]{1}[0-9]{2}$'
            },
            required: {
                message: 'Required'
            }
        });

        trip().timeOfDeparture.extend({
            pattern: {
                message: 'Must be in hh:mm (24-hour clock)',
                params: '^[0-9]{2}[:]{1}[0-9]{2}$'
            },
            required: {
                message: 'Required'
            }
        });

        trip().maxDeviation.extend({
            pattern: {
                message: 'Must be in hh:mm',
                params: '^[0-9]{2}[:]{1}[0-9]{2}$'
            },
            required: {
                message: 'Required'
            }
        });

        trip().startingLocation.extend({
            required: {
                message: 'Required'
            }
        });

        trip().endLocation.extend({
            required: {
                message: 'Required'
            }
        });

        successful.extend({ equal: { params: true, message: 'Route must exist' } });

        //ko.applyBindings(vm);
    }

    var submit = function () {
        if (isValid()) {
            app.showMessage('Are you sure you would like to create this trip?', 'Confirmation', ['No', 'Yes']).then(function (answer) {
                if (answer === 'Yes') {
                    trip().emailAddress(MyEmail());
                    return datacontext.saveChanges(trip()).then(function () {
                        app.showMessage('Successfully added trip.', 'Success');
                    });
                }
            });
        } else {
            app.showMessage('Please correct the errors on the form and try again.', 'Error');
        }
    }

    function renderMap() {
        if (trip() && trip().startingLocation() && trip().endLocation()) {
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
                provideRouteAlternatives: true,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidTolls: true
            }
            directionsService.route(obj, function (result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(result);
                    console.log(result);
                    successful(true);
                }
                else {
                    successful(false);
                    app.showMessage('No route found.', 'Error');
                }
            });
        }
    }

    var isValid = function () {
        var validationModel = ko.validation.group([trip, successful], {deep: true});

        var valid = validationModel().length == 0;
        if (!valid) {
            validationModel.showAllMessages();
        }
        return valid;
    }

    var deactivate = function () {
        trip(undefined);
    }

    //#endregion
    var vm = {
        title: title,
        activate: activate,
        deactivate: deactivate,
        trip: trip,
        submit: submit,
        isValid: isValid,
        successful: successful
    };

    return vm;
});