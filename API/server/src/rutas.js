/*IMPORTS*/
const Router  = require("express");
const Casos = require("./schemas/Casos")

/*VARIABLES A UTILIZAR*/
const app = Router();


/*SERVICIOS PRUEBA*/
app.post("/", async (req, res) => {
    console.log("Servidor recibio");
    
    let region = getRegion(req.body.location);
    console.log(req.body)
    let nuevo = new Casos({
        name: req.body.name,
        location: req.body.location,
        region: region,
        age: req.body.age,
        infectedtype: req.body.infectedtype,
        state: req.body.state,
        path: req.body.path
    });

    nuevo.save(nuevo)
     .then(result => {
        //console.log(result)
        res.send(result);
     })
     .catch(err => {
         console.log(err)
         res.send(err);
     });
     
});


app.post("/find", async (req, res) => {
    Casos.find()
     .then(result => {
        res.send(result);
     })
     .catch(err => {
         console.log(err)
         res.send(err);
     });
     
});


/*SERVICIOS FINALES*/
app.post("/funnel", async (req, res) => {
    Casos.find()
     .then(result => {
        res.send(top5Deptos(result));
     })
     .catch(err => {
         console.log(err)
         res.send(err);
     });
     
});


app.post("/circular1", async (req, res) => {
    Casos.find()
     .then(result => {
        res.send(infectados(result, "state"));
     })
     .catch(err => {
         console.log(err)
         res.send(err);
     });
     
});


app.post("/circular2", async (req, res) => {
    Casos.find()
     .then(result => {
        res.send(infectados(result, "infectedtype"));
     })
     .catch(err => {
         console.log(err)
         res.send(err);
     });
     
});


app.post("/ultimos", async (req, res) => {
    Casos.find()
     .then(result => {
        res.send(ultimos(result));
     })
     .catch(err => {
         console.log(err)
         res.send(err);
     });
     
});


app.post("/edades", async (req, res) => {
    Casos.find()
     .then(result => {
        res.send(edades(result));
     })
     .catch(err => {
         console.log(err)
         res.send(err);
     });
     
});


/*METODOS VARIOS*/
function getRegion(location){
    let loc = location.toLowerCase();
    if(loc == "quetzaltenango" || loc == "retalhuleu" || loc == "san marcos" || loc == "suchitepéquez" || loc == "sololá" || loc == "totonicapán"){
        return "Suroccidente"
    }else if(loc == "guatemala"){
        return "Metropolitana"
    }else if(loc == "huehuetenango" || loc == "quiché"){
        return "Noroccidente"
    }else if(loc == "chimaltenango" || loc == "sacatepéquez" || loc == "escuintla"){
        return "Central"
    }else if(loc == "alta verapaz" || loc == "baja verapaz"){
        return "Verapaz"
    }else if(loc == "chiquimula" || loc == "el progreso" || loc == "izabal" || loc == "zacapa"){
        return "Nororiente"
    }else if(loc == "jutiapa" || loc == "jalapa" || loc == "santa rosa"){
        return "Suroriente"
    }else if(loc == "petén"){
        return "Petén"
    }else{
        return location
    }
}

let top = new Array;
function top5Deptos(result){
    top = new Array;
    
    for(let i of result){
        agregarTop(i.location)
    }

    for(var i=1;i<top.length;i++){
        for(var j=0; j<(top.length-i); j++){
            if(top[j][0] < top[j+1][0]){
                k = top[j+1][0];
                valor = top[j+1][1];
                
                top[j+1][0] = top[j][0];
                top[j+1][1] = top[j][1];
                
                top[j][0] = k;
                top[j][1] = valor;
            }
        }
    }

    let aux = new Array;
    for(var i=0; i < top.length; i++){
        if(i < 5){
            aux.push(top[i])
        }
    }
    //top.prototype.sort()

    console.log(aux)
    return aux
}

function infectados(result, tipo){
    top = new Array;
    
    for(let i of result){
        if(tipo == "state"){
            agregarTop(i.state)
        }else if(tipo == "infectedtype"){
            agregarTop(i.infectedtype)
        }
    }

    for(var i=0; i < top.length; i++){
        top[i][0] = (top[i][0]/result.length)*100
    }

    return top
}

function agregarTop(depto){
    let exist = false;
    for(let i in top){
        if(top[i][1] == depto){
            top[i][0]++;
            exist = true;
            break;
        }
    }

    if(!exist){
        top.push([1, depto]);
    }
}

function ultimos(result){
    let aux = new Array;
    let j = 0;
    for(let i=result.length-1; i > 0; i--){
        if(j < 5){
            j++;
            aux.push(result[i]);
        }
    }
    return aux;
}

function edades(result){
    let lista = [[0,10],[0,20],[0,30],[0,40],[0,50],[0,60],[0,70],[0,80],[0,90]]

    for(let i of result){
        if(i.age < 10){
            lista[0][0]++;
        }else if(i.age < 20){
            lista[1][0]++;
        }else if(i.age < 30){
            lista[2][0]++;
        }else if(i.age < 40){
            lista[3][0]++;
        }else if(i.age < 50){
            lista[4][0]++;
        }else if(i.age < 60){
            lista[5][0]++;
        }else if(i.age < 70){
            lista[6][0]++;
        }else if(i.age < 80){
            lista[7][0]++;
        }else{
            lista[8][0]++;
        }
    }

    return lista;
}

module.exports = app;