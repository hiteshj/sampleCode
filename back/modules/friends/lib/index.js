/**
 * Lib
 */
var common_function = require('./function');

//
module.exports.create = function(event, cb) {
  var access_token = event.access_token;
  if (typeof access_token == "undefined" || access_token == "") {
    var response = {"error":"Authenticaton failed"};
    return cb(null, response);
  }
  else{
    var workout = event.workout;
    var friendUserId = event.friendUserId;
    var friendEmail = event.friendEmail;
    var error = 0;
    var arr_error = new Array();
    if (typeof workout == "undefined" || workout == "") {
      error = 1;
      arr_error.push('workout');
    }
    if ((typeof friendUserId == "undefined" || friendUserId == "") && (typeof friendEmail == "undefined" || friendEmail == "")) {
      error = 1;
      arr_error.push('friendUserId OR friendEmail');
    }
    
    if (error == 1) {
      var response = {'error':'Error in input: Please enter '+arr_error.toString()};
      return cb(null, response);
    }
    else{
      var getUserParam = {"loginToken":access_token};
      common_function.getUser(getUserParam, {}, function(err, data){
        if (!err) {
          var userID = data.userID.N;
          // function to get frienduser Details
          var getFriendParam = {};
          if (!(typeof friendUserId == "undefined" || friendUserId == "")) {
            getFriendParam.userID = friendUserId;
          }
          if (!(typeof friendEmail == "undefined" || friendEmail == "")) {
            getFriendParam.email = friendEmail;
          }
          common_function.getUser({}, getFriendParam, function(friendErr, friendData){
            if (!friendErr) {
              var friendId = friendData.userID.N;
              
              //is Friendship exists or not
              common_function.isFriendExists(workout, friendId, userID, function(isFrienderr, isFrienddata){
                if (!isFrienderr) {
                  if (isFrienddata != "no_exists"){
                    var response = {'error':"Friend already exists"};
                    return cb(null, response);
                  }
                  else{
                    // check user record exists or not
                    common_function.isFriendExists(workout, null, userID, function(recordErr, recordData){
                      if (recordData != "no_exists"){
                        common_function.updFriend(recordData, userID, friendId, 'waiting', function(updErr, updData){
                          if (!updErr) {
                            
                            // code to make new entry in friend table to make relation
                            common_function.isFriendExists(workout, null, friendId, function(recordErr, recordData){
                              if (recordData != "no_exists"){
                                common_function.updFriend(recordData, friendId, userID, 'requested', function(updErr, updData){
                                  if (!updErr) {
                                    var response = {'success':"link added successfully"};
                                    return cb(null, response);
                                  }
                                  else{
                                    var response = {'error':updErr};
                                    return cb(null, response);
                                  }
                                });
                              }
                              else{
                                common_function.insFriend(workout, userID, friendId, 'requested', function(insErr, insData){
                                  if (!insErr) {
                                    var response = {'success':"link added successfully"};
                                    return cb(null, response);
                                  }
                                  else{
                                    var response = {'error':insErr};
                                    return cb(null, response);
                                  }
                                });
                              }
                            });
                            //End of code to make relation in friend table
                            
                            
                          }
                          else{
                            return cb(null, updErr);
                          }
                          
                        });
                      }
                      else{
                        common_function.insFriend(workout, friendId, userID, 'waiting', function(insErr, insData){
                          if (!insErr) {
                            
                            // code to make new entry in friend table to make relation
                            common_function.isFriendExists(workout, null, friendId, function(recordErr, recordData){
                              if (recordData != "no_exists"){
                                common_function.updFriend(recordData, friendId, userID, 'requested', function(updErr, updData){
                                  if (!updErr) {
                                    var response = {'success':"link added successfully"};
                                    return cb(null, response);
                                  }
                                  else{
                                    var response = {'error':updErr};
                                    return cb(null, response);
                                  }
                                });
                              }
                              else{
                                common_function.insFriend(workout, userID, friendId, 'requested', function(insErr, insData){
                                  if (!insErr) {
                                    var response = {'success':"link added successfully"};
                                    return cb(null, response);
                                  }
                                  else{
                                    var response = {'error':insErr};
                                    return cb(null, response);
                                  }
                                });
                              }
                            });
                            //End of code to make relation in friend table
                          }
                          else{
                            return cb(null, insErr);
                          }
                        });
                      }
                    });
                    
                  }
                }
                else{
                  return cb(null, isFrienderr);
                }
              });
            }
            else{
              return cb(null, friendErr);
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