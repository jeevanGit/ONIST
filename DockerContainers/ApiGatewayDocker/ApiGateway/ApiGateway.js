var express = require('express');
var http = require('http');
var app = express();
var axios = require('axios');

// Request setting
var requestOptions = {
    host: '',
    port: '',
    method: '',
    path: ''
}

var mongoServer = 'http://mongoservice.jeevanvarughese.com:80/';
var redisServer = 'http://redis.jeevanvarughese.com:80/';


/*
    Delegate all the member related request to member service
*/
app.all('*/members', function(incomingRequest, outgoingResponse){

    // Set the options -- TODO: Move this to configuration server
    requestOptions.method = incomingRequest.method;
    requestOptions.path = incomingRequest.path;
    requestOptions.port = 6000;
    requestOptions.host = 'memservice-service'

    // Delegate all the member request to MemberService
    
    var request = http.request(requestOptions, function(response){
        var consolidatedData = '';

        // Encode in UTF-8
        response.setEncoding('utf8');

        // Consolidated Data
        response.on('data', function (data) {
          consolidatedData += data;
        });

        response.on('end', function() {
            outgoingResponse.end(consolidatedData);
        })
    });

    request.write(''); 
    request.end();
})

/**
 * Delegate everything to MemberService
 */
app.all('*/comments', function(incomingRequest, outgoingResponse){
    
        // Set the options -- TODO: Move this to configuration server
        requestOptions.method = incomingRequest.method;
        requestOptions.path = incomingRequest.path;
        requestOptions.port = 7000;
        requestOptions.host = 'comservice-service'
    
        console.log(incomingRequest.path);
        // Delegate all the member request to MemberService
        
        var request = http.request(requestOptions, function(response){
            var consolidatedData = '';
    
            // Encode in UTF-8
            response.setEncoding('utf8');
    
            // Consolidated Data
            response.on('data', function (data) {
              consolidatedData += data;
            });
    
            response.on('end', function() {
                outgoingResponse.end(consolidatedData);
            })
        });
    
        request.write(''); 
        request.end();
})

app.delete('/orgs/:key', function(request, response){
    var key = request.params.key;
    axios.delete(redisServer + key + '_member')
    .catch(function(err){
        if(err) throw err;
    });

    axios.delete(redisServer + key + '_comments')
    .catch(function(err){
        if(err) throw err;
    });

    axios.delete(mongoServer + key)
    .catch(function(err){
        if(err) throw err;
    });

    response.end('Deleted all the entries for organisation [Redis and MongoDb]');

});

// Start server
app.listen(2999, function(err){
    if (err) return err;
    console.log('Server Started');
});

// Utility functions
