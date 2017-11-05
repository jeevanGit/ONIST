var express = require('express');
var axios = require('axios')
var bodyParser = require('body-parser');
var uuidv1 = require('uuid/v1');

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
app.get('/orgs/:key/members/', function(handlerRequest, handlerResponse) {

  var key = handlerRequest.params.key;
  var body = handlerRequest.body;
  
  var url = redisServer + key + '_member';
  axios.get(url).then(function(response) {
    var reponseData = response.data;
    
    if(reponseData.length != 0) {
      console.log('[Service from Cache] \n' + JSON.stringify(response.data));
      handlerResponse.end(JSON.stringify(response.data));
    } else {
      retrieveSortedRecordFromMongoDb(key, handlerResponse);
    }
    
  }).catch(function(err){
    console.log(err);
    response.end('Cache error' + err);
    if(err) throw err;
  });

});

/**
 *  Not part of the original requirement. Added for convenience and to implement
 *  caching.
 */
app.post('/orgs/:value/members', function(handlerRequest, handlerResponse){

  var value =  handlerRequest.params.value;
  var body = handlerRequest.body;
  

  // Add the identifier
  body['org_name'] = value;
  body['uuid'] = uuidv1;
  var redisUrl = redisServer + value;

  var mongoUrl = mongoServer + 'indexrec/members/uuid/' + value;
  axios.post(mongoUrl, body)
  .then( function(mongoResponse) {

    deleteEntryFromRedis(value);
    handlerResponse.end(mongoResponse.data);
  }).catch(function(err) {
    handlerResponse.end('errored out');
    throw err;
  }); 

});

// app.delete('/:key', function(request, response) {
//   var key = request.params.key;
//   deleteEntryFromRedis(key);
//   deleteEntryFromMongo(key);
// });


function deleteEntryFromRedis(value) {
    // Delete the entry from redis
    var url = redisServer + value + '_member';
    axios.delete(url)
        .catch(function(err) {
            if (err)
                throw err;
        });
}

// function deleteEntryFromMongo(value) {
//   // Delete the entry from redis
//   var url = mongoServer + value;
//   axios.delete(url)
//       .catch(function(err) {
//           if (err)
//               throw err;
//       });
// }

function retrieveSortedRecordFromMongoDb(key, handlerResponse) {
  // Retrieve from Mongo
  var mongoUrl = mongoServer + 'retrieverec/members/org_name/' + key;

  /*
   * Add sort details specific to the question. This is always 
   * hardcoded because the value is never pushed from the user
  */ 
    mongoUrl = mongoUrl + '?sortKey=followers&sortOrder=-1';
    axios.get(mongoUrl)
        .then(function(mongoResponse) {

            // Index into redis for quick retrieval
            var redisUrl =redisServer + key + '_member';
            axios.post(redisUrl, mongoResponse.data)
            .catch(function(err){
              console.log('Cache to redis failed');
              if(err) throw err;
            })

            handlerResponse.end(JSON.stringify(mongoResponse.data));
        }).catch(function(err) {
            handlerResponse.end('errored out');
            throw err;
        });
}

function startMemberServiceServer() {
    app.listen(6000, "0.0.0.0", function(err) {
        if (err)
            throw err;
        console.log('The server started');
    });
}
