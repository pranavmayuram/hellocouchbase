    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var mongoose = require('mongoose');                     // mongoose for couchdb
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var couchbase = require('couchbase');
    var myCluster = new couchbase.Cluster('localhost:8091');
    var myBucket = myCluster.openBucket('ToDoList');
    myBucket.enableN1ql('http://localhost:8093/');
    var N1qlQuery = require('couchbase').N1qlQuery;
    var query = N1qlQuery.fromString('SELECT * FROM ToDoList'); // example for query structure later to send

    // configuration =================

    // mongoose.connect('mongodb://node:nodeuser@mongo.onmodulus.net:27017/uwO3mypu');     // connect to mongoDB database on modulus.io

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());

    /*var Todo = mongoose.model('Todo', {
        text : String
    }); */

    // routes ======================================================================

    // api ---------------------------------------------------------------------
    // get all todos

    //COUCHBASE
    app.get('/api/todos', function(req, res) {
        var allToDos=N1qlQuery.fromString('SELECT text FROM ToDoList');
        myBucket.query(allToDos, function(err, todos) {
                    if (err) {
                        console.log('error hit');
                        res.send(err);
                    }
                    res.json(todos);
                    console.log('success');
        });
    });
    
    //mongo
/*
    app.get('/api/todos', function(req, res) {

        // use mongoose to get all todos in the database
        Todo.find(function(err, todos) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(todos); // return all todos in JSON format
        });
    });
*/

    // create todo and send back all todos after creation
    app.post('/api/todos', function(req, res) {

        // create a todo, information comes from AJAX request from Angular
        // COUCHBASE
        var insertToDo = N1qlQuery.fromString('INSERT INTO ToDoList (KEY, VALUE) VALUES("query1034",{"text" : '+req.body.text+", \"done\": "+false+ "})");
        myBucket.query(insertToDo, function(err, todo) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
            var allToDos=N1qlQuery.fromString('SELECT text FROM ToDoList')
            myBucket.query(allToDos, function(err, todos) {
                if (err)
                    res.send(err)
                res.json(todos);
            });
            //res.json({ });
        });
    });
/*
        // mongo
        Todo.create({
            text : req.body.text,
            done : false
        }, function(err, todo) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
            Todo.find(function(err, todos) {
                if (err)
                    res.send(err)
                res.json(todos);
            });
        });

    });

    // delete a todo
    app.delete('/api/todos/:todo_id', function(req, res) {
        Todo.remove({
            _id : req.params.todo_id
        }, function(err, todo) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
            Todo.find(function(err, todos) {
                if (err)
                    res.send(err)
                res.json(todos);
            });
        });
    });
*/

    // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });


    // listen (start app with node server.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");