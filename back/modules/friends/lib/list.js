/**
 * Lib
 */
var common_function = require('./function');

//
module.exports.list = function(event, cb) {
  var access_token = event.access_token;
  if (typeof access_token == "undefined" || access_token == "") {
    var response = {"error":"Authenticaton failed"};
    return cb(null, response);
  }
  else{
    var workout = event.workout;
    var error = 0;
    var arr_error = new Array();
    if (typeof workout == "undefined" || workout == "") {
      error = 1;
      arr_error.push('workout');
    }
    if (error == 1) {
      var response = {'error':'Error in input: Please enter '+arr_error.toString()};
      return cb(null, response);
    }
    else{
      var getUserParam = {"loginToken":access_token};
      
      // get details of logged in User
      common_function.getUser(getUserParam, {}, function(err, maindata){
        if (!err) {
            var userID = maindata.userID.N;
            common_function.friendDetail(userID, workout, function(err, Frienddata){
                if (Frienddata.Count == 0) {
                    var response = {'success':'No friend'};
                    return cb(null, response);
                }
                else{
                    var items = Frienddata.Items[0];
                    var arrUser = new Array();
                    for(user_id in items){
                        if (!isNaN(user_id)) {
                            arrUser.push(user_id);
                        }
                    }
                    common_function.listUser(arrUser, function(err, data){
                        if(!err){
                            console.log("Item Detail");
                            console.log(items);
                            for(key in data.Items){
                                items[data.Items[key].userID.N].M.email = data.Items[key].email;
                            }
                            return cb(null, items);
                            
                        }
                    });
                }
            });
            //is Friendship exists or not
                    
        }
        else{
          return cb(err, null);
        }
        
      });          
    }
  }
};