var eastridge = window.eastridge || {};
eastridge.theApp = angular.module('theApp', ['ngRoute']);

eastridge.theApp.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/', {
                    templateUrl: 'app/js/home/home.html',
                    controller: 'HomeController'
                }).
                otherwise({
                    redirectTo: '/'
                });
        }]);