	var express         = require('express');
    var app             = express();                        // create our app w/ express
    var mongoose        = require('mongoose');              // mongoose for couchdb
    var morgan          = require('morgan');                // log requests to the console (express4)
    var bodyParser      = require('body-parser');           // pull information from HTML POST (express4)
    var methodOverride  = require('method-override');       // simulate DELETE and PUT (express4)
    var couchbase       = require('couchbase');
    var N1qlQuery       = require('couchbase').N1qlQuery;
    var myCluster       = new couchbase.Cluster('http://localhost:8091');
    var myBucket        = myCluster.openBucket('ToDoList');

    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());
    myBucket.enableN1ql('http://localhost:8093');

	// function to display all todos
	getAllToDos = function(req, res) {
        var allToDos=N1qlQuery.fromString('SELECT text FROM ToDoList');
        myBucket.query(allToDos, function(err, todos) {
                    if (err) {
                        console.log('error hit in selecting all todos:' + error);
                    }
                    res.json(todos);
                    console.log('success');
        }

    // express call to get all todos when first displaying screen
    app.get('/api/todos', getAllToDos(req, res));

    // express post to insert a todo into the database, then display all todos after the insert
    app.post('/api/todos', function(req, res) {

        // create a todo, information comes from AJAX request from Angular
        // COUCHBASE
        var insertToDo = N1qlQuery.fromString('INSERT INTO ToDoList (KEY, VALUE) VALUES(UUID(),{\"text\" : '+req.body.text+', \"done\": false})');
        myBucket.query(insertToDo, function(err, todo) {
            if (err) {
                console.log("error in inserting todo" + err);
            }
            // get and return all the todos after you create another
            getAllToDos(req, res);
        });
    });

    // express delete, to delete from database; uses some ID to mark each todo in website and
    // in the database. not sure how this works in mongo/if there is a default
    app.delete('/api/todos/:todo_id', function(req, res) {

            // get and return all the todos after you create another
            getAllToDos(req, res);
        });
    });

	// joing the public directory, so that files can be referenced form this location as well.
	// avoids the need to do '/public/filename.js', just do 'filename.js'
    app.use(express.static(__dirname + '/public'));

    // displays the index.html file when one access the site
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    // listen (start app with node cleanup.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");
