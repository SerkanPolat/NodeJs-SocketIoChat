var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var db = require('./veritabani');
var KullaniciListesi = [];
var TumKullanicilar = [];
var rand = require('random-key');
var VeritabaniIslemleri = require('./VeritabaniIslem');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.get('/',function(req,res){

    res.sendFile(__dirname+'/girisSayfasi.html');
});


var KullaniciListesiGuncelle = function(body){

    KullaniciListesi.push({
        socketId:"",
        kulAd: body.kulAd,
    });
}

var OnlineGostergesi = function(io){
    KullaniciListesi.forEach(function(value,index,arr){
        io.emit('OnlineGostergesi',value.kulAd,value.socketId);
    });
    
}

app.post('/',function(req,res){
    VeritabaniIslemleri.VeritabanindanOku(req.body.kulAd,req.body.sif,function(err){
        if(err==null){
            KullaniciListesiGuncelle(req.body);

            res.sendFile(__dirname+'/sohbet.html',function(err,err){

            });
        }else{ 
            res.sendFile(__dirname+'/girisSayfasiHata.html',function(err,err){

            });
            console.log('Veritabaninda Okumada Hata');
        }
    });
});
app.get('/Kayit',function(req,res){
    
    res.sendFile(__dirname+'/KayitSayfasi.html');
});
app.post('/Kayit',function(req,res){
    console.log(req.body);
    VeritabaniIslemleri.VeritabaniKullaniciEkle(req.body.kulAd,req.body.sif,function(err){

        if(err!=null){
            res.sendFile(__dirname+'/KayitSayfasiHata.html');
        }else{
            console.log('Kullanici Listesi Guncelleniyor.');
            TumKullanicilar.push({
                socketId:"",
                kulAd: req.body.kulAd
            });
            KullaniciListesiGuncelle(req.body);
            res.sendFile(__dirname+'/sohbet.html',function(err,err){
                
            });
        }

    });


});
VeritabaniIslemleri.TumKullanicilariGetir(function(Kullanicilar){
    console.log('Kullanicilari getir');
    Kullanicilar.forEach(function(value,index,arr){
            console.log("Kullanici Adi/: "+value.kulAd);
            
            TumKullanicilar.push({
                socketId:"",
                kulAd: value.kulAd
            });
    });
});

io.on('connection',function(socket){

    
    KullaniciListesi.forEach(function(value,index,array){
        if(value.socketId==""){
            value.socketId=socket.id;
            io.emit('KullaniciListesi',TumKullanicilar,value.kulAd);
            var Kullanici = value.kulAd;
            
            VeritabaniIslemleri.OfflineMesajOku('global',function(Deger){

                 Deger.forEach(function(value,index,arr){
                     socket.emit('globalchat',value.GonderenAd,value.Mesaj);
                 });
                 
                 OnlineGostergesi(io,Kullanici);
             });
            VeritabaniIslemleri.OfflineMesajOku(value.kulAd,function(Deger){
               
                Deger.forEach(function(value,index,arr){
                    socket.emit('SohbetKanali',value.GonderenAd,value.Mesaj);
                });
            });
            VeritabaniIslemleri.OdaAnahtarlariniGetir(value.kulAd,function(Anahtarlar){
                    Anahtarlar.forEach(function(value,index,arr){
                    socket.emit('OdaAyarla',value);
                    VeritabaniIslemleri.OfflineMesajOku(value,function(Deger){
                        Deger.forEach(function(element,index,arr){
                        socket.emit('GrupSohbeti',element.GonderenAd,element.Mesaj,value);
                        
                        });
                    });

                })

            });
            
            console.log('Kullanici Baglandi : '+value.kulAd);
            return;
        }
    });

    socket.on('disconnect',function(){
        KullaniciListesi.forEach(function(value,index,array){
            if(value.socketId==socket.id){
                
                console.log('Kullanici Cikti : '+value.kulAd);
                KullaniciListesi.splice(index,1);
                io.emit('OfflineGostergesi',value.kulAd);
                return;
            }
        });

    });
    socket.on('Deneme',function(msg){
        console.log(msg)
    });

    socket.on('SohbetKanali',function(GonderilecekId,GonderenKullanici,Mesaj,gonderenId,AlanKullanici){

            io.to(GonderilecekId).emit('SohbetKanali',GonderenKullanici,Mesaj);
            VeritabaniIslemleri.VeritabaniOfflineMesajKayit(GonderenKullanici,AlanKullanici,Mesaj)

    });
    socket.on('globalchat',function(Gonderen,Mesaj){
        io.emit('globalchat',Gonderen,Mesaj);
        VeritabaniIslemleri.VeritabaniOfflineMesajKayit(Gonderen,'global',Mesaj);
    });
    socket.on('GrupSohbeti',function(GonderenKullanici,Mesaj,OdaAnahtari){
        VeritabaniIslemleri.VeritabaniOfflineMesajKayit(GonderenKullanici,OdaAnahtari,Mesaj);
        io.to(OdaAnahtari).emit('GrupSohbeti',GonderenKullanici,Mesaj,OdaAnahtari);


    });

    socket.on('OdaAyarla',function(Kullanicilar,OdaKuran){
        var OdaAnahtari = rand.generate();
        socket.emit('OdaAyarla',OdaAnahtari);
        VeritabaniIslemleri.KullaniciOdaGuncelle(OdaKuran,OdaAnahtari);
        Kullanicilar.forEach(function(value,index,arr){
            io.to(value[0]).emit('OdaAyarla',OdaAnahtari)
            
            VeritabaniIslemleri.KullaniciOdaGuncelle(value[1],OdaAnahtari);
            

        });
    });
    socket.on('OdayaGir',function(OdaAnahtari){

        socket.join(OdaAnahtari);
    });


});


http.listen(8000,function(){

    console.log('8000 Portunda Calisiyoruz');
});