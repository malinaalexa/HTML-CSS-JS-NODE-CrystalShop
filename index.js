const express = require("express");
const fs= require('fs');
const path=require('path');
const sharp=require('sharp');

obGlobal={
    obErori:null,
    obImagini:null
}

app= express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());
vectorFoldere=["temp", "temp1"]

for (let folder of vectorFoldere){

//let caleFolder=__dirname+"/"+folder;

let caleFolder=path.join(__dirname, folder)

if (! fs.existsSync(caleFolder)){

fs.mkdirSync(caleFolder);

}


}
app.set("view engine","ejs");

app.use("/resurse", express.static(__dirname+"/resurse"));

app.use(/^\/resurse(\/((?=[0-9])|(?=[a-z])|(?=[A-Z])))*$/, function(req,res){
    afisareEroare(res,403);
});

app.get("/ceva", function(req, res){
    console.log("cale:",req.url)
    res.send("<h1>altceva</h1> ip:"+req.ip);
})



app.get(["/index","/","/home" ], function(req, res){
    res.render("pagini/index" , {ip: req.ip, a: 10, b:20, imagini:obGlobal.obImagini.imagini});
})


app.get("/*",function(req, res){
    res.render("pagini"+req.url, function(err, rezRandare){
        if(err){
            console.log(err);
            if(err.message.startsWith("Failed to lookup view"))
            //afisareEroare(res,{_identificator:404, _titlu:"ceva"});
                afisareEroare(res,404, "ceva");
            else
                afisareEroare(res);
        }
        else{
            console.log(rezRandare);
            res.send(rezRandare);
        }
    } );
})


function initErori(){
    var continut= fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf-8");
    console.log(continut);
    obGlobal.obErori=JSON.parse(continut);
    let vErori=obGlobal.obErori.info_erori;
    //for (let i=0; i< vErori.length; i++ )
    for (let eroare of vErori){
        eroare.imagine="/"+obGlobal.obErori.cale_baza+"/"+eroare.imagine;
    }
}
initErori();


function initImagini(){
    var continut= fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf-8");
    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;
    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(caleAbs,"mediu");
    if(!fs.existsSync(caleAbsMediu)) 
        fs.mkdirSync(caleAbsMediu);
    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini){
        [numeFis,ext]=imag.fisier.split(".");
        let caleFisAbs=path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu,numeFis+".webp");
        sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs); //aici punem alte efecte
        imag.fisier_mediu="/"+path.join(obGlobal.obImagini.cale_galerie,"mediu",numeFis+".webp");
        imag.fisier="/"+path.join(obGlobal.obImagini.cale_galerie,imag.fisier);
        //eroare.imagine="/"+obGlobal.obErori.cale_baza+"/"+eroare.imagine;
    }
}
initImagini();

/*
daca  programatorul seteaza titlul, se ia titlul din argument
daca nu e setat, se ia cel din json
daca nu avem titluk nici in JSOn se ia titlul de valoarea default
idem pentru celelalte
*/

//function afisareEroare(res, {_identificator, _titlu, _text, _imagine}={} ){
function afisareEroare(res, _identificator, _titlu="titlu default", _text, _imagine ){
    let vErori=obGlobal.obErori.info_erori;
    let eroare=vErori.find(function(elem) {return elem.identificator==_identificator;} )
    if(eroare){
        let titlu1= _titlu=="titlu default" ? (eroare.titlu || _titlu) : _titlu;
        let text1= _text || eroare.text;
        let imagine1= _imagine || eroare.imagine;
        if(eroare.status)
            res.status(eroare.identificator).render("pagini/eroare", {titlu:titlu1, text:text1, imagine:imagine1});
        else
            res.render("pagini/eroare", {titlu:titlu1, text:text1, imagine:imagine1});
    }
    else{
        let errDef=obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", {titlu:errDef.titlu, text:errDef.text, imagine:obGlobal.obErori.cale_baza+"/"+errDef.imagine});
    }
    

}

app.listen(8080);
console.log("Serverul a pornit");