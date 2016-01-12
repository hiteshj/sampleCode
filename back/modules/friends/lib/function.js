/**
 * Lib
 */
var AWS = require('aws-sdk');
var config = require('./../config.json');
//var dynamodb = new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://localhost:8000'), region:'us-west-1', accessKeyId:"123", secretAccessKey:"123" });
var dynamodb = new AWS.DynamoDB();
var jwt = require('jwt-simple');
var secret = "friend";

module.exports.getUser = function(where, orWhere, fn) {
    
    var i=1;
    var ArrAttributesNames = {};
    var ArrAttributesvalues = {};
    var numFields = new Array('userID');
    var ArrFilter = new Array();
    for(key in where){
      ArrAttributesNames['#att_name'+i] = key;
      var keyValue = {};
      if (numFields.indexOf(key) != -1) {
        keyValue = {N:where[key]};
      }
      else{
        keyValue = {S:where[key]};
      }
      ArrFilter[i-1] = '#att_name'+i+' = :val'+i;
      ArrAttributesvalues[':val'+i] = keyValue;
      i++;
    }
    
    // OR Conditions
    var ArrFilterOR = new Array();
    var j=1;
    for(key in orWhere){
        ArrAttributesNames['#att_name'+i] = key;
        var keyValue = {};
        if (numFields.indexOf(key) != -1) {
          keyValue = {N:orWhere[key]};
        }
        else{
          keyValue = {S:orWhere[key]};
        }
        ArrFilterOR[j-1] = '#att_name'+i+' = :val'+i;
        ArrAttributesvalues[':val'+i] = keyValue;
        i++;
        j++;
    }
    if (ArrFilterOR.length > 0) {
        var strFilterOR = ' ('+ArrFilterOR.join(' OR ')+')'
        ArrFilter.push(strFilterOR);
    }
    
    
    var param = {
            TableName: config.DDB_USER_TABLE,
            FilterExpression: ArrFilter.join(' AND '),
            ExpressionAttributeNames:ArrAttributesNames,
            ExpressionAttributeValues: ArrAttributesvalues
    };
    dynamodb.scan(param, function(err, data) {
            if (err) return fn(err);
            else {
                    if (data.Count == 1) {
                            fn(null,data.Items[0]);
                    }
                    else if (data.Count == 0) {
                            fn({"error":"user didn't find"}, null, null);
                    }
                    else{
                            fn({"error":"Please contact Administrator"}, null, null)
                    }
            }
    });
};

module.exports.listUser = function(arrUserId, fn){
    
    var arrValueList = new Array();
    for(i=0;i<arrUserId.length;i++){
        var objId = {};
        objId.N = arrUserId[i].toString();
        arrValueList.push(objId);
    }
    console.log(arrValueList);
    var param = {
            TableName: config.DDB_USER_TABLE,
            ScanFilter:{
                'userID':{
                    ComparisonOperator:'IN',
                    AttributeValueList:arrValueList
                }
            }
    };
    dynamodb.scan(param, fn);
}

