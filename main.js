"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const back = require('androidjs').back;  // This was missing but I think needs to be there
const fs_1 = require("fs");
const path = require('path');
var elliptic_1 = require("elliptic");

var EC = new elliptic_1.ec('secp256k1');

const bodyParser = require("body-parser");
const express = require("express");
const _ = require("lodash");
const blockchain_1 = require("./blockchain");
const p2p_1 = require("./p2p");
const transactionPool_1 = require("./transactionPool");
const wallet_1 = require("./wallet");
//const httpPort = parseInt(process.env.HTTP_PORT) || 3001;
//const p2pPort = parseInt(process.env.P2P_PORT) || 6001;

back.on('blocks',function(){
    back.send('blocks-info',blockchain_1.getBlockchain());
})

back.on('blocks-hash',function(hash){
    const block = _.find(blockchain_1.getBlockchain(), { 'hash': hash });
    back.send('block-hash-info',block);
});

back.on('blocks-hash',function(hash){
    const block = _.find(blockchain_1.getBlockchain(), { 'hash': hash });
    back.send('block-hash-info',block);
});

// My edition start from here.
back.on('transaction-:id',function(id){
    const tx = _(blockchain_1.getBlockchain())
            .map((blocks) => blocks.data)
            .flatten()
            .find({ 'id':id });
    back.send('transaction-id',tx);
});

//Confusion part is here, is it getting the right 
//path?

back.on('address-:address',function(address){
    const unspentTxOuts = _.filter(blockchain_1.getUnspentTxOuts(), 
    (uTxO) => uTxO.address === address);
    back.send('address-info',unspentTxOuts);
});

back.on('unspentTransactionOutputs',function(){
    back.send('unspentTrans',blockchain_1.getUnspentTxOuts());
});

back.on('myUnspentTransactionOutputs',function(){
    back.send('myunspent',blockchain_1.getMyUnspentTransactionOutputs());
});

back.on('mineRawBlock',function(data){
    if (data == null) {
        back.send('raw-info','data parameter is missing');
        return;
    }
    const newBlock = blockchain_1.generateRawNextBlock(data);
    if (newBlock === null) {
        back.send('raw-info','could not generate block');
    }
    else {
        back.send('raw-info',newBlock);
    }
});


back.on('mineBlock',function(data){
    back.send('mine-block',blockchain_1.generateNextBlock(data));
});

back.on('peers',function(){
    back.send('know-peers',p2p_1.getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
});

back.on('addPeer',function(peer){
    p2p_1.connectToPeers(peer);
    back.send('add-peers', "Done");
});


//testing
back.on('math',function(x,y){
    back.send('math-result',Math.pow(x, y) + ':' + Math.round(new Date().getTime() / 1000));
})

back.on('test',function(){
    back.send('some-info',"Some Messages Coming");
});


//To Start the P2P server send the port number to this
back.on('init-p2p',function(p2pPortString){
    back.send('debug-info','init-p2p: '+p2pPortString); 
	//p2pPort = parseInt(p2pPortString) || 6001;
    //back.send('debug-info','init-p2p: '+p2pPortString+' -> '+p2pPort);
	p2p_1.initP2PServer(6001);
    back.send('debug-info','P2P Initialized');
    //back.send('debug-info', "Path"+app.getPath('userData'))
})

back.on('init-wallet',function(usr_datapath){
    //back.send('debug-info',"Wallet starting "+usr_datapath);
    //back.send('debug-info', fs_1.constants);
    back.send('debug-info','init-wallet: '+usr_datapath); // This line printed out before it's get closed.
	//p2pPort = parseInt(p2pPortString) || 6001;
    //back.send('debug-info','init-p2p: '+p2pPortString+' -> '+p2pPort);
    // back.send('debug-info',"Wallet starting "+usr_datapath);  
    // try{
    //     var privateKeyLocation = path.join(usr_datapath,'private_key' );
    // }
    // catch(err){
    // back.send('debug-info',err.message);
    // }
    // back.send('debug-info', privateKeyLocation);
    // try{
    //     fs_1.accessSync(privateKeyLocation  , fs_1.constants.R_OK | fs_1.constants.W_OK);
    // }
    // catch(err){
    //     back.send('debug-info', "Error Recieved: "+err.message);
    // }

    // try{
    //     if(fs_1.existsSync(privateKeyLocation)){
    //         back.send('debug-info', "Exist: "+privateKeyLocation);
    //     //fs_1.accessSync(privateKeyLocation  , fs_1.constants.R_OK | fs_1.constants.W_OK);
    //     }
    //     else{
    //         back.send('debug-info', " Missing: "+privateKeyLocation);
    //     }
    // }
    // catch(err){
    //     back.send('debug-info', "Error Recieved: "+err.message);
    // }

    //try{
        
    //  try{
    //     var elliptic_1 = require("elliptic");
    //     var EC = new elliptic_1.ec('secp256k1');
    //     }
    //     catch(err){
    //         back.send('debug-info', "Error Recieved: "+err.message);
    //     }
    // const keyPair = EC.genKeyPair();
    // const privateKey = wallet_1.generatePrivateKey();//keyPair.getPrivate();
    // //return privateKey.toString(16);
    // back.send('debug-info', privateKey.toString(16));
    // fs_1.writeFileSync(privateKeyLocation, privateKey);
    // }
    // catch(err){
    //     back.send('debug-info', "Error Recieved: "+err.message);
    // }
    wallet_1.initWallet(back,usr_datapath);
    // try{
    //     var privateKeyLocation = path.join(usr_datapath,'private_key' );
    //     if(fs_1.existsSync(privateKeyLocation)){
    //         back.send('debug-info', "Exist: "+privateKeyLocation);
    //     //fs_1.accessSync(privateKeyLocation  , fs_1.constants.R_OK | fs_1.constants.W_OK);
    //     }
    //     else{
    //         back.send('debug-info', " Missing: "+privateKeyLocation);
    //     }
    // }
    // catch(err){
    //     back.send('debug-info', "Error Recieved: "+err.message);
    // }


    // let's not override existing private keys
    /*if (fs_1.existsSync(privateKeyLocation)) {
        back.send('debug-info',"Private Key Location Exist");
        return;
    }*/
    //wallet_1.initWallet(back,usr_datapath);
    back.send('debug-info','Wallet Intitialized');
})

/*const initHttpServer = (myHttpPort) => {
    const app = express();
    app.use(bodyParser.json());
    app.get('/blocks', (req, res) => {
        res.send(blockchain_1.getBlockchain());
    });
    app.post('/mineBlock', (req, res) => {
        const newBlock = blockchain_1.generateNextBlock(req.body.data);
        res.send(newBlock);
    });
    app.get('/peers', (req, res) => {
        res.send(p2p_1.getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        p2p_1.connectToPeers(req.body.peer);
        res.send();
    });
    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort);
    });
};
initHttpServer(httpPort);**/
//p2p_1.initP2PServer(p2pPort);
//# sourceMappingURL=main.js.map