var jsondiffpatch = require('jsondiffpatch'),
    jsonpatch = require('fast-json-patch'),
    jiff = require('jiff'),
	fuzzer = require('fuzzer'),
	Mock = require('mockjs'),
	fs = require('fs'),
    changeSet = require('changeset'),
    diffjson = require('diff-json');
	users = [];
var test = require('unit.js');
var assert = test.assert;
var grammar, size, probability, algorithm;
var comparedData;  

var smallGrammar = {
    'father|1-1': [{
	 'id|+1': 1,
         "married|1" : true,
         "name" : "@FIRST @LAST",
	 "sons" : null,
	 "daughters|3-3" : [ 
	     { 
		  "age|0-31" : 0,
		  "name" : "@FIRST"
	     }
	 ]
    }],

    'string|1-10': '*'
};


var mediumGrammar = {
    'father|20-20': [{
	 'id|+1': 1,
         "married|1" : true,
         "name" : "@FIRST @LAST",
	 "sons" : null,
	 "daughters|3-3" : [ 
	     { 
		  "age|0-31" : 0,
		  "name" : "@FIRST"
	     }
	 ]
    }],

    'string|1-10': '*'
};

var largeGrammar = {
    'father|10000-10000': [{
	 'id|+1': 1,
         "married|1" : true,
         "name" : "@FIRST @LAST",
	 "sons" : null,
	 "daughters|3-3" : [ 
	     { 
		  "age|0-31" : 0,
		  "name" : "@FIRST"
	     }
	 ]
    }],

    'string|1-10': '*'
};

exports.findUser = function(req, res){
	console.log("==========================");
	console.log(req.query);
    algorithm = req.query.algorithm;

    if(size != req.query.size || probability != req.query.probability) {
        
        size = req.query.size;
        probability = req.query.probability;

        console.log(req.query.algorithm);
        console.log(req.query.size);
        console.log(req.query.probability);
    
    
        switch (size) {
        case "small": grammar = smallGrammar; break;
        case "medium": grammar = mediumGrammar; break;
        case "large": grammar = largeGrammar; break;
        }

        users[1] = Mock.mock(grammar);                   //1:modified data
        users[0] = JSON.parse(JSON.stringify(users[1])); //0:origin data

        fuzzer.seed(41);
        
        //set the probability to change the node
        fuzzer.changeChance(probability);

        // mutate JSON Object
        var generator = fuzzer.mutate.object(users[1]);
        
        // tranverse it 
        generator();  
    } 
    
    //use the comparedData to copy the origin data
    comparedData = JSON.parse(JSON.stringify(users[0]));

    console.log(JSON.stringify(users[1]).length);
	res.send(users);
}

exports.updateUser = function(req, res){
	console.log("----------------------------");
	
	var receiveTime = Date.now();
    
    var diffStartTime = req.body.diffStartTime;
    var diffEndTime = req.body.diffEndTime;
    var sendTime = req.body.sendTime;   
    var delta = req.body.delta;
	var rate = req.body.rate;
    console.log(rate);
  	var patchStartTime ;          
    var patchEndTime ;
 
    patchStartTime = Date.now();

    switch (algorithm) {
    	case "0":
    	    comparedData = delta;
    		break;
    	case "1":
	    	jsondiffpatch.patch(comparedData, delta);
    		break;
        case "2":
            jsonpatch.apply(comparedData, delta);
            break;
        case "3":
            comparedData = jiff.patch(delta, comparedData);
            break;
        case "4":
            comparedData = changeSet.apply(delta, comparedData);
            break;
        case "5":
            comparedData = diffjson.applyChanges(comparedData, delta);
            break;
    }

	patchEndTime = Date.now();
    
    //assert the data is the same
    var flag = false;
    console.log(JSON.stringify(users[1]).length);
    console.log(JSON.stringify(comparedData).length);
    var err = test.error(function() {
        //assert the data
   	    assert.equal(JSON.stringify(comparedData), JSON.stringify(users[1]));
   	    //set the flag
        flag = true;
   	    throw new Error('OK!');
    });
    
    if(flag) {
    	//the two data is the same
        writeCSV();
        res.send("ok");
    } else {
    	//the two data is not the same
        res.send("ko");
    }

    function writeCSV () {

        var totalTime = (diffEndTime - diffStartTime) + (receiveTime - sendTime) + (patchEndTime - patchStartTime);

        var result = (diffEndTime - diffStartTime)+',' +(receiveTime - sendTime) +',' +(patchEndTime - patchStartTime)+ ','+totalTime+','+rate+ '\n';

        fs.writeFile('./result/'+size+'-P'+probability+'-A'+algorithm+'.csv', result, {flag: 'a'}, function(err){
            if(err) throw err;
            console.log("success");
        });

    }

}


