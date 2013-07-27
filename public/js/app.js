'use strict';

// Declare app level module which depends on filters, and services

angular.module('pureheart', [
    'pureheart.controllers',
    'pureheart.filters',
    'pureheart.services',
    'pureheart.directives'
]).
config(function ($routeProvider, $locationProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'partials/login',
            controller: 'MainCtrl'
        }).
        when('/login', {
            templateUrl: 'partials/login',
            controller: 'LoginCtrl'
        }).
        when('/home', {
            title: 'Мои друзья',
            templateUrl: 'partials/home',
            controller: 'HomeCtrl'
        }).
        when('/get/:user_id', {
            title: 'Понравившиеся записи',
            templateUrl: 'partials/get',
            controller: 'GetCtrl'
        }).
        when('/settings', {
            title: 'Мои настройки',
            templateUrl: 'partials/settings',
            controller: 'SettingsCtrl'
        }).
        when('/logout', {
            title: 'Выход',
            templateUrl: 'partials/login',
            controller: 'LogoutCtrl'
        }).
        otherwise({
            redirectTo: '/home'
        });

    $locationProvider.html5Mode(true);
}).
run(function($rootScope, $http, $location, stopGettingData) {
    VK.init({
        apiId: 3772623
    });
    
    $rootScope.session = false;
    $rootScope.user_list = [];

    $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
        stopGettingData($location);

        $rootScope.uri = $location.path().substring(1);
        
        if (current.$$route.title) {
            $rootScope.title = current.$$route.title;
        }
        else {
            $rootScope.title = 'Мне нравится';
        }
    });

    $rootScope.getSettings = function() {
        var settings = {};
        $http.get('/api/settings/' + $rootScope.session.mid).
            success(function(data) {
                settings = data.settings || {};

                // defaults
                settings.update = settings.update || 15;
                settings.depth = settings.depth || 10;
                $rootScope.settings = settings;
            });

        return settings;
    }

    $rootScope.setSettings = function(settings) {
        $rootScope.settings = settings;
    }

    $rootScope.authInfo = function(response) {
        if (response.session && !$rootScope.session) {
            $rootScope.session = response.session;
            $rootScope.getSettings();

            VK.Api.call('users.get', {fields: 'photo_50'}, function(r) {
                if (r.response) {
                    $rootScope.user = r.response[0];

                    $location.path($location.path() == '/login' ? '/home' : $location.path());
                    $rootScope.$apply();
                }
            });
        }
        else {
            $rootScope.session = false;
        }
    }

    if (!$rootScope.session) {
        VK.Auth.getLoginStatus($rootScope.authInfo);
    }

}).
factory('stopGettingData', function() {
    return function(location) {
        if (location.path().indexOf('get') == -1) {
            stopped = true;
        }
        else {
            stopped = false;
        }
    }
});
