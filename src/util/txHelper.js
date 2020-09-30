
const Utils = require('./utils');
const Codec = require('./codec');
const Config = require('../../config');
const Bech32 = require('bech32');

let Tx_pb = require('../types/cosmos/tx/v1beta1/tx_pb');
let Signing_pb = require('../types/cosmos/tx/signing/v1beta1/signing_pb');
let Crypto_pb = require('../types/cosmos/base/crypto/v1beta1/crypto_pb');
let Coin_pb = require('../types/cosmos/base/v1beta1/coin_pb');
let Any_pb = require('../types/google/protobuf/any_pb');

class TxHelper {
    static getHexPubkey(pubkey){
        if (Codec.Bech32.isBech32(Config.iris.bech32.accPub, pubkey)){
            pubkey = Codec.Bech32.fromBech32(pubkey);
        }
        return pubkey;
    }

    static ValidateBasic(tx) {
        if (Utils.isEmpty(tx.chain_id)) {
            throw new Error("chain_id is empty");
        }
        if (tx.account_number < 0) {
            throw new Error("account_number is empty");
        }
        if (tx.sequence < 0) {
            throw new Error("sequence is empty");
        }
        tx.msgs.forEach(function(msg) {
            msg.ValidateBasic();
        });
    }

    static isSignDoc(signDoc){
        return signDoc instanceof Tx_pb.SignDoc;
    }

    static isAny(value){
        return value instanceof Any_pb.Any;
    }

    static ecodeModelAddress(address){
        if (!address) {
            throw new Error("address is empty");
        }
        let words = Bech32.decode(address,'utf-8').words;
        return Buffer.from(Bech32.fromWords(words));
    }
}

module.exports = TxHelper;