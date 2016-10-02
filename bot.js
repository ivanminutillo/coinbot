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
            index: hdnode.index,
            address : hdnode.keyPair.getAddress()

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
              bot.sendMessage(msg.chat.id, 'hey ora hai tutto quello che ti serve per scambiarti denara !').then(function () {
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
      console.log(docs)
      console.log(docs[0].address)
      bot.sendMessage(msg.chat.id, 'ecco il tuo indirizzo ' + docs[0].address ).then(function () {
    })};
    },
  ], function() {
    console.log('end')
  })
}




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
