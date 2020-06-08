var mongoose = require('mongoose');

mongoose.Promise = require('bluebird');

var mongoDB = 'mongodb://localhost/chatDb';

mongoose.connect(mongoDB,{ useNewUrlParser: true , useCreateIndex: true,useUnifiedTopology: true },function(err,err){
   // console.log(mongoose);
      
});
