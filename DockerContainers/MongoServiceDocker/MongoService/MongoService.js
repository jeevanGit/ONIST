var mongoclient = require('mongodb').MongoClient;
var express = require('express');
var bodyParser = require('body-parser');
var db = null;


// Express and body parse
var app = express();
app.use(bodyParser.json())


// Major flow
dbConnection();

startServer();

dbCleanupOnExit();

function startServer() {
    app.listen(4000, "0.0.0.0", function(err) {
        if (err)
            throw err;
    });
}

function dbCleanupOnExit() {
    process.on('exit', function(options, err) {
        console.log('Closing all connections');
        db.close();
    });
}

function dbConnection() {
    /*
         Db connection intiailization
    */
    mongoclient.connect('mongodb://mongodb-service:27017/onist', function(err, db) {
        console.log('connection to mongodb://mongodb-service:27017/onist')
        this.membersCollection = db.collection('members');
        this.commentCollection = db.collection('comments');
    });
}


// User defined utilities

/**
 *  Return the selected handler
 */
function returnTheSelectedHandler(collection, callbackftn) {
        
        var selectedCollection = null;
        switch(collection) {
            case 'members':
                selectedCollection = this.membersCollection;
                break;
            case 'comments':
                selectedCollection = this.commentCollection;
                break;
            default:
                response.end('Invalid Collection');
                throw new Error('Invalid Collection');
        }
        callbackftn(selectedCollection);
}


// Request handlers for mongodb service
/**
 *  TODO:
 */
app.get('/retrieverec/:collection/:key/:value', function(request, response) {
    var key = null;
    var value = null;
    var searchKey = {};
    var sortKey = {};
    

    // Query for the keys 
    key = request.params.key;
    value = request.params.value;

    // Check for sort key
    sortKeyVal = request.query.sortKey;
    sortOrder = request.query.sortOrder;
    if( sortKey != null && sortOrder!= null) {
        sortKey[sortKeyVal] = Number.parseInt(sortOrder);
    }

    // Search criteria is mandatory
    if(key == null || value == null)
        response.end('key or value of the query is missing');
    
    // Set the search key
    searchKey[key] = value;

    returnTheSelectedHandler(request.params.collection, function(selectedCollection) {

        // If there is a sort key in the request then the records are sorted
        if(Object.keys(sortKey).length == 0) {
            selectedCollection.find(searchKey).toArray(function(err, results){
                response.end(JSON.stringify(results));
            });
        } else {
            selectedCollection.find(searchKey).sort(sortKey).toArray(function(err, results){
                response.end(JSON.stringify(results));
            });
        }
        
    });
})

/**
 *  This api gives the flexibility of updating known records, or making fresh entry
 */
app.post('/indexrec/:collection/:key?/:value?', function (request, response) {
    var key = null;
    var value = null;
    var searchKey = {};

    // Query for the keys
    key = request.params.key;
    value = request.params.value;


    returnTheSelectedHandler(request.params.collection, function (selectedCollection) {

        // Index body
        var requestBody = request.body;

        if (key == null || value == null) 
            response.end('Unable to update database');
        // if there is a search key, then update the document
        
            searchKey[key] = value;
            console.log(searchKey);
            requestBody['org_name'] = value;

            selectedCollection.find(searchKey).toArray(function (err, results) {
                if (err) {
                    response.end('Error will indexing the record')

                    // Failfast strategy
                    throw err;
                }

                if(results.length == 0) {
                    selectedCollection.insert(requestBody, function(err){
                        if(err) throw err;
                        response.end('Inserted: ' + JSON.stringify(requestBody));
                    });
                } else {
                    console.log('Already present record, updated the record');
                    selectedCollection.update(searchKey, requestBody, function (err) {
                        if (err) console.log(err);
                        response.end('Already present record, updated the record: \n' + JSON.stringify(results));
                    });
                }   
            });
        
    });
})

/**
 *  This will remove all information with respect to an
 *  organisation.
 */
app.delete('/:key', function(request, response){
    //Bug 0002: Delete not working: Resolved 2017-11-04: Update of search key not propogated
    var searchKey = {};
    searchKey['org_name'] = request.params.key;
    console.log(searchKey);
    this.membersCollection.remove(searchKey, function (err) {
        if(err) throw err;
        console.log('Successfully removed records from members collection');
    });
    this.commentCollection.remove(searchKey, function (err) {
        console.log('Successfully removed records from comment collection');
    });
    response.end('Sucessfully removed records');
});

