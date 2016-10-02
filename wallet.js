var bitcoin = require('bitcoinjs-lib')
var bip32utils = require('bip32-utils')
var bs58check = require('bs58check')

function Wallet ( external, internal ) {
  var chains
  if (Array.isArray(external)) {
   chains = external
   this.external = chains[0].getParent()
   this.internal = chains[1].getParent()
 } else {
   chains = [new bip32utils.Chain(external), new bip32utils.Chain(internal)]

   this.external = external
   this.internal = internal
 }
 this.account = new bip32utils.Account(chains)
}

function deriveAccount(master, accountIndex) {
    var node = master;
    // purpose'
    node = node.deriveHardened(44);
    // coin_type'
    node = node.deriveHardened(0);
    // account'
    node = node.deriveHardened(accountIndex);
    return node;
}


/**
* Function to create a transaction
* @param utxos: the list of utxos to insert in the transaction
* @param machine: the machine address
* @param user: the user address
* @param profileOpReturn: the profile status of the user
* @param wantedFee: the amount of satoshis tokens to give to miners
* @param tokenAmount: the amount of satoshis tokens to send to machine
* @param node
* @return new unfirmed transaction
**/





Wallet.fromSeedBuffer = function (seed, network) {
  network = network || NETWORKS.bitcoin
  // HD first-level child derivation method should be hardened
  // See https://bitcointalk.org/index.php?topic=405179.msg4415254#msg4415254
  var m = bitcoin.HDNode.fromSeedBuffer(seed, network)
  var standardWallet = deriveAccount(m, 0)
  var external = standardWallet.derive(0)
  var internal = standardWallet.derive(1)
  return new Wallet(external, internal)
}

Wallet.fromSeedHex = function (hex, network) {
  return Wallet.fromSeedBuffer(new Buffer(hex, 'hex'), network)
}

/**
* Helper function for HD wallet structured following BIP32 and BIP44 documents
**/

/* GET ALL ADDRESSES: Return all addresses previously generated from the HD Wallet */
Wallet.prototype.getAllAddresses = function () { return this.account.getAllAddresses() }

/* GET NETWORK: Return the network you're working with */
Wallet.prototype.getNetwork = function () { return this.account.getNetwork() }

/* GET RECEIVE ADDRESS: Return the latest external address generated */
Wallet.prototype.getReceiveAddress = function () { return this.account.getChainAddress(0) }

/* GET CHANGE ADDRESS: Return the latest internal address generated */
Wallet.prototype.getChangeAddress = function () { return this.account.getChainAddress(1) }

/* IS RECEIVE ADDRESS: Return true if the argoument is a valid external address */
Wallet.prototype.isReceiveAddress = function (address) { return this.account.isChainAddress(0, address) }

/* IS CHANGE ADDRESS: Return true if the argoument is a valid internal address */
Wallet.prototype.isChangeAddress = function (address) { return this.account.isChainAddress(1, address) }

/* NEXT RECEIVE ADDRESS: Return the next valid external address */
Wallet.prototype.nextReceiveAddress = function () { return this.account.nextChainAddress(0) }

/* NEXT CHANGE ADDRESS: Return the next valid internal address */
Wallet.prototype.nextChangeAddress = function () { return this.account.nextChainAddress(1) }

/* CONTAINS ADDRESS: Return true if the argoument is a valid address */
Wallet.prototype.containsAddress = function (address) { return this.account.containsAddress(address) }




module.exports.Wallet = Wallet;
