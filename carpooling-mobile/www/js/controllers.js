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

.controller('OffriCtrl', function ($scope, $filter, $ionicModal, $ionicPopup, $ionicLoading, Config, MapSrv, GeoSrv, PlanSrv) {
    $scope.locations = {
        'from': {
            'name': '',
            'latlng': ''
        },
        'to': {
            'name': '',
            'latlng': ''
        }
    };

    // names: array with the names of the places
    // coordinates: object that maps a place name with an object that has its coordinate in key 'latlng'
    $scope.places = {
        'names': [],
        'coordinates': {}
    };

    $scope.typing = function (typedthings) {
        var result = typedthings;
        var newPlaces = PlanSrv.getTypedPlaces(typedthings);
        newPlaces.then(function (data) {
            //merge with favorites and check no double values
            $scope.places.names = data;
            $scope.places.coordinates = PlanSrv.getNames();
        });
    };

    $scope.setLocationFrom = function (name) {
        $scope.locations['from'].name = name;
        $scope.locations['from'].latlng = $scope.places.coordinates[name].latlng;
    };
    $scope.setLocationTo = function (name) {
        $scope.locations['to'].name = name;
        $scope.locations['to'].latlng = $scope.places.coordinates[name].latlng;
    };

    /*
     * Map stuff
     */
    var mapId = 'modalMap';
    var selectedField = null;

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
        events: {
            map: {
                enable: ['click']
            }
        }
    });

    // Modal Map
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

                $ionicLoading.show();

                // TODO: strings, button styles, actions
                var confirmPopup = null;
                var confirmPopupOptions = {
                    title: 'TITOLO',
                    template: '',
                    buttons: [
                        {
                            text: $filter('translate')('cancel'),
                            type: 'button'
                        },
                        {
                            text: $filter('translate')('ok'),
                            type: 'button-carpooling'
                        }
                    ]
                };

                var fillConfirmPopupOptions = function (placeName, coordinates) {
                    confirmPopupOptions.template = placeName;
                    confirmPopupOptions.buttons[1].onTap = function () {
                        if (!!selectedField) {
                            $scope.locations[selectedField].name = placeName;
                            $scope.locations[selectedField].coordinates = coordinates;
                        }
                        $scope.hideModalMap();
                    };
                };

                GeoSrv.geolocate([args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng]).then(
                    function (data) {
                        $ionicLoading.hide();
                        var placeName = '';
                        var coordinates = '';

                        if (!!data.response.docs[0]) {
                            placeName = PlanSrv.generatePlaceString(data.response.docs[0]);
                            coordinates = data.response.docs[0].coordinate;
                        } else {
                            placeName = args.leafletEvent.latlng.lat + ',' + args.leafletEvent.latlng.lng;
                            coordinates = args.leafletEvent.latlng.lat + ',' + args.leafletEvent.latlng.lng;
                        }

                        fillConfirmPopupOptions(placeName, coordinates);
                        confirmPopup = $ionicPopup.confirm(confirmPopupOptions);
                        console.log(placeName + ' (' + coordinates + ')');
                    },
                    function (err) {
                        $ionicLoading.hide();
                        var placeName = args.leafletEvent.latlng.lat + ',' + args.leafletEvent.latlng.lng;
                        var coordinates = args.leafletEvent.latlng.lat + ',' + args.leafletEvent.latlng.lng;
                        fillConfirmPopupOptions(placeName, coordinates);
                        confirmPopup = $ionicPopup.confirm(confirmPopupOptions);
                        console.log(placeName + ' (' + coordinates + ')');
                    }
                );
            });
        });
    };

    $scope.showModalMap = function (field) {
        selectedField = field;

        $scope.modalMap.show().then(function () {
            // resize map!
            var modalMapElement = document.getElementById('modal-map-container');
            if (modalMapElement != null) {
                MapSrv.resizeElementHeight(modalMapElement, mapId);
                MapSrv.refresh(mapId);
            }
        });
    };

    /*
     * Recurrence popup stuff
     */
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

.controller('CercaViaggioCtrl', function ($scope, Config, $q, $http, $ionicModal, $ionicLoading, $filter, $state, $window, PlanSrv, GeoSrv, MapSrv, $ionicPopup) {

    $scope.datepickerObject = {};
    $scope.dateTimestamp = null;
    $scope.hourTimestamp = null;
    $scope.datepickerObject.inputDate = new Date();

    $scope.locations = {
        'from': {
            'name': '',
            'latlng': ''
        },
        'to': {
            'name': '',
            'latlng': ''
        }
    };

    // names: array with the names of the places
    // coordinates: object that maps a place name with an object that has its coordinate in key 'latlng'
    $scope.places = {
        'names': [],
        'coordinates': {}
    };

    $scope.typing = function (typedthings) {
        var result = typedthings;
        var newPlaces = PlanSrv.getTypedPlaces(typedthings);
        newPlaces.then(function (data) {
            //merge with favorites and check no double values
            $scope.places.names = data;
            $scope.places.coordinates = PlanSrv.getNames();
        });
    };

    $scope.setLocationFrom = function (name) {
        $scope.locations['from'].name = name;
        $scope.locations['from'].latlng = $scope.places.coordinates[name].latlng;
    };
    $scope.setLocationTo = function (name) {
        $scope.locations['to'].name = name;
        $scope.locations['to'].latlng = $scope.places.coordinates[name].latlng;
    };

    /*
     * Map stuff
     */
    var mapId = 'modalMap';
    var selectedField = null;

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

    // Modal Map
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

                $ionicLoading.show();

                // TODO: strings, button styles, actions
                var confirmPopup = null;
                var confirmPopupOptions = {
                    title: 'TITOLO',
                    template: '',
                    buttons: [
                        {
                            text: $filter('translate')('cancel'),
                            type: 'button'
                        },
                        {
                            text: $filter('translate')('ok'),
                            type: 'button-carpooling'
                        }
                    ]
                };

                var fillConfirmPopupOptions = function (placeName, coordinates) {
                    confirmPopupOptions.template = placeName;
                    confirmPopupOptions.buttons[1].onTap = function () {
                        if (!!selectedField) {
                            $scope.locations[selectedField].name = placeName;
                            $scope.locations[selectedField].coordinates = coordinates;
                        }
                        $scope.hideModalMap();
                    };
                };

                GeoSrv.geolocate([args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng]).then(
                    function (data) {
                        $ionicLoading.hide();
                        var placeName = '';
                        var coordinates = '';

                        if (!!data.response.docs[0]) {
                            placeName = PlanSrv.generatePlaceString(data.response.docs[0]);
                            coordinates = data.response.docs[0].coordinate;
                        } else {
                            placeName = args.leafletEvent.latlng.lat + ',' + args.leafletEvent.latlng.lng;
                            coordinates = args.leafletEvent.latlng.lat + ',' + args.leafletEvent.latlng.lng;
                        }

                        fillConfirmPopupOptions(placeName, coordinates);
                        confirmPopup = $ionicPopup.confirm(confirmPopupOptions);
                        console.log(placeName + ' (' + coordinates + ')');
                    },
                    function (err) {
                        $ionicLoading.hide();
                        var placeName = args.leafletEvent.latlng.lat + ',' + args.leafletEvent.latlng.lng;
                        var coordinates = args.leafletEvent.latlng.lat + ',' + args.leafletEvent.latlng.lng;
                        fillConfirmPopupOptions(placeName, coordinates);
                        confirmPopup = $ionicPopup.confirm(confirmPopupOptions);
                        console.log(placeName + ' (' + coordinates + ')');
                    }
                );
            });
        });
    };

    $scope.showModalMap = function (field) {
        selectedField = field;

        $scope.modalMap.show().then(function () {
            // resize map!
            var modalMapElement = document.getElementById('modal-map-container');
            if (modalMapElement != null) {
                MapSrv.resizeElementHeight(modalMapElement, mapId);
                MapSrv.refresh(mapId);
            }
        });
    };

    /*
     * Recurrence popup stuff
     */
    $scope.hideModalMap = function () {
        $scope.modalMap.hide();
    };



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

})

.controller('NotificationCtrl', function ($scope, $filter, $state) {
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
    ];
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
    $scope.showNotification = function (notific) {
        switch (notific.type) {
            case $scope.notificationType[0]:
                // messages - to chat
                $state.go('app.chat');
                break;
            case $scope.notificationType[1]:
                // trip request - to mytrip
                $state.go('app.mioviaggio');
                break;
            case $scope.notificationType[2]:
                // trip response - to trip
                $state.go('app.home.partecipo');
                break;
            case $scope.notificationType[3]:
                // driver rating - to driver profile (trip data)
                $state.go('app.home.partecipo');
                break;
            case $scope.notificationType[4]:
                // passenger rating - to passenger profile (mytrip data)
                $state.go('app.mioviaggio');
                break;
            default:
                break;
        };
    };
    $scope.messages = [
        {
            id: '1',
            userId: 1,
            text: 'Ciao Mario',
            timestamp: '1447865802692',
            userId_target: 2
        }, {
            id: '2',
            userId: 1,
            text: 'E\' possibile aggiungere una tappa intermedia a Mattarello nel tuo viaggio? Grazie',
            timestamp: '1447865802692',
            userId_target: 2
        }, {
            id: '3',
            userId: 2,
            text: 'Ciao Stefano, certo nessun problema. Passo davanti alla Coop mi puoi aspettare li',
            timestamp: '1447918789919',
            userId_target: 1
        }
    ];
    // test data for users
    $scope.tmp_users = [
        {
            id: 1,
            name: 'Stefano',
            surname: 'Bianchi',
            email: 'stefano.bianchi@prova.it'
        }, {
            id: 2,
            name: 'Mario',
            surname: 'Rossi',
            email: 'mario.rossi@prova.it'
        }
    ];

    $scope.getUserById = function (id) {
        for (var i = 0; i < $scope.tmp_users.length; i++) {
            var us = $scope.tmp_users[i];
            if (us.id == id) {
                return us;
            }
        }
    }

    $scope.me = {
        id: 1
    };

    $scope.isMe = function (id) {
        return id == $scope.me.id;
    };

});
