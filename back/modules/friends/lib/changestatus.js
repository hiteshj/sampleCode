/**
 * Lib
 */
var common_function = require('./function');

//
module.exports.changestatus = function(event, cb) {
  var access_token = event.access_token;
  if (typeof access_token == "undefined" || access_token == "") {
    var response = {"error":"Authenticaton failed"};
    return cb(null, response);
  }
  else{
    var workout = event.workout;
    var friendId = event.friendId;
    var changestatus = event.changestatus;
    var error = 0;
    var arr_error = new Array();
    if (typeof workout == "undefined" || workout == "") {
      error = 1;
      arr_error.push('workout');
    }
    if (typeof friendId == "undefined" || friendId == "") {
      error = 1;
      arr_error.push('friendId');
    }
    if (typeof changestatus == "undefined" || changestatus == "") {
      error = 1;
      arr_error.push('changestatus');
    }
    if (error == 1) {
      var response = {'error':'Error in input: Please enter '+arr_error.toString()};
      return cb(null, response);
    }
    else if (!(changestatus == "accepted" || changestatus == "rejected")) {
        var response = {'error':'Please enter valid status'};
        return cb(null, response);
    }
    else{
      var getUserParam = {"loginToken":access_token};
      // get details of logged in User
      common_function.getUser(getUserParam, {}, function(err, data){
        if (!err) {
            var userID = data.userID.N;
            //is Friendship exists or not
            common_function.friendDetail(userID, workout, function(err, data){
                if (!err) {
                    if (data.Count == 1) {
                        if (typeof data.Items[0][friendId] != "undefined") {
                            if (data.Items[0][friendId].M.status.S == "requested") {
                                var reqData = {
                                    lastUpdate:{
                                            N:Date.now().toString()
                                    },
                                    status:{
                                            S:changestatus
                                    },
                                    active:{
                                            BOOL:false
                                    },
                                    createdTimestamp:data.Items[0][friendId].M.createdTimestamp
                                    
                                };
                                if (changestatus == "accepted") {
                                    reqData.active = {BOOL:true};
                                }
                                common_function.changeStatus(data.Items[0].record_id.N, userID, friendId, reqData, function(errFirst, dataFirst){
                                    if (!errFirst) {
                                        common_function.friendDetail(friendId, workout, function(errDetail, dataDetail){
                                            if (!errDetail) {
                                                //code
                                                console.log("new daatatatatatatat");
                                                console.log(dataDetail.Items[0]);
                                                console.log(friendId);
                                                if (dataDetail.Count == 1) {
                                                    var reqData = {
                                                        lastUpdate:{
                                                                N:Date.now().toString()
                                                        },
                                                        status:{
                                                                S:changestatus
                                                        },
                                                        active:{
                                                                BOOL:false
                                                        },
                                                        createdTimestamp:dataDetail.Items[0][userID].M.createdTimestamp
                                                    };
                                                    if (changestatus == "accepted") {
                                                        reqData.active = {BOOL:true};
                                                    }
                                                }
                                                common_function.changeStatus(dataDetail.Items[0].record_id.N, friendId, userID, reqData, function(errSecond, dataSecond){
                                                    if (!errSecond) {
                                                        var response = {"success":"status changed successfully"};
                                                        return cb(null, response);
                                                    }
                                                    else{
                                                        var response = {"error ":errSecond};
                                                        return cb(null, response);
                                                    }
                                                });
                                            }
                                            else{
                                                var response = {"error ":errDetail};
                                                return cb(null, response);
                                            }
                                        });
                                    }
                                    else{
                                        var response = {"error ":errFirst};
                                        return cb(null, response);
                                    }
                                });
                                
                            }
                            else{
                                var response = {"error":" friend didn't request"};
                                return cb(null, response);
                            }
                        }
                        else{
                            var response = {"error":"friend didn't exist"};
                            return cb(null, response);
                        }
                    }
                    else{
                        var response = {"error":"friend didn't exist"};
                        return cb(null, response);
                        
                    }
                }
                else{
                    var response = {"error 4":err};
                    return cb(null, response); 
                }
                
            });
        }
        else{
          return cb(err, null);
        }
        
      });          
    }
  }
};