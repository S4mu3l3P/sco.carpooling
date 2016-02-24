angular.module('carpooling.controllers.communityinfo', [])

.controller('CommunityInfoCtrl', function ($scope, $rootScope, $state, $stateParams, $ionicTabsDelegate, UserSrv, Utils, StorageSrv, $filter) {
    $scope.tab = 0;

    $scope.selectTab = function (idx) {
        //if (idx == $scope.tab) return;
        if (idx !== $scope.tab) {
            $scope.tab = idx;
            $ionicTabsDelegate.select(idx);
        }
    }

    $scope.travelDateFormat = 'dd MMMM yyyy';
    $scope.travelTimeFormat = 'HH:mm';

    $scope.communityTrips = null;
    $scope.communityStyle = null;
    $scope.community = {};
    $scope.travelTimeFormat = 'HH:mm';
    $scope.selectDate = Date.now();
    $scope.hasAuto = !!StorageSrv.getUser().auto;
    $scope.lbl_day = $filter('translate')('lbl_todaytrips');
    var start = new Date();
    var end = new Date();
    /*Get the start and the end of the current day in milliseconds*/
    var toTimestamp = function () {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        start = start.getTime();
        end = end.getTime();
    }
    toTimestamp();

    $scope.changeDay = function (num) {
        if (num === 0) {
            $scope.selectDate -= 24 * 60 * 60 * 1000;
        } else {
            $scope.selectDate += 24 * 60 * 60 * 1000;
        }
        compareDate();
        init();
    };
    /* Check if the selected date is Today  */
    var compareDate = function () {
        if ($scope.selectDate >= start && $scope.selectDate <= end) {
            $scope.lbl_day = $filter('translate')('lbl_todaytrips');
        } else {
            $scope.lbl_day = $filter('date')($scope.selectDate, 'EEEE dd/MM/yyyy');
        }
    };

    $scope.hideYesterday = function () {
        if ($scope.selectDate <= Date.now()) {
            return true;
        } else {
            return false;
        }
    };
    var init = function () {
        Utils.loading();
        UserSrv.getCommunityDetails($stateParams.community.id).then(
            function (community) {
                $scope.community = community;
                UserSrv.getCommunityTravels($scope.community.id, $scope.selectDate).then(
                    function (todayCommunityTrips) {
                        $scope.communityTrips = todayCommunityTrips;
                        $scope.communityTrips.forEach(function (trip) {
                            trip.bookingCounters = Utils.getBookingCounters(trip);
                        });
                        Utils.loaded();
                    },
                    function (error) {
                        Utils.loaded();
                        Utils.toast();
                    }
                );
                $scope.communityStyle = {
                    'border-color': '#' + $scope.community.color + ' #' + $scope.community.color + ' transparent transparent'
                }
            },
            function (error) {
                Utils.loaded();
                Utils.toast();
            }
        );
    };

    init();

    $scope.changeAutoState = function () {
        $state.go('app.profilo', {
            'communityFrom': $scope.community,
            'editMode': true
        });
    };

    $scope.showUser = function (index) {
        var user = $scope.community.userObjs[index];
        var params = {};
        if (user.userId !== StorageSrv.getUser().userId) {
            // it's-a-not-me
            params.user = user;
        }
        $state.go('app.profilo', params);
    };

    $scope.selectTrip = function (index) {
        $state.go('app.viaggio', {
            'travelId': $scope.communityTrips[index].id
        });
    };

    $scope.addTrip = function () {
        $state.go('app.offri', {
            'communityId': $scope.community.id
        });
    };
});
