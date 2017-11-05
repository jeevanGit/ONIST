var express = require('express');
var Redis = require('ioredis');
var bodyparser = require('body-parser');

var app = express();
app.use(bodyparser.json());

var redis = new Redis(6379);

// Script Initialization and cleanup flow 
startServer();

shutDownAndCleanup();


//Handlers
app.get('/:key', function(request, response) {
    
    redis.get(request.params.key, function(err, results) {
        response.end(results);
    });
});

app.post('/:key', function(request, response){
    var value = request.body;
    var errorResponse = {};
    redis.set(request.params.key, JSON.stringify(value), function(err){
        if(err) {
            errorResponse['status'] = 'failed';
            response.end(JSON.stringify(errorResponse))
            throw err;
        }

        response.end(JSON.stringify(value));
    });
});

app.delete('/:key', function(request, response) {
    var key = request.params.key;
    redis.del(key, function(err){
        if (err) throw err;
        response.end('Deleted');
    });
});


// User defined functions
function startServer() {
    app.listen (5000, "0.0.0.0", function(err) {
        if (err) throw err;
    })
};

function shutDownAndCleanup() {
    process.on('exit', function(err){
        redis.quit();
    } )
};