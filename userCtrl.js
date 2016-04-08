angular.module('userCtrl', [])
.controller('userController', function($scope, User){
   $scope.sendPara = function(){

      var parameter = {
        "size": $scope.size,
        "probability": $scope.probability,
        "loopTimes": $scope.loopTimes,
        "algorithm": $scope.algorithm
      };

      var clear = function(){
        $scope.size=null;
        $scope.probability=null;
        $scope.loopTimes=null;
        $scope.algorithm=null;
      };

      //clear the mark
      $scope.mark=null;

      var rate;

      $scope.users = User.query(parameter, function() {
          console.log($scope.users[0]);
          console.log($scope.users[1]);
          if($scope.size == "large") {
             times = 100;
          } else {
             times = 10000;
          }

          var diffStartTime = Date.now();
          switch ($scope.algorithm) {
            case "0":

              for(var i = 0; i<times;i++) {
                var delta = $scope.users[1];
              }
              break;
            case "1":

              for(var i = 0; i<times;i++) {
                 var delta = jsondiffpatch.diff($scope.users[0], $scope.users[1]);
               }
              break;
            case "2":

              for(var i = 0; i<times;i++) {
                var delta = jsonpatch.compare($scope.users[0], $scope.users[1]);
              }
              break;
            case "3":

              // if($scope.size == "large") {
              //   //this algorithem isn't work when the data is large
              //   $scope.mark = 'ko';
              // } else {
                for(var i = 0; i<times;i++) {
                  // var jiff = require('jiff');
                  var delta = jiff.diff($scope.users[0], $scope.users[1], { invertible: false });
                }
              // }
              break;
            case "4":
              //Usage: input in console:  browserify index.js -r changeset >changeset.js
              // if($scope.size == "large") {
              //   //this algorithem isn't work when the data is large
              //   $scope.mark = 'ko';
              // } else {
                for(var i = 0; i<times;i++) {
                  // var jdr = require('json-diff-rfc6902');
                  var delta = jdr.diff($scope.users[0], $scope.users[1]);
                }
              // }
              break;
            case "5":
              //Usage: input in console:  browserify index.js -r changeset >changeset.js
              if($scope.size == "large") {
                //this algorithem isn't work when the data is large
                $scope.mark = 'ko';
              } else {
                for(var i = 0; i<times;i++) {
                  var changeset = require('changeset');
                  var delta = changeset($scope.users[0], $scope.users[1]);
                }
              }
              break;
          }
          var diffEndTime = Date.now();

          if (delta == undefined || $scope.algorithm=="0"){
            rate = 0;
          } else {
            rate = (JSON.stringify(delta).length)/(JSON.stringify($scope.users[0]).length);
          }

          var sendTime = Date.now();

          var transmit = {
            "diffStartTime": diffStartTime,
            "diffEndTime": diffEndTime,
            "sendTime": sendTime,
            "delta": delta,
            "rate": rate
          };

          if(delta == undefined) {
            //if there is no modification
            console.log("patch=0");
          } else {
            console.log("patch="+JSON.stringify(delta).length);
          }

          console.log("old data="+JSON.stringify($scope.users[0]).length);
          console.log("new data="+JSON.stringify($scope.users[1]).length);
          console.log($scope.users[0]);
          console.log($scope.users[1]);

          User.update(transmit, function(res) {
            console.log(res);
            $scope.mark = res[0]+res[1];
            // clear the data
            clear();
          });
      });
   };
});
