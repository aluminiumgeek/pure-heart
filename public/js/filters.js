'use strict';

/* Filters */

angular.module('pureheart.filters', []).
    filter('dictKeys', function() {
      return function (dict) {
          var sorted = [];

          for (var key in dict) {
              sorted.push(key);
          }
          sorted.sort();

        return sorted;
      }
    });
