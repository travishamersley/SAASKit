﻿'use strict';

define(['controllers/controllers', 'services/userservice'],
  function (controllers) {
      
      controllers.controller('EditUserController', ['$scope', '$rootScope', 'UserService', '$routeParams', 
          
        function ($scope, $rootScope, UserService, $routeParams) {
            
            function updateFullName() {
                var fullName = '';
                if ($scope.user.firstName || $scope.user.lastName) {
                    fullName = $scope.user.firstName + " " + $scope.user.lastName;
                }

                $scope.fullName = fullName;
            }
            
            function completeOperation(operationId, func) {
                return function (data) {
                    $rootScope.$broadcast('completeOperation', { id: operationId });
                    func(data);
                };
            }
            
            function startsOperation(event, func) {
                return function () {
                    $rootScope.isUpdating = true;
                    var operationId = new Date();
                    $rootScope.$broadcast('startOperation', { id: operationId, entityId: '/user/' + $scope.userId, event: event });
                    func().success(completeOperation(operationId, updateComplete))
                        .error(completeOperation(operationId, updateError));
                };
            }
            
            function updateComplete(data) {
                loadUserToUI(data ? data : $scope.user);
            }

            function updateError() {
                $rootScope.isUpdating = false;
            }
            
            function loadUserToUI(updatedUser) {
                $scope.lastSavedUser = $.extend(true, {}, updatedUser);
                $scope.user = updatedUser;
                $scope.isChanged = false;
                $rootScope.isUpdating = false;

                $scope.$watch('user.firstName', updateFullName);
                $scope.$watch('user.lastName', updateFullName);
                $scope.$watch('user', updateChanged, true);
            }

            function updateChanged() {
                var count = 0;
                if ($scope.lastSavedUser) {
                    for (var key in $scope.lastSavedUser) {
                        if (!($scope.user && $scope.lastSavedUser && $scope.user[key] === $scope.lastSavedUser[key])) {
                            count++;
                        }
                    }
                }

                $scope.isChanged = count > 0;
                $scope.changeCount = count;
            }
            
            // properties
            $scope.userId = $routeParams.userId;
            $scope.isChanged = false;
            $scope.changeCount = 0;
            $rootScope.isUpdating = true;
            $scope.user = UserService.getUserResource().get({ id: $scope.userId }, updateComplete);
            
            // behaviours
            $scope.lock = startsOperation('userProfileLock', function () { return UserService.lock($scope.userId); });
            $scope.unlock = startsOperation('userProfileUnlock', function () { return UserService.unlock($scope.userId); });
            $scope.activate = startsOperation('userProfileActivate', function () { return UserService.activate($scope.userId); });
            $scope.deactivate = startsOperation('userProfileDeactivate', function () { return UserService.deactivate($scope.userId); });
            $scope.update = startsOperation('userProfileUpdate', function () { return UserService.save($scope.userId, $scope.user); });
        }]);
  });

