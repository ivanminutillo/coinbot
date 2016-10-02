var token = '279000152:AAFb5pq0V9e2eZM0TmWq1tcxjMtCL1iMCuQ';
var Bot = require('node-telegram-bot-api')
var bitcoin = require('bitcoinjs-lib')
var bip32utils = require('bip32-utils')
var bs58check = require('bs58check')
var btc = require('./wallet')
var async = require('async')
var axios = require('axios')
var Datastore = require('nedb')
var db = new Datastore({ filename: './db/main.db', autoload: true })
// You can issue commands right away

var bot = new Bot(token, { polling: true });

console.log('bot server started...');


var wall = btc.Wallet.fromSeedHex('ffffffffffffffffffffffffffffffff', bitcoin.networks.testnet);
console.log(wall.external.getAddress())
function assignIdentity(msg, wallet) {
    async.waterfall([
      function(callback) {
        db.find({ user: msg.chat.username }, function (err, docs) {
          callback(null, docs)
        })
      },
      function(docs, callback) {
        if(docs.length === 0) {
          db.count({}, function (err, count) {
            var hdnode = wallet.external.derive(count);
            var newuser = {
              _id: count,
              user : msg.chat.username,
              depth : hdnode.depth,
              index: hdnode.index,
              address : hdnode.keyPair.getAddress()
            }
            callback(null, newuser)
          })
        } else {
          bot.sendMessage(msg.chat.id, 'Hai già un indirizzo, usa quello barbone !').then(function () {
            // reply sent!
          });
        }
      },
      function(newuser, callback) {
        db.insert(newuser, function (err, newDoc) {
          if(err) {
              bot.sendMessage(msg.chat.id, 'mi spiace amico ci è stato un errore !').then(function () {
                // reply sent!
              });
          } else {
              bot.sendMessage(msg.chat.id, 'hey ora hai tutto quello che ti serve per scambiarti denara !').then(function () {
                // reply sent!
              });
          }
        })

      }
    ], function() {
      console.log('end')
    })
}

function getAddress(msg) {
  async.waterfall([
    function(callback) {
      db.find({user: msg.chat.username}, function (err, docs) {
        callback(null, docs)
      })
    },
    function(docs, callback) {
      if(docs.length === 0) {
        bot.sendMessage(msg.chat.id, 'Non hai un wallet amico, creane uno prima!')
    } else {
      bot.sendMessage(msg.chat.id, 'ecco il tuo indirizzo ' + docs[0].address ).then(function () {
    })};
    },
  ], function() {
    console.log('end')
  })
}



function createTransaction (utxo, output, amount) {
  var network = bitcoin.networks.testnet
  var fee = 1500;
  var remainder = utxo.satoshis - amount - fee
  var txb = new bitcoin.TransactionBuilder(network)
  txb.addInput(utxo.txid, utxo.vout);
  txb.addOutput(output, Number(amount));
  txb.addOutput(utxo.address, remainder)
  txb.sign(0, wall.external.keyPair)
  var tx = txb.build().toHex()
  console.log(tx)
  return tx
}


function receiveTokens(msg, amount) {
  async.waterfall([
    function(callback) {
      db.find({ user: msg.chat.username }, function (err, docs) {
        callback(null, docs)
      })
    },
    function(docs, callback) {
      console.log(docs)
      axios.get('http://appliance2.uniquid.co:8080/insight-api/addr/mpQ6dh1hgYrBVhGgWdRSLezWEGt9unkhTg/utxo')
        .then(function (res) {
          console.log(docs[0].address);
          createTransaction(res.data[0], docs[0].address, 10000)
        })
        .catch(function (error) {
          console.log(error);
      });
    }
  ])


  //btc.Wallet.createTransaction()
}
/**
* RECEIVE TOKENS
*
**/
bot.onText(/^\/receive/, function(msg) {
  receiveTokens(msg, 100)
})



/**
* CREATE A NEW ADDRESS
*
**/
bot.onText(/^\/create/, function(msg) {
  assignIdentity(msg, wall)
})


/**
* RETURN THE ADDRESS
*
**/
bot.onText(/^\/address/, function(msg) {
  getAddress(msg)
})


bot.onText(/^\/say_hello (.+)$/, function (msg, match) {
  var name = match[1];
  bot.sendMessage(msg.chat.id, 'Hello ' + name + '!').then(function () {
    // reply sent!
  });
});

bot.onText(/^\/sum((\s+\d+)+)$/, function (msg, match) {
  var result = 0;
  match[1].trim().split(/\s+/).forEach(function (i) {
    result += (+i || 0);
  })
  bot.sendMessage(msg.chat.id, result).then(function () {
    // reply sent!
  });
});
