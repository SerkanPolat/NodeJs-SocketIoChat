var Kullanici = require('./model/kullanici');
var mongoose = require('mongoose');
var OfflineMesaj = require('./model/OfflineMesaj');
module.exports.VeritabaniKullaniciEkle = function(KullaniciAd,Sifre,callback){
    Sifre = "Sabit";
    var yeniKullanici = new Kullanici({
        kulAd:KullaniciAd,
        sifre:Sifre
    });
    yeniKullanici.save(function(err){
        console.log("Yeni Kullanici Ekleniyor : "+err);
        if(err!=null)
            callback('Kullanici Mevcut');                
        else{
            callback(null);
        }

    });
};

module.exports.TumKullanicilariGetir = function(callback){

        Kullanici.find({},function(err,res){
            callback(res);
        });
}

module.exports.VeritabanindanOku = function(Nick,Sif,callback){

    Kullanici.find({kulAd:Nick},function(err,result){
        if(err){
            console.log("Giriste Hata");
            callback('Giris Hatasi')
        }else{
			
			if(result.length>0){
                callback(null);
            }else{
                callback('Kullanici Adi Sifre Yanlis');
            }
			
            
        }
    });
}

module.exports.VeritabaniOfflineMesajKayit = function(GonderenAd,AliciAd,Mesaj){
    var offlineKullanici = new OfflineMesaj({
        
        GonderenAd:GonderenAd,
        AliciAd:AliciAd,
        Mesaj:Mesaj
    });
    offlineKullanici.save(function(err){
        if(err){
            console.log("Offline Mesaj Kayit Hata");
        }else{
            console.log("Offline Mesaj Kaydedildi.");
        }
    });
    
}

module.exports.OfflineMesajOku = function(GirisYapan,callback2){
   // console.log('GIRIS Yapiyor :'+GirisYapan);
    OfflineMesaj.find({$or:[{AliciAd:GirisYapan},{GonderenAd:GirisYapan}]},function(err,result){
        if(err){
            console.log("Giriste Hata :"+result);
            
        }else{

			callback2(result);
        
        }
    });
}
module.exports.OfflineMesajSil = function(AliciAd){

    OfflineMesaj.deleteMany({AliciAd:AliciAd},function(err,result){

        if(err){
            console.log('Offline Mesaj Silmede Hata : '+err);
        }else{
            console.log("Siliniyor "+result);
        }

    });

}

module.exports.KullaniciOdaGuncelle = function(KulAd,OdaAnahtari){
    
    Kullanici.updateOne({kulAd:KulAd},{ $push: {OdaAnahtarlari:OdaAnahtari}} , function(err, res) {
        

    });
}


module.exports.OdaAnahtarlariniGetir = function(KulAd,callback){
    Kullanici.find({kulAd:KulAd},function(err,result){
        if(err){
            console.log("Giriste Hata");
            callback('Giris Hatasi')
        }else{
            
            if(result.length>0){
                callback(result[0].OdaAnahtarlari);
            }else{
            }
            
            
        }
    });
}
