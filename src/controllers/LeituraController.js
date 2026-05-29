const Leitura = require("../models/Leitura");

// recebe o wss de fora para poder emitir
let wssRef = null;

class LeituraController {



    setWss(wss) {
        wssRef = wss; // guarda a referência do WebSocket
    }




receberDados(req, res){

    const {temperatura, umidade, CO, gases} = req.body;


    if(temperatura === undefined || umidade === undefined){

          return res.status(400).json({   erro: "Sem leitura" });

    }



    Leitura.salvarLeitura(temperatura, umidade, CO, gases);

    //if (wssRef) {
     //       wssRef.clients.forEach((client) => {
     //           client.send(JSON.stringify(leitura));
     //       });
     //   }


    return res.status(201).json({ status: "ok", recebido: leitura });
}





listarDados(req, res){

    const lista = Leitura.listarDados();
    res.json(lista);

}







}
module.exports = new LeituraController();