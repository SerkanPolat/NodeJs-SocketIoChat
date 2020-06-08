var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var KullaniciSchema = new Schema({
    kulAd:{type:String,required:true,unique:true},
    sifre:{type:String,required:true},
    OdaAnahtarlari:{type:Array}
});

var dbKullanici  = mongoose.model('Kullanici',KullaniciSchema);

module.exports = dbKullanici;