var stopped;

function groupsWallGet($scope, groups, uid, i) {
    $scope.cnt = groups.length;
    $scope.iter = i + 1;

    if (i < groups.length && !stopped) {
        var group = groups[i];
        
        params = {
            owner_id: -group.gid,
            filter: 'all',
            count: $scope.settings.depth
        }
        
        // get group posts
        VK.Api.call('wall.get', params, function(result) {
             if (result.response) {
                //$scope.$apply();

                likesChecker($scope, result.response, uid, 0, i, groups);
            }
        });
    }
    else {
        $scope.finished = true;

        $scope.$apply();
    }
}

function likesChecker($scope, posts, uid, i, parentIndex, parentCollection) {
    if (i < posts.length - 1 && !stopped) {
        var post = posts[i+1];
        
        if (post.id) {
            params = {
                type: 'post',
                owner_id: post.from_id,
                item_id: post.id,
                friends_only: 1
            }
            uid = parseInt(uid);

            // check post liked by user
            VK.Api.call('likes.getList', params, function(liked) {
                if (liked.response && liked.response.count && liked.response.users.indexOf(parseInt(uid)) != -1) {
                    var isOld = false;
                    $scope.posts.map(function(p) {
                        if (p.id == post.id && p.from_id == post.from_id && p.user_id == uid)
                            isOld = true;
                    });

                    if (!isOld) {
                        post.text = post.text.replace(/\[([^|]*)\|(.*)\]/, "<a href='http://vk.com/$1' target='_blank'>$2</a>");

                        $scope.posts.unshift(post);
                        $scope.$apply();

                        var group = parentCollection[parentIndex];
                        post.source = group;
                        post.user_id = uid;
                        $scope.savePost(post);
                    }
                }
                
                setTimeout(
                    function() {
                        $scope.iterFull++;
                        $scope.$apply();

                        var index = i + 1;
                        likesChecker($scope, posts, uid, index, parentIndex, parentCollection)
                    },
                    250
                ); 
            });            
        }
    }
    else {
        parentIndex++;
        groupsWallGet($scope, parentCollection, uid, parentIndex);
    }
}

