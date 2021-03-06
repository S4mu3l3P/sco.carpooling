angular.module('carpooling.services.driver', [])

.factory('DriverSrv', function ($rootScope, $http, $q, Config) {
    var driverService = {};

    driverService.getDriverTrips = function (start, count) {
        var deferred = $q.defer();

        var httpConfig = Config.getHTTPConfig();

        if (start != null || count != null) {
            httpConfig.params = {};

            if (start != null) {
                if (start >= 0) {
                    httpConfig.params['start'] = start;
                } else {
                    deferred.reject('Invalid "start" value');
                    return deferred.promise;
                }
            }

            if (count != null) {
                if (count > 0) {
                    httpConfig.params['count'] = count;
                } else {
                    deferred.reject('Invalid "count" value');
                    return deferred.promise;
                }
            }
        }

        $http.get(Config.getServerURL() + '/api/driver/trips', httpConfig)

        .then(
            function (response) {
                if (response.data[0] == '<') {
                    deferred.reject(Config.LOGIN_EXPIRED);
                    $rootScope.login();
                } else {
                    deferred.resolve(response.data.data);
                }
            },
            function (responseError) {
                deferred.reject(responseError.data.error);
            }
        );

        return deferred.promise;
    };

    driverService.createTrip = function (travel) {
        var deferred = $q.defer();

        if (!travel || !travel.from || !travel.to && !travel.userId) {
            deferred.reject('Invalid travel');
        } else {
            $http.post(Config.getServerURL() + '/api/driver/trips', travel, Config.getHTTPConfig())

            .then(
                function (response) {
                    if (response.data[0] == '<') {
                        deferred.reject(Config.LOGIN_EXPIRED);
                        $rootScope.login();
                    } else {
                        deferred.resolve(response.data.data);
                    }
                },
                function (responseError) {
                    deferred.reject(responseError.data.error);
                }
            );
        }

        return deferred.promise;
    };

    driverService.decideTrip = function (tripId, booking) {
        var deferred = $q.defer();

        if (!tripId) {
            deferred.reject('Invalid tripId');
        } else if (!booking || !booking.traveller || !booking.traveller.userId || !booking.traveller.name || !booking.traveller.surname) {
            deferred.reject('Invalid travel');
        } else {
            $http.post(Config.getServerURL() + '/api/driver/trips/' + tripId + '/accept', booking, Config.getHTTPConfig())

            .then(
                function (response) {
                    if (response.data[0] == '<') {
                        deferred.reject(Config.LOGIN_EXPIRED);
                        $rootScope.login();
                    } else {
                        deferred.resolve(response.data.data);
                    }
                },
                function (responseError) {
                    deferred.reject(responseError.data.error);
                }
            );
        }

        return deferred.promise;
    };

    driverService.ratePassenger = function (passengerId, rating, booking) {
        var deferred = $q.defer();

        if (!passengerId) {
            deferred.reject('Invalid driverId');
        } else if (!rating || (rating < 1 || rating > 5)) {
            deferred.reject('Invalid rating');
        } else {
            $http.post(Config.getServerURL() + '/api/rate/passenger/' + passengerId + '/' + rating, booking, Config.getHTTPConfig())

            .then(
                function (response) {
                    if (response.data[0] == '<') {
                        deferred.reject(Config.LOGIN_EXPIRED);
                        $rootScope.login();
                    } else {
                        deferred.resolve(response.data);
                    }
                },
                function (responseError) {
                    deferred.reject(responseError.data.error);
                }
            );
        }

        return deferred.promise;
    };

    return driverService;
});
