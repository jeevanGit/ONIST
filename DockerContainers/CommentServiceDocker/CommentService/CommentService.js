var express = require('express');
var axios = require('axios')
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

// Setting 
// TODO: Hardcoded endpoint should ideally be picked from the configuration server.
var redisServer = 'http://redis.jeevanvarughese.com:80/';
var mongoServer = 'http://mongoservice.jeevanvarughese.com:80/';

startMemberServiceServer();


/**
 *  Retrieve comments from members
 */
app.get('/orgs/:key/comments/', function(handlerRequest, handlerResponse) {

    var key = handlerRequest.params.key;
    var url = redisServer + key + '_comments';
    axios.get(url)
    .then(function(redisResponse){
        if(redisResponse.data.length != 0) {
            console.log('[Serviced from Cache] \n' + JSON.stringify(redisResponse.data));
            handlerResponse.end(JSON.stringify(redisResponse.data));
        } else {
            retrieveCommentsFromMongodb(key, handlerResponse);
        }
        
    })
    .catch(function(err){
        if(err) throw err;
    });

    //retrieveCommentsFromMongodb(key, handlerResponse);

});

/*
    This will automatically update the record if already present.
*/
app.post('/orgs/:key/comments', function(handlerRequest, handlerResponse){

    var key =  handlerRequest.params.key;
    var body = handlerRequest.body;

    // Adding key for mongo search
    body['org_name'] = key;

    // var redisUrl = redisServer + key;

    //Bug 0001: Search and update function incorrect, multiple records added : Resolved 2017-11-04 : Wrong comparison
    var mongoUrl = mongoServer + 'indexrec/comments/org_name/' + key;
    axios.post(mongoUrl, body)
    .then( function(mongoResponse) {
        deleteEntryFromRedis(key);
        handlerResponse.end(mongoResponse.data);
    }).catch(function(err) {
        handlerResponse.end('errored out');
        throw err;
    });

});

function retrieveCommentsFromMongodb(key, handlerResponse) {
    console.log('Dipping into DB for values');
    // Check if the value is present in redis
    var mongoUrl = mongoServer + 'retrieverec/comments/org_name/' + key;
    axios.get(mongoUrl).then(function(response) {
        // Index into redis
        var redisUrl =redisServer + key + '_comments';
        axios.post(redisUrl, response.data)
        .catch(function(err){
          console.log('Cache to redis failed');
          if(err) throw err;
        })

        handlerResponse.end(JSON.stringify(response.data));
    }).catch(function(err) {
        console.log(err);
        response.end('Cache error' + err);
        if (err)
            throw err;
    });
}

function deleteEntryFromRedis(value) {
    // Delete the entry from redis
    var url = redisServer + value + '_comments';
    axios.delete(url)
        .catch(function(err) {
            if (err)
                throw err;
        });
}

function startMemberServiceServer() {
    app.listen(7000, function(err) {
        if (err)
            throw err;
        console.log('The server started');
    });
}

function indexIntoRedis(url, body, callbackFtn) {
  var response = null;
  var err = null;
  axios.post(url,body)
  .then(function(response){
    console.log(response);
    callbackFtn(err, response);
  })
  .catch(function(err){
    console.log(err);
    callbackFtn(err, response);
  });
}