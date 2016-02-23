'use strict';

var WhitePagesDemoApp = angular.module('WhitePagesDemoApp', ['ngRoute', 'ui.bootstrap','ngSails','uiGmapgoogle-maps']);
WhitePagesDemoApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: '/templates/angular.html',
      controller: 'WPDCtrl'
    }).otherwise({
      redirectTo: '/angular',
      caseInsensitiveMatch: true
    })

  }]);

WhitePagesDemoApp.controller('WPDCtrl', ['$scope', '$rootScope', '$sails','uiGmapGoogleMapApi','$http', function($scope, $rootScope, $sails,uiGmapGoogleMapApi,$http) {

   $scope.map = {};
   $scope.map.center = {};



   $http.get('https://maps.google.com/maps/api/geocode/json?address=98199&sensor=false').success(function(mapData) {
      console.dir(mapData)
      if (mapData.results[0].geometry.location)
      {
        $scope.map.center.latitude =  mapData.results[0].geometry.location.lat;
        $scope.map.center.longitude =  mapData.results[0].geometry.location.lng;
        console.dir($scope.map)
      }
    });


   $scope.map.zoom=9

  $scope.call = {
          countyCode: '--',
          lineType: '--',
          carrier: '--',
          validNumber: '--',
          prepaidNumber: '--',
          callerName: '--',
          address: "--"
        }


  uiGmapGoogleMapApi.then(function(maps) {

    });

  $sails.on("connect",function(msg){

    $sails.get("/call")
      .then(function(resp){

      }, function(resp){

      });
  })

	$sails.get("/call")
      .then(function(resp){


      }, function(resp){

      });


  // Watching for updates
    var callHandler = $sails.on("call", function (message) {
    	console.log("got a socket.io message")

      if (message.verb === "created") {
        $scope.call = message.data;
        $http.get('https://maps.google.com/maps/api/geocode/json?address='+$scope.call.address+'&sensor=false').success(function(mapData) {

          if (mapData.results[0].geometry.location)
          {
            $scope.map.center.latitude =  mapData.results[0].geometry.location.lat;
            $scope.map.center.longitude =  mapData.results[0].geometry.location.lng;
            $scope.map.zoom = 9
          }
        });


      }
    });

}]);
