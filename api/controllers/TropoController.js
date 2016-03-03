/**
 * TropoController
 *
 * @description :: Server-side logic for managing tropo calls
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
// object to hold calls

var gCurrentCalls={}
var WhitePagesAPIKey = sails.config.whitepages.WHITEPAGES_API_KEY;
var tropowebapi = require('tropo-webapi');
var request = require('request');
var changeCase = require('change-case')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
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
          req.calledNumber = callerNumber
            console.log("API key = "+WhitePagesAPIKey)
  		      request.get('https://proapi.whitepages.com/2.1/phone.json?api_key='+WhitePagesAPIKey+'&phone_number='+callerNumber,
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
                  console.log(body)
          				if (jsonBody.results)
          				{
          					    c = jsonBody.results[0]

                    b = c.associated_locations[0];
                    newaddress = b.city + ", "+b.state_code+", "+b.country_code+" "+b.postal_code
                    console.log(newaddress)
                    if (c.belongs_to)
                    {
                      if (c.belongs_to.length)
                        newname =  c.belongs_to[0].name
                      else
                        newname =  'Unknown'

                    }
                    else
                      newname =  'Unknown'

      				    	   calldata = {
      				          		countyCode: '+'+c.country_calling_code,
      				          		lineType:  c.line_type,
      				          		carrier: c.carrier,
      				          		validNumber: c.is_valid  ? 'Yes' : 'No',
      				          		prepaidNumber: c.is_prepaid  ? 'Yes' : 'No',
      				          		callerName: newname,
      				          		address: newaddress

              					}


                        if (c.belongs_to && c.belongs_to[0].type =="Full")
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
  			    tropo.say("Thank you for dialing the Tropo and Whitepages Demo. Your information is now displayed on the screen. If we determine your phone is SMS enabled you will receive a text message shortly.");
  			    var transferSay = new Say("You are now being transfered");
  			    tropo.on("transfer", null, "/transfer", null, transferSay, null, null, null);
  			    tropo.on("hangup", null, "/hangup", null, null, null, null, null);
  			    tropo.on("error", null, "/error", null, null, null, null, null);
  			    tropo.on("incomplete", null, "/incomplete", null, null, null, null, null);
  			    tropo.on("continue", null, "/continue", null, null, null, null, null);
          //  tropo.message("We have extended wait times for voice call support, may we expedite your support by helping you via SMS message? Powered by Whitepages Pro and Tropo",
             // callerNumber, false, null, null, null, 'SMS', null, null, null)
  			   // tropo.say("http://phono.com/audio/holdmusic.mp3", null, null, null, null, null, "transfer");
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
    tropo.message("We have extended wait times for voice call support, may we expedite your support by helping you via SMS message? Powered by Whitepages Pro and Tropo",
       callerNumber, false, null, null, null, 'SMS', null, null, null)
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


