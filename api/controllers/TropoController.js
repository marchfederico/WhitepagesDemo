/**
 * TropoController
 *
 * @description :: Server-side logic for managing tropo calls
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
// object to hold calls
var gCurrentCalls={}

var tropowebapi = require('tropo-webapi');
var request = require('request');
var changeCase = require('change-case')

module.exports = {

	handleCall: function (req, res) {

		    console.log("new post!")
    		console.dir(req.body,null,2)
		    console.log("--------------")

		    var sessionId

        if (req.body.session)
            sessionId = req.body.session.id
        var callerNumber

        if (sessionId) {
		        callerNumber = req.body.session.from.id
        }
		    if (callerNumber)
		    {
  		      request.get('https://proapi.whitepages.com/2.1/phone.json?api_key=916810dafa2f897e53540ecefb2b07f8&phone_number='+callerNumber,
  		    	function (error, response, body) {
          				//Check for error
          				if(error){
              				return console.log('Error:', error);
         					 }

          				//Check for right status code
          				if(response.statusCode !== 200){
              					return console.log('Invalid Status Code Returned:', response.statusCode);
          				}

          				jsonBody = JSON.parse(body)
          				if (jsonBody.results)
          				{
          					    c = jsonBody.results[0]
                        b = c.best_location;

      				    	   calldata = {
      				          		countyCode: '+'+c.country_calling_code,
      				          		lineType:  c.line_type,
      				          		carrier: c.carrier,
      				          		validNumber: c.is_valid  ? 'Yes' : 'No',
      				          		prepaidNumber: c.is_prepaid  ? 'Yes' : 'No',
      				          		callerName: c.belongs_to[0] ? c.belongs_to[0].name : 'Unknown',
      				          		address: b.address

              					}


                        if (c.belongs_to[0] && c.belongs_to[0].type =="Full")
                          calldata.callerName = c.belongs_to[0].names[0].first_name+' '+c.belongs_to[0].names[0].last_name

      						   	  Call.create(calldata).exec(function(err, call) {
      				      				if(err) throw err;
      				      				Call.publishCreate(call)
      				    		  });
      					   }
  			     });

			   }

		    if (sessionId)
		    {
  		    	gCurrentCalls[sessionId] = req.body.session
  		    	gCurrentCalls[sessionId].state = 'ANSWERED'


  			    var tropo = new tropowebapi.TropoWebAPI();
  			    tropo.say("Welcome to the White Pages and Troh poh Demo,, please hold");
  			    var transferSay = new Say("You are now being transfered");
  			    tropo.on("transfer", null, "/transfer", null, transferSay, null, null, null);
  			    tropo.on("hangup", null, "/hangup", null, null, null, null, null);
  			    tropo.on("error", null, "/error", null, null, null, null, null);
  			    tropo.on("incomplete", null, "/incomplete", null, null, null, null, null);
  			    tropo.on("continue", null, "/continue", null, null, null, null, null);

  			    tropo.say("http://phono.com/audio/holdmusic.mp3", null, null, null, null, null, "transfer");
  			    res.writeHead(200, {'Content-Type': 'application/json'});
  			    console.log("Sending: \n\n"+tropowebapi.TropoJSON(tropo)+"\n\n")
  			    return res.end(tropowebapi.TropoJSON(tropo));
  			 }
			  else
    		{
      			return res.end('test')
    		}

	},

	onTransfer: function (req, res) {
	    sessionId = req.body.result.sessionId
    	number = gCurrentCalls[sessionId].transferNumber
    	from = gCurrentCalls[sessionId].from.id
    	if (number)
    	{
    		console.log("new incoming call post!")
  			console.dir(req.body,null,2)
      		var tropo = new tropowebapi.TropoWebAPI();
       		var ringSay = new Say("http://www.beepzoid.com/ringtones/School-Phone.mp3");
       		var onRing = new On("ring", null, null, null, ringSay, null, null, null);
      		tropo.on("hangup", null, "/hangup", null, null, null, null, null);
      		tropo.on("error", null, "/error", null, null, null, null, null);
      		tropo.on("incomplete", null, "/incomplete", null, null, null, null, null);
      		tropo.on("continue", null, "/continue", null, null, null, null, null);
      		tropo.transfer(number,null,null,from,null,null,onRing)
      		res.writeHead(200, {'Content-Type': 'application/json'});
      		console.log("Sending: \n\n"+tropowebapi.TropoJSON(tropo)+"\n\n")
      		return res.end(tropowebapi.TropoJSON(tropo));
    	}
    	else
    	{
      		return res.end('')
    	}

  },
	onContinue: function (req, res) {
			console.log("new continue post!")
    		console.dir(req.body,null,2)
		    var tropo = new tropowebapi.TropoWebAPI();
		    var transferSay = new Say("You are now being transfered");
		    tropo.on("transfer", null, "/transfer", null, transferSay, null, null, null);
		    tropo.on("hangup", null, "/hangup", null, null, null, null, null);
		    tropo.on("error", null, "/error", null, null, null, null, null);
		    tropo.on("incomplete", null, "/incomplete", null, null, null, null, null);
		    tropo.on("continue", null, "/continue", null, null, null, null, null);
		    tropo.say("http://phono.com/audio/holdmusic.mp3", null, null, null, null, null, "transfer");
		    res.writeHead(200, {'Content-Type': 'application/json'});
		    console.log("Sending: \n\n"+tropowebapi.TropoJSON(tropo)+"\n\n")
		    return res.end(tropowebapi.TropoJSON(tropo));

  },
  onHangup: function (req, res) {
    	console.log("new hagup post!")
  		console.dir(req.body,null,2)
  	    sessionId = req.body.result.sessionId
  		if (gCurrentCalls[sessionId]) {
    		delete gCurrentCalls[sessionId]
  		}
  		return res.end('')
  },
  onIncomplete: function (req, res) {
    	console.log("new hagup post!")
  		console.dir(req.body,null,2)
  	    sessionId = req.body.result.sessionId
  		if (gCurrentCalls[sessionId]) {
    		delete gCurrentCalls[sessionId]
  		}
  		return res.end('')
  },
  onError: function (req, res) {
    	console.log("new hagup post!")
  		console.dir(req.body,null,2)
  	    sessionId = req.body.result.sessionId
  		if (gCurrentCalls[sessionId]) {
    		delete gCurrentCalls[sessionId]
  		}
  		return res.end('')
  },

};


