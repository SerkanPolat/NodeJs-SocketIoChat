var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var OfflineMesajSchema = new Schema({

    GonderenAd:{type:String,required:true},
    AliciAd:{type:String,required:true},
    Mesaj:{type:String,required:true}
});

var dbOffMesaj  = mongoose.model('OffMesaj',OfflineMesajSchema);

module.exports = dbOffMesaj;