var app = require('express')();
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/lrs';

app.get('/reports/per_course', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
            return;
        }

        var options = [];

        if (req.query.$gte && req.query.$lt) {
            options.push({ $match: { 'timestamp': { $gte: req.query.$gte, $lt: req.query.$lt } } });
        }

        options.push({ $match: { 'object.id': { $not: /localhost/ } } });
        options.push({ $match: { 'object.id': { $not: /staging/ } } });
        options.push({ $match: { 'object.id': { $not: /branches/ } } });
        options.push({ $group: { _id: { courseId: '$context.extensions.http://easygenerator/expapi/course/id' }, count: { $sum: 1 } } });
        options.push({ $sort: { count: -1 } });

        db.collection('statements').aggregate(options, function (err, data) {
            if (err) {
                res.status(500).send('Internal server error');
                console.log(err);
                return;
            }

            var result = '';
            data.forEach(function (r) {
                result += r.count + ' ' + r._id.courseId + ' ' + '\n';
            });
            res.end(result);
            db.close();
        });

    });

});

app.get('/reports/per_course_per_user', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
            return;
        }

        var options = [];

        if (req.query.$gte && req.query.$lt) {
            options.push({ $match: { 'timestamp': { $gte: req.query.$gte, $lt: req.query.$lt } } });
        }

        options.push({ $match: { 'object.id': { $not: /localhost/ } } });
        options.push({ $match: { 'object.id': { $not: /staging/ } } });
        options.push({ $match: { 'object.id': { $not: /branches/ } } });
        options.push({ $group: { _id: { courseId: '$context.extensions.http://easygenerator/expapi/course/id', userId: '$actor.mbox' }, count: { $sum: 1 } } });
        options.push({ $sort: { count: -1 } });

        db.collection('statements').aggregate(options, function (err, data) {
            if (err) {
                res.status(500).send('Internal server error');
                console.log(err);
                return;
            }

            var result = '';
            data.forEach(function (r) {
                result += + r.count + ' ' + r._id.courseId + ' ' + r._id.userId + '\n';
            });
            res.end(result);
            db.close();
        });

    });

});

var server = app.listen(process.env.port || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});