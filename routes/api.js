/*
 * Serve JSON to client
 */

var mongo = require('mongodb');
var Server = mongo.Server,
    Db = mongo.Db;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('likedb', server);

db.open(function(err, db) {
    if (!err) {
        console.log('Connected to database');
        
        db.collection('posts', {strict: true}, function(err, collection) {
            if (err) {
            console.log('The posts collection does not exists. Creating it...');

            populateDB();
            }
        });
    }
});

exports.posts = function (req, res) {
    var user_id = parseInt(req.params.user_id);

    db.collection('posts', function(err, collection) {
        collection.find({user_id: user_id}).toArray(function(err, posts) {
            res.json({
                posts: posts
            });
        });
    });
};

exports.addPost = function (req, res) {
    var post = req.body.post;

    db.collection('posts', function(err, collection) {
        collection.save(post, {safe: true}, function(err, res) {});
    });
};

exports.settings = function (req, res) {
    var user_id = parseInt(req.params.user_id);

    db.collection('settings', function(err, collection) {
        collection.findOne({user_id: user_id}, function(err, settings) {
            settings = settings || {};
            
            res.json({
                settings: settings.data
            });
        });
    });
}

exports.saveSettings = function (req, res) {
    var user_id = parseInt(req.params.user_id);
    var data = req.body.settings;

    db.collection('settings', function(err, collection) {                   
        collection.findOne({user_id: user_id}, function(err, settings) {
            settings = settings || {};
            
            settings.user_id = user_id;
            settings.data = data;
            
            collection.save(settings, {safe: true}, function(err, result) {});
        });
    });
}

// Create empty posts collection
var populateDB = function() {
    db.collection('posts', saveEmpty);

    db.collection('settings', saveEmpty);

    var saveEmpty = function(err, collection) {
        collection.save({user_id: 0});
    };
};
