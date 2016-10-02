var token = '279000152:AAFb5pq0V9e2eZM0TmWq1tcxjMtCL1iMCuQ';
var Bot = require('node-telegram-bot-api')
var bitcoin = require('bitcoinjs-lib')
var bip32utils = require('bip32-utils')
var bs58check = require('bs58check')
var btc = require('./wallet')
var async = require('async')
var Datastore = require('nedb')
var db = new Datastore({ filename: './db/main.db', autoload: true })
// You can issue commands right away

var bot = new Bot(token, { polling: true });

console.log('bot server started...');
var wall = btc.Wallet.fromSeedHex('ffffffffffffffffffffffffffffffff', bitcoin.networks.testnet);

/**
* CREATE A NEW ADDRESS
*
**/
bot.onText(/^\/create/, function(msg) {
  //find in db if the sender already have an associated node
  //if not lets create a new one
function assignIdentity(msg, wallet) {
    async.waterfall([
      function(callback) {
        db.find({ user: msg.chat.username }, function (err, docs) {
          callback(null, docs)
        })
      },
      function(docs, callback) {
        console.log(docs)
        if(docs.length === 0) {
          var hdnode = wallet.external.derive(2);
          var newuser = {
            user : msg.chat.username,
            depth : hdnode.depth,
            index: hdnode.index

          }
          callback(null, newuser)
        } else {
          bot.sendMessage(msg.chat.id, 'Hai già un indirizzo, usa quello barbone !').then(function () {
            // reply sent!
          });
        }
      },
      function(newuser, callback) {
        console.log(newuser)

        db.insert(newuser, function (err, newDoc) {
          console.log(newDoc)
          if(err) {
              console.log(err)
              bot.sendMessage(msg.chat.id, 'mi spiace amico ci è stato un errore !').then(function () {
                // reply sent!
              });
          } else {
              bot.sendMessage(msg.chat.id, 'ora puoi scambiarti denara !').then(function () {
                // reply sent!
              });
              console.log('yuppi')
              console.log(newDoc)
          }
        })

      }
    ], function() {
      console.log('end')
    })
}

assignIdentity(msg, wall)


  // var message = '';
  // console.log('qui entra 1')
  // db.find({ user: msg.chat.username }, function (err, docs) {
  //   console.log('qui entra 2')
  //   console.log(docs)
  //   if(docs.length === 0) {
  //     console.log('qui entra 3')
  //     var newuser = {
  //       user : msg.chat.username,
  //       node : 'wall.external.derive(2)'
  //     }
  //     db.insert(newuser, function (err, newDoc) {
  //       if(err) {
  //         console.log(err)
  //       } else {
  //         console.log('yuppi')
  //         console.log(newDoc)
  //       }
  //     });
  //     message = msg.chat.username + ' your address is ' + wall.external.derive(2)
  //   } else {
  //     console.log('qui entra 4')
  //     message = 'you already have an address'
  //   }
  // });
  // console.log('il messaggio')
  // console.log(message)

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
