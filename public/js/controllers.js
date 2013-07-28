'use strict';

/* Controllers */

angular.module('pureheart.controllers', []).
  controller('MainCtrl', function($scope, $location) {
    if ($scope.session) {
        $location.path('/home');
    }
    else {
        $location.path('/login');
    }
  }).
  controller('LoginCtrl', function($scope, $location) {
    VK.Auth.getLoginStatus($scope.authInfo);
  
    if ($scope.user) {
        $location.path('/home');
    }
    else {
        $scope.showlogin = true;
    }
 
    $scope.vklogin = function() {
        VK.Auth.login($scope.authInfo);

        $location.path('/home');
    }
   
    $scope.vklogout = function() {
        VK.Auth.logout();
    }
  }).
  controller('LogoutCtrl', function($scope, $rootScope, $location) {
    $rootScope.session = false
    $rootScope.user = false;
    $rootScope.user_list = [];

    VK.Auth.logout(function() {
        window.location.href = '/login';
    }); 
    
    //$location.path('/login');
  }).
  controller('HomeCtrl', function($scope, $rootScope, $location) {
    if ($scope.session) {
        var fields = 'screen_name,city,country,photo_50,photo_100,photo_200,online';
        var params = {
            fields: fields,
        };

        // retrieve friends list first time
        if ($scope.user_list.length == 0) {
            VK.Api.call('friends.get', params, function(r) {
                if (r.response) {
                    var user_list = [];
                    r.response.map(function(user) {
                        user.photo = user.photo_200 || user.photo_100;

                        user_list.push(user);
                    });
                    
                    setTimeout(
                        function() {
                            $rootScope.user_list = user_list;
                    
                            $scope.$apply();
                        },
                        200
                    );
                }
            });
        }
    }
    else {
        $location.path('/login');
    }
  }).
  controller('GetCtrl', function($scope, $http, $routeParams, $location) {
    if ($scope.session) {
        $scope.posts = [];
        $scope.showProgress = true;

        var uid = $routeParams.user_id;

        // user info
        var user_params = {
            uids: uid,
            fields: 'photo_50',
            name_case: 'dat'
        }
        VK.Api.call('users.get', user_params, function(r) {
            if (r.response) {
                $scope.first_name = r.response[0].first_name;
                $scope.last_name = r.response[0].last_name;
                $scope.img = r.response[0].photo_50;
                
                $scope.$apply();
            }
        });

        // get saved posts
        $http.get('/api/posts/' + uid).
            success(function(data) {
                setTimeout(
                    function() {
                        $scope.posts = data.posts;

                        $scope.getPosts();
                    },
                    200
                );
            });

        // method saves new posts
        $scope.savePost = function(post) {
            var data = {
                post: post
            };
            $http.post('/api/post', data).
                success(function() {
                });
        }

        // check content height of post block
        $scope.showMore = function(post) {
            var id = 'p' + post.from_id + '_' + post.id;
            var blocks = ['h', 't', 'a'];
            var totalHeight = 0;
            
            blocks.map(function(b) {
                var b_id = b + id;
                totalHeight += document.getElementById(b_id).offsetHeight;
            });

            return totalHeight > 250 - 10;
        }
        
        $scope.closeProgress = function() {
            $scope.showProgress = false;
        }

        // get user's subscription and its posts
        $scope.getPosts = function() {

            $scope.iterFull = 0;
            $scope.percent = 0;
            $scope.showProgress = true;
            $scope.finished = false;

            var params = {
                uid: uid,
                extended: 1
            };
        
            // get user groups
            VK.Api.call('users.getSubscriptions', params, function(r) {
                if (r.response) {
                    var groups = [];
                    r.response.map(function(item) {
                        if (item.gid) {
                            groups.push(item);
                        }
                    });

                    vkUtils.groupsWallGet($scope, groups, uid, 0);
                }
            });
        }

        $scope.$watch('iterFull', function() {
            $scope.percent = $scope.iterFull * 100 / $scope.settings.depth / $scope.cnt;
        });

        $scope.$watch('finished', function() {
            if ($scope.finished) {
                $scope.percent = 100;
            }
        });

    }
    else {
        $location.path('/login');
    }
  }).
  controller('SettingsCtrl', function($scope, $http, $location) {
    if ($scope.session) {
        // I don't get ngOptions expressions, sorry for this bullshit
        $scope.updates = {
            10: 10,
            15: 15,
            30: 30,
            60: 60
        };
        $scope.depths = {
            10: 10,
            15: 15, 
            30: 30,
            50: 50
        };

        $scope.data = {
            update: $scope.settings.update,
            depth: $scope.settings.depth
        }

        // method saves settings
        $scope.saveSettings = function(post) {
            $scope.setSettings($scope.data);

            var params = {
                settings: $scope.data
            };
            $http.put('/api/settings/' + $scope.session.mid, params).
                success(function() {
                });

            $scope.saved = true;
        }

        $scope.saved = true;
        
        $scope.changed = function() {
            $scope.saved = false;
        }

    }
    else {
        $location.path('/login');
    }
  });

