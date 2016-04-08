var jsondiffpatch = require('jsondiffpatch'),
    jsonpatch = require('fast-json-patch'),
    jiff = require('jiff'),
	fuzzer = require('fuzzer'),
	Mock = require('mockjs'),
	fs = require('fs'),
    changeSet = require('changeset'),
    jdr = require('json-diff-rfc6902'),
	users = [];
var test = require('unit.js');
var assert = test.assert;
var grammar, size, probability, algorithm;
var comparedData, copyTime;
var times;

var smallGrammar = {
    'father|1': [{
     'id|+1': 1,
         "married|1" : true,
         "name" : "@FIRST @LAST",
     "sons" : null,
     "daughters|1" : [
         {
          "age|0-31" : 0,
          "name" : "@FIRST"
         }
     ]
    }],

    'string|1-10': '*'
};


var mediumGrammar = {
    'father|65': [{
     'id|+1': 1,
         "married|1" : true,
         "name" : "@FIRST @LAST",
     "sons" : null,
     "daughters|3" : [
         {
          "age|0-31" : 0,
          "name" : "@FIRST"
         }
     ]
    }],

    'string|1-10': '*'
};

var largeGrammar = {
    // 'father|6410': [{
    'father|2000': [{
     'id|+1': 1,
         "married|1" : true,
         "name" : "@FIRST @LAST",
     "sons" : null,
     "daughters|3" : [
         {
          "age|0-31" : 0,
          "name" : "@FIRST"
         }
     ]
    }],

    'string|1-10': '*'
};

exports.findUser = function(req, res){
	console.log(req.query);

    algorithm = req.query.algorithm;

    //according to the same size and same probability, different algorithms, the old data and new data are the same.
    if(size != req.query.size ) {

        size = req.query.size;
        switch (size) {
        case "small": grammar = smallGrammar; break;
        case "medium": grammar = mediumGrammar; break;
        case "large": grammar = largeGrammar; break;
        }

        users[1] = Mock.mock(grammar);                   //1:modified data
        users[0] = JSON.parse(JSON.stringify(users[1])); //0:origin data
    }

    //according to the same size and different probalility, same altorithm, the old data is the same.
    if (probability != req.query.probability) {

            probability = req.query.probability;

            fuzzer.seed(41);

            //set the probability to change the node
            fuzzer.changeChance(probability);

            // mutate JSON Object
            users[1] = JSON.parse(JSON.stringify(users[0])); //0:origin data
            var generator = fuzzer.mutate.object(users[1]);

            // tranverse it
            generator();

    }

    //use the comparedData to copy the origin data
    comparedData = JSON.parse(JSON.stringify(users[0]));

    console.log("old data: "+JSON.stringify(users[0]).length);
    console.log("new data: "+JSON.stringify(users[1]).length);
    // fs.writeFile('./old-'+size+'-P'+probability+'-A'+algorithm+'.json', JSON.stringify(users[0], null, 1), function(err){
    //     if(err) throw err;
    // });
    // fs.writeFile('./new-'+size+'-P'+probability+'-A'+algorithm+'.json', JSON.stringify(users[1], null, 1), function(err){
    //     if(err) throw err;
    // });
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

    if(size == "large") {
        times = 100;
    } else {
        times = 10000;
    }

    if (delta != undefined) {
        var deltaSize = JSON.stringify(delta).length;
    } else {
        var deltaSize = 0;
    }

    var copyStartTime = Date.now();
    for(var i =0;i<times;i++) {
        comparedData = JSON.parse(JSON.stringify(users[0]));
    }
    var copyEndTime = Date.now();

    copyTime = copyEndTime - copyStartTime;

    console.log("PATCHSIZE: "+deltaSize);

    var patchStartTime = Date.now();

    switch (algorithm) {
    	case "0":
            //
    		break;
    	case "1":
            for (var i=0; i<times;i++) {
                comparedData = JSON.parse(JSON.stringify(users[0]));
                jsondiffpatch.patch(comparedData, delta);
            }
    		break;
        case "2":
            for (var i=0; i<times;i++) {
                comparedData = JSON.parse(JSON.stringify(users[0]));
                jsonpatch.apply(comparedData, delta);
            }
            break;
        case "3":
            // if(size != "large") {
                for (var i=0; i<times;i++) {
                    comparedData = JSON.parse(JSON.stringify(users[0]));
                    comparedData = jiff.patch(delta, comparedData, { invertible: false });
                }
            // }
            break;
        case "4":
            // if(size != "large") {
                for (var i=0; i<times;i++) {
                comparedData = JSON.parse(JSON.stringify(users[0]));
                comparedData = jdr.apply(comparedData, delta);
                }
            // }
            break;
        case "5":
            if(size != "large") {
                for (var i=0; i<times;i++) {
                comparedData = JSON.parse(JSON.stringify(users[0]));
                comparedData = changeSet.apply(delta, comparedData);
                }
            }
            break;
    }

	var patchEndTime = Date.now();

    console.log("Diff time: "+ (diffEndTime - diffStartTime));
    console.log("Apply time: "+ (patchEndTime - patchStartTime));

    writeCSV();
    res.send("ok");

    function writeCSV () {

        var totalTime = (diffEndTime - diffStartTime) + (receiveTime - sendTime) + (patchEndTime - patchStartTime);

        if(algorithm == "0") {
            var result = '0,' +deltaSize +',0,'+rate +','+JSON.stringify(users[0]).length+'\n';
        } else {
            var result = (diffEndTime - diffStartTime)+',' + deltaSize +',' +(patchEndTime - patchStartTime - copyTime)+','+rate
        +','+JSON.stringify(users[0]).length+ '\n';
        }


        fs.writeFile('./result/'+size+'-P'+probability+'-A'+algorithm+'.csv', result, {flag: 'a'}, function(err){
            if(err) throw err;
            console.log("success");
        });

    }

}
