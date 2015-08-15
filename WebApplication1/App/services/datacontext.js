define([
    'durandal/system',
    'services/logger',
    'services/breeze.partial-entities'],
    function (system, logger, partialMapper) {
        var EntityQuery = breeze.EntityQuery;
        var manager = configureBreezeManager();
        
        var getTrips = function () {
            var query = EntityQuery.from('Trips');

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);

            function querySucceeded(data) {
                var list = data.results;

                return list;

                log('Retrieved [Speaker] from remote data source', data, true);
            }
        };

        var cancelChanges = function() {
            manager.rejectChanges();
            log('Canceled changes', null, true);
        };

        var saveChanges = function() {
            return manager.saveChanges()
                .then(saveSucceeded)
                .fail(saveFailed);
            
            function saveSucceeded(saveResult) {
                log('Saved data successfully', saveResult, true);
            }
            
            function saveFailed(error) {
                var msg = 'Save failed: ' + getErrorMessages(error);
                logError(msg, error);
                error.message = msg;
                throw error;
            }
        };

        var createTrip = function() {
            return manager.createEntity('Trip');
        };

        var datacontext = {
            createTrip: createTrip,
            getTrips: getTrips,
            cancelChanges: cancelChanges,
            saveChanges: saveChanges,
            mgr: manager
        };

        return datacontext;

        //#region Internal methods        
        
        function getLocal(resource, ordering, includeNullos) {
            var query = EntityQuery.from(resource)
                .orderBy(ordering);
            if (!includeNullos) {
                query = query.where('id', '!=', 0);
            }
            return manager.executeQueryLocally(query);
        }
        
        function getErrorMessages(error) {
            var msg = error.message;
            if (msg.match(/validation error/i)) {
                return getValidationMessages(error);
            }
            return msg;
        }
        
        function getValidationMessages(error) {
            try {
                //foreach entity with a validation error
                return error.entitiesWithErrors.map(function(entity) {
                    // get each validation error
                    return entity.entityAspect.getValidationErrors().map(function(valError) {
                        // return the error message from the validation
                        return valError.errorMessage;
                    }).join('; <br/>');
                }).join('; <br/>');
            }
            catch (e) { }
            return 'validation error';
        }

        function queryFailed(error) {
            var msg = 'Error retreiving data. ' + error.message;
            logError(msg, error);
            throw error;
        }

        function configureBreezeManager() {
            breeze.NamingConvention.camelCase.setAsDefault();
            var mgr = new breeze.EntityManager('api/Breeze');
            return mgr;
        }


        function log(msg, data, showToast) {
            logger.log(msg, data, system.getModuleId(datacontext), showToast);
        }

        function logError(msg, error) {
            logger.logError(msg, error, system.getModuleId(datacontext), true);
        }
        //#endregion
});