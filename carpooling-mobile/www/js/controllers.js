angular.module('carpooling.controllers', [])

.controller('AppCtrl', function ($scope) {})

.controller('HomeCtrl', function ($scope) {})

.controller('PartecipoCtrl', function ($scope, UserSrv) {
    $scope.travelProfile = 'empty';

    $scope.getTravelProfile = function () {
        UserSrv.getTravelProfile().then(function (data) {
            $scope.travelProfile = data;
        });
    }
})

.controller('OffroCtrl', function ($scope) {})

.controller('OffriCtrl', function ($scope, $filter, $ionicModal, $ionicPopup, Config, MapSrv) {
    var mapId = 'modalMap';

    // NOTE: to be removed
    $scope.temp = function () {
        console.log('ciao');
    };

    $scope.modalMap = null;

    angular.extend($scope, {
        center: {
            lat: 46.067819,
            lng: 11.121306,
            zoom: 8
        },
        defaults: {
            scrollWheelZoom: false
        },
        events: {}
    });

    $ionicModal.fromTemplateUrl('templates/modal_map.html', {
        id: '1',
        scope: $scope,
        backdropClickToClose: true,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modalMap = modal;
    });

    $scope.initMap = function () {
        MapSrv.initMap(mapId).then(function () {

            $scope.$on('leafletDirectiveMap.' + mapId + '.click', function (event, args) {
                // TODO: strings, button styles, actions
                var confirmPopup = $ionicPopup.confirm({
                    title: 'TITOLO',
                    template: 'LAT:' + args.leafletEvent.latlng.lat.toString().substring(0, 7) + ' LON:' + args.leafletEvent.latlng.lng.toString().substring(0, 7),
                    buttons: [
                        {
                            text: $filter('translate')('cancel'),
                            type: 'button'
                        },
                        {
                            text: $filter('translate')('ok'),
                            type: 'button-carpooling',
                            onTap: function () {
                                //$scope.result = args.leafletEvent.latlng;
                                //return selectPlace(args.leafletEvent.latlng)
                                $scope.hideModalMap();
                                console.log(args.leafletEvent.latlng);
                                return args.leafletEvent.latlng;
                            }
                        }
                    ]
                });



                /*
                $ionicLoading.show();
                planService.setPosition($scope.place, args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng);
                var placedata = $q.defer();
                var url = Config.getGeocoderURL() + '/location?latlng=' + args.leafletEvent.latlng.lat + ',' + args.leafletEvent.latlng.lng;

                $http.get(encodeURI(url), {
                    timeout: 5000
                })

                .success(function (data, status, headers, config) {
                    $ionicLoading.hide();
                    name = '';
                    if (data.response.docs[0]) {
                        planService.setName($scope.place, data.response.docs[0]);
                        $scope.showConfirm(name, $filter('translate')("popup_address"), function () {
                            //$scope.result = name;
                            return selectPlace(name)
                        });
                    } else {
                        $scope.showConfirm($filter('translate')("popup_lat") + args.leafletEvent.latlng.lat.toString().substring(0, 7) + " " + $filter('translate')("popup_long") + args.leafletEvent.latlng.lng.toString().substring(0, 7), $filter('translate')("popup_no_address"), function () {
                            //$scope.result = args.leafletEvent.latlng;
                            return selectPlace(args.leafletEvent.latlng)
                        });
                    }
                })

                .error(function (data, status, headers, config) {
                    $ionicLoading.hide();
                    $scope.showNoConnection();
                });
                */
            });
        });
    };

    $scope.showModalMap = function () {
        $scope.modalMap.show().then(function () {
            // resize map!
            var modalMapElement = document.getElementById('modal-map-container');
            if (modalMapElement != null) {
                MapSrv.resizeElementHeight(modalMapElement, mapId);
                MapSrv.refresh(mapId);
            }
        });
    };

    $scope.hideModalMap = function () {
        $scope.modalMap.hide();
    };

    $scope.getDoW = function () {
        return Config.getDoW();
    };

    $scope.getArray = function (num) {
        var array = new Array(num);
        for (var i = 0; i < num; i++) {
            array[i] = i + 1;
        }
        return array;
    }

    $scope.recurrence = {
        isRecurrent: false,
        recurrenceType: 'w',
        recurrenceD: '1',
        recurrenceDoW: [],
        recurrenceDoWstring: ''
    };

    $scope.recurrentPopupDoW = [
        {
            name: 'dow_monday',
            shortname: 'dow_monday_short',
            value: 2,
            checked: false
        },
        {
            name: 'dow_tuesday',
            shortname: 'dow_tuesday_short',
            value: 3,
            checked: false
        },
        {
            name: 'dow_wednesday',
            shortname: 'dow_wednesday_short',
            value: 4,
            checked: false
        },
        {
            name: 'dow_thursday',
            shortname: 'dow_thursday_short',
            value: 5,
            checked: false
        },
        {
            name: 'dow_friday',
            shortname: 'dow_friday_short',
            value: 6,
            checked: false
        },
        {
            name: 'dow_saturday',
            shortname: 'dow_saturday_short',
            value: 7,
            checked: false
        },
        {
            name: 'dow_sunday',
            shortname: 'dow_sunday_short',
            value: 1,
            checked: false
        }
    ];

    $scope.updateRecurrence = function () {
        // update recurrenceDoW and recurrenceDoWstring
        $scope.recurrence.recurrenceDoW = [];
        $scope.recurrence.recurrenceDoWstring = '';

        for (var i = 0; i < $scope.recurrentPopupDoW.length; i++) {
            var dow = $scope.recurrentPopupDoW[i];
            if (dow.checked) {
                $scope.recurrence.recurrenceDoW.push(dow.value);
                if (!!$scope.recurrence.recurrenceDoWstring) {
                    $scope.recurrence.recurrenceDoWstring = $scope.recurrence.recurrenceDoWstring + ', ';
                }
                $scope.recurrence.recurrenceDoWstring = $scope.recurrence.recurrenceDoWstring + $filter('translate')(dow.name);
            }
        }
    };

    var recurrentPopup = {
        templateUrl: 'templates/popup_offri.html',
        title: $filter('translate')('title_setrecurrence'),
        scope: $scope,
        buttons: [
            {
                text: $filter('translate')('cancel')
            },
            {
                text: $filter('translate')('ok'),
                type: 'button-carpooling',
                onTap: function (e) {
                    // don't allow the user to close unless he enters wifi password
                    //e.preventDefault();
                    $scope.updateRecurrence();
                    return true;
                }
            }
        ]
    };

    $scope.$watch('recurrence.isRecurrent', function (newValue, oldValue) {
        if (newValue !== oldValue && !!newValue) {
            $ionicPopup.show(recurrentPopup).then(
                function (res) {
                    console.log($scope.recurrence.isRecurrent);
                    console.log($scope.recurrence.recurrenceType);
                    console.log($scope.recurrence.recurrenceDoW);
                    console.log($scope.recurrence.recurrenceDoWstring);
                    if (!!!res) {
                        $scope.recurrence.isRecurrent = false;
                    }
                }
            );
        }
    });
})

.controller('CercaViaggioCtrl', function ($scope, Config, $q, $http, $ionicModal, $ionicLoading, $filter, $state, $window, planService, GeoLocate, MapSrv, $ionicPopup) {

    $scope.datepickerObject = {};
    $scope.dateTimestamp = null;
    $scope.hourTimestamp = null;
    $scope.datepickerObject.inputDate = new Date();
    var mapId = 'modalMap';

    // NOTE: to be removed
    $scope.temp = function () {
        console.log('ciao');
    };

    $scope.modalMap = null;

    angular.extend($scope, {
        center: {
            lat: 46.067819,
            lng: 11.121306,
            zoom: 8
        },
        defaults: {
            scrollWheelZoom: false
        },
        events: {}
    });

    $ionicModal.fromTemplateUrl('templates/modal_map.html', {
        id: '1',
        scope: $scope,
        backdropClickToClose: true,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modalMap = modal;
    });

    $scope.initMap = function () {
        MapSrv.initMap(mapId).then(function () {

            $scope.$on('leafletDirectiveMap.' + mapId + '.click', function (event, args) {
                // TODO: strings, button styles, actions
                var confirmPopup = $ionicPopup.confirm({
                    title: 'TITOLO',
                    template: 'LAT:' + args.leafletEvent.latlng.lat.toString().substring(0, 7) + ' LON:' + args.leafletEvent.latlng.lng.toString().substring(0, 7),
                    buttons: [
                        {
                            text: $filter('translate')('cancel'),
                            type: 'button-positive'
                        },
                        {
                            text: $filter('translate')('ok'),
                            type: 'button-positive',
                            onTap: function () {
                                //$scope.result = args.leafletEvent.latlng;
                                //return selectPlace(args.leafletEvent.latlng)
                                console.log(args.leafletEvent.latlng);
                            }
                        }
                    ]
                });



                /*
                $ionicLoading.show();
                planService.setPosition($scope.place, args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng);
                var placedata = $q.defer();
                var url = Config.getGeocoderURL() + '/location?latlng=' + args.leafletEvent.latlng.lat + ',' + args.leafletEvent.latlng.lng;

                $http.get(encodeURI(url), {
                    timeout: 5000
                })

                .success(function (data, status, headers, config) {
                    $ionicLoading.hide();
                    name = '';
                    if (data.response.docs[0]) {
                        planService.setName($scope.place, data.response.docs[0]);
                        $scope.showConfirm(name, $filter('translate')("popup_address"), function () {
                            //$scope.result = name;
                            return selectPlace(name)
                        });
                    } else {
                        $scope.showConfirm($filter('translate')("popup_lat") + args.leafletEvent.latlng.lat.toString().substring(0, 7) + " " + $filter('translate')("popup_long") + args.leafletEvent.latlng.lng.toString().substring(0, 7), $filter('translate')("popup_no_address"), function () {
                            //$scope.result = args.leafletEvent.latlng;
                            return selectPlace(args.leafletEvent.latlng)
                        });
                    }
                })

                .error(function (data, status, headers, config) {
                    $ionicLoading.hide();
                    $scope.showNoConnection();
                });
                */
            });
        });
    };

    $scope.showModalMap = function () {
        $scope.modalMap.show().then(function () {
            var modalMapElement = document.getElementById('modal-map-container');
            if (modalMapElement != null) {
                MapSrv.resizeElementHeight(modalMapElement, mapId);
                MapSrv.refresh(mapId);
            }
        });
    };

    $scope.hideModalMap = function () {
        $scope.modalMap.hide();
    };

    $scope.title = $filter('translate')('plan_map_title');
    $scope.place = null;
    $scope.placesandcoordinates = null;
    $scope.planParams = {
        from: {
            name: '',
            lat: '',
            long: ''
        },
        to: {
            name: '',
            lat: '',
            long: ''
        },
        routeType: '',
        transportTypes: [],
        departureTime: '',
        date: ''
    };

    $scope.plan = function () {


        if (setAndCheckPlanParams()) {
            planService.planJourney($scope.planParams).then(function (value) {
                //if ok let's go to visualization
                $state.go('app.planlist')
            }, function (error) {
                //error then pop up some problem
                $scope.showErrorServer()
            });
        } else {
            //message something is missing
        }
    }
    var selectPlace = function (placeSelected) {
        if ($scope.place == 'from') {

            $scope.fromName = placeSelected;
            $scope.planParams.from.name = placeSelected;
            $scope.planParams.from.lat = planService.getPosition($scope.place).latitude;
            $scope.planParams.from.long = planService.getPosition($scope.place).longitude;
            console.log("(From) Latitude: " + $scope.planParams.from.lat + "\n Longitude: " + $scope.planParams.from.long);
        } else if ($scope.place == 'to') {
            $scope.toName = placeSelected;
            $scope.planParams.to.name = placeSelected;
            $scope.planParams.to.lat = planService.getPosition($scope.place).latitude;
            $scope.planParams.to.long = planService.getPosition($scope.place).longitude;
            console.log("(To) Latitude: " + $scope.planParams.to.lat + "\n Longitude: " + $scope.planParams.to.long);
        }
        console.log(placeSelected);
        /*close map*/
    }

    $scope.locateMe = function () {
        /*$ionicLoading.show()*/
        ;
        // if ($window.navigator.geolocation) {
        // $window.navigator.geolocation.getCurrentPosition(function (position) {
        GeoLocate.locate().then(function (position) {
                //                $scope.$apply(function () {
                $scope.position = position;
                var placedata = $q.defer();
                var places = {};
                var url = Config.getGeocoderURL() + '/location?latlng=' + position[0] + ',' + position[1];

                //add timeout
                $http.get(encodeURI(url), {
                    timeout: 5000
                }).
                success(function (data, status, headers, config) {
                    //                         planService.setName($scope.place, data.response.docs[0]);

                    places = data.response.docs;
                    name = '';
                    if (data.response.docs[0]) {
                        $scope.place = 'from';
                        planService.setPosition($scope.place, position[0], position[1]);
                        planService.setName($scope.place, data.response.docs[0]);
                        selectPlace(name);
                    }
                    $ionicLoading.hide();
                }).
                error(function (data, status, headers, config) {
                    //temporary
                    $ionicLoading.hide();
                    $scope.showNoConnection();
                });

            }

        );

    };

    $scope.detail = function (view) {
        window.location.assign(view);
    }

    $scope.typePlace = function (typedthings) {
        $scope.result = typedthings;
        $scope.newplaces = planService.getTypedPlaces(typedthings);
        $scope.newplaces.then(function (data) {
            //merge with favorites and check no double values
            $scope.places = data;
            $scope.placesandcoordinates = planService.getnames();

        });
    }
    $scope.select = function (suggestion) {
        console.log("select");
    }
    $scope.setPlaceById = function (id) {
        console.log(id);
    }

    $scope.changeStringFrom = function (suggestion) {
        console.log("changestringfrom");
        $scope.place = 'from';
        planService.setPosition($scope.place, $scope.placesandcoordinates[suggestion].latlong.split(',')[0], $scope.placesandcoordinates[suggestion].latlong.split(',')[1]);
        planService.setName($scope.place, suggestion);
        selectPlace(suggestion);
    }
    $scope.changeStringTo = function (suggestion) {
        console.log("changestringto");
        $scope.place = 'to';
        planService.setPosition($scope.place, $scope.placesandcoordinates[suggestion].latlong.split(',')[0], $scope.placesandcoordinates[suggestion].latlong.split(',')[1]);
        planService.setName($scope.place, suggestion);
        selectPlace(suggestion);
    }

    /*TIMEPICKER*/

    $scope.timePickerObject = {
        inputEpochTime: ((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60), //Optional
        step: 1, //Optional
        format: 24, //Optional
        setLabel: 'Set', //Optional
        closeLabel: 'Close', //Optional
        setButtonType: 'button-positive', //Optional
        closeButtonType: 'button-stable', //Optional
        callback: function (val) { //Mandatory
            timePickerCallback(val);
        }
    };

    function timePickerCallback(val) {
        if (typeof (val) === 'undefined') {
            console.log('Time not selected');
        } else {
            var selectedTime = new Date(val * 1000);
            console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
            $scope.timePickerObject.inputEpochTime = val;
        }
    }

    /*----------*/

    /*DATAPICKER*/
    $scope.datepickerObject = {
        titleLabel: $filter('translate')('popup_datepicker_title'),
        todayLabel: $filter('translate')('popup_datepicker_today'),
        closeLabel: $filter('translate')('popup_datepicker_close'),
        setLabel: $filter('translate')('popup_datepicker_set'),
        setButtonType: 'button-carpooling', //Optional
        todayButtonType: 'button-carpooling', //Optional
        closeButtonType: '', //Optional
        inputDate: new Date(), //Optional
        mondayFirst: true, //Optional
        weekDaysList: Config.getweekList(), //Optional
        monthList: Config.getmonthList(), //Optional
        templateType: 'popup', //Optional
        showTodayButton: 'true', //Optional
        modalHeaderColor: 'bar-positive', //Optional
        modalFooterColor: 'bar-positive', //Optional
        from: new Date(2012, 8, 2), //Optional
        to: new Date(2018, 8, 25), //Optional
        callback: function (val) { //Mandatory
            datePickerCallback(val);
        },
        dateFormat: 'dd-MM-yyyy', //Optional
        closeOnSelect: false, //Optional
    };

    var datePickerCallback = function (val) {
        if (typeof (val) === 'undefined') {
            console.log('No date selected');
        } else {
            console.log('Selected date is : ', val);
            $scope.datepickerObject.inputDate = val;
        }
    };

    /*----------*/

    $scope.locateMe();

})

.controller('NotificationCtrl', function ($scope, $filter) {
    $scope.notificationType = [
        {
            name: 'message',
            value: 'Messaggio',
            image: 'ion-android-chat'
        }, {
            name: 'trip_request',
            value: 'Richiesta di viaggio',
            image: 'ion-android-car'
        }, {
            name: 'trip_response',
            value: 'Risposta ricerca viaggio',
            image: 'ion-android-search'
        }, {
            name: 'driver_rating',
            value: 'Valutazione conducente',
            image: 'ion-android-star'
        }, {
            name: 'passenger_rating',
            value: 'Valutazione passeggero',
            image: 'ion-android-star'
        }
    ]
    $scope.notifications = [
        {
            id: '1',
            type: $scope.notificationType[0],
            short_text: 'Nuovo messaggio da Mario Rossi',
            data_object: null,
            timestamp: '1447865802692'
        }, {
            id: '2',
            type: $scope.notificationType[1],
            short_text: 'Giulia Bianchi chiede di partecipare al tuo viaggio Trento - Rovereto',
            data_object: null,
            timestamp: '1447865802692'
        }, {
            id: '3',
            type: $scope.notificationType[2],
            short_text: 'Trovato un viaggio Trento - Pergine',
            data_object: null,
            timestamp: '1447918789919'
        }, {
            id: '4',
            type: $scope.notificationType[3],
            short_text: 'Valuta il conducente del viaggio Rovereto - Mattarello',
            data_object: null,
            timestamp: '1447918789919'
        }, {
            id: '5',
            type: $scope.notificationType[4],
            short_text: 'Valuta i passeggeri del tuo viaggio Verona - Rovereto',
            data_object: null,
            timestamp: '1447918789919'
        }
    ];
});
