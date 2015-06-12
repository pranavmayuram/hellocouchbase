var couchbase = require('couchbase');
var N1qlQuery = require('couchbase').N1qlQuery;

// Connect to Couchbase Server

var cluster = new couchbase.Cluster('127.0.0.1:8091');
var bucket = cluster.openBucket('beer-sample', function(err) {
  if (err) {
    // Failed to make a connection to the Couchbase cluster.
    console.log(err);
  }

  
  // Retrieve a document
  var n1ql=N1qlQuery.fromString('SELECT * FROM `beer-sample` WHERE brewery_id ="alesmith_brewing" AND name="Wee Heavy"');
  bucket.query(n1ql, function(err, result) {
    if (err) {
      // Failed to retrieve key
      console.log(err);
    }
  
  /*bucket.get('aass_brewery-juleol', function(err, result) {
    if (err) {
      // Failed to retrieve key
      throw err;
    } */

    var doc = result;
    console.log(doc);

    // console.log(doc.brewery_id + ', ABV: ' + doc.abv);
    
    // Store a document

    // doc.comment = "Random beer from Norway";

    var n1qlins=N1qlQuery.fromString('INSERT INTO `beer-sample` (KEY, VALUE) VALUES(\"pranavsbeer\", {\"brewery_id\": \"pranavs_famous_brewery\"})');
    bucket.query(n1qlins, function(err, result) {
    if (err) {
      // Failed to retrieve key
      console.log(err);
    }
    /* bucket.replace('aass_brewery-juleol', doc, function(err, result) {
      if (err) {
        // Failed to replace key
        throw err;
      }
    */
      console.log(result);

      // Success!
      process.exit(0);
    });
  });
});