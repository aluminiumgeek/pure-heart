'use strict';

var utils = {
    // returns rendered html
    render: function(path, params) {
        var pathToTemplate = require('path').resolve(__dirname, '../../views') + path + '.jade';

        var jade = require('jade');
        var template = require('fs').readFileSync(pathToTemplate, 'utf8');
        var jadeFn = jade.compile(template, {filename: pathToTemplate, pretty: true });

        return jadeFn(params);
    }
}
