'use strict';

const Builder = require("../../builder");
const Utils = require('../../util/utils');
const Config = require('../../../config');
const Bech32 = require('bech32');

const bank_tx_pb = require('../../types/cosmos/bank/v1beta1/tx_pb');
const bank_pb = require('../../types/cosmos/bank/v1beta1/tx_pb');
const TxModelCreator = require('../../util/txModelCreator');
const TxHelper = require('../../util/txHelper');

class MsgSend extends Builder.Msg {

    constructor(from_address, to_address, amount) {
        super(Config.iris.tx.transfer.prefix);
        this.from_address = from_address;
        this.to_address = to_address;
        this.amount = amount;
    }

    getModelClass(){
        return bank_tx_pb.MsgSend;
    }

    getModel(){
        let msg = new (this.getModelClass())();
        msg.setFromAddress(this.from_address);
        msg.setToAddress(this.to_address);
        this.amount.forEach((item)=>{
            msg.addAmount(TxModelCreator.createCoinModel(item.denom, item.amount));
        });
        return msg;
    }

    ValidateBasic() {
        if (Utils.isEmpty(this.from_address)) {
            throw new Error("from_address is empty");
        }

        if (Utils.isEmpty(this.to_address)) {
            throw new Error("to_address is empty");
        }

        if (Utils.isEmpty(this.amount)) {
            throw new Error("amount must great than 0");
        }
    }

    GetMsg() {
        // let delegator_key = Bech32.decode(this.delegatorAddress);
        // let delegator_addr = Bech32.fromWords(delegator_key.words);

        // let validator_key = Bech32.decode(this.validatorAddress);
        // let validator_addr = Bech32.fromWords(validator_key.words);

        // return {
        //     delegatorAddr: delegator_addr,
        //     validatorAddr: validator_addr,
        //     delegation: this.delegation
        // }
    }

    GetDisplayContent(){
        // return {
        //     i18n_tx_type:"i18n_delegate",
        //     i18n_delegator_addr:this.delegatorAddress,
        //     i18n_validator_addr:this.validatorAddress,
        //     i18n_amount:this.amount,
        // }
    }
}

class MsgMultiSend extends Builder.Msg {
    constructor(inputs, outputs) {
        super(Config.iris.tx.multiSend.prefix);
        this.inputs = inputs;
        this.outputs = outputs;
    }

    getModelClass(){
        return bank_tx_pb.MsgMultiSend;
    }

    getModel(){
        let msg = new (this.getModelClass())();
        this.inputs.forEach((item)=>{
            let input = new bank_pb.Input();
            input.setAddress(item.address);
            item.coins.forEach((coin)=>{
                input.addCoins(TxModelCreator.createCoinModel(coin.denom, coin.amount));
            });
            msg.addInputs(input);
        });
        this.outputs.forEach((item)=>{
            let output = new bank_pb.Output();
            output.setAddress(item.address);
            item.coins.forEach((coin)=>{
                outputs.addCoins(TxModelCreator.createCoinModel(coin.denom, coin.amount));
            });
            msg.addOutputs(output);
        });
        return msg;
    }

    ValidateBasic() {
        if (Utils.isEmpty(this.inputs)) {
            throw new Error("inputs is  empty");
        }
        if (Utils.isEmpty(this.outputs)) {
            throw new Error("outputs is  empty");
        }
    }

    GetMsg() {
        // let inputs = [];
        // let outputs = [];

        // this.inputs.forEach(function(item) {
        //     const BECH32 = require('bech32');
        //     let ownKey = BECH32.decode(item.address);
        //     let addrHex = BECH32.fromWords(ownKey.words);
        //     inputs.push({
        //         address: addrHex,
        //         coins: item.coins
        //     })
        // });

        // this.outputs.forEach(function(item) {
        //     const BECH32 = require('bech32');
        //     let ownKey = BECH32.decode(item.address);
        //     let addrHex = BECH32.fromWords(ownKey.words);
        //     outputs.push({
        //         address: addrHex,
        //         coins: item.coins
        //     })
        // });
        // return {
        //     input: inputs,
        //     output: outputs
        // }
    }

    GetDisplayContent(){
        // return {
        //     i18n_tx_type:"i18n_transfer",
        //     i18n_from:this.inputs[0].address,
        //     i18n_to:this.outputs[0].address,
        //     i18n_amount:this.outputs[0].coins,
        // }
    }

}

module.exports = class Bank {
    static CreateMsgSend(msg) {
        return new MsgSend(msg.from_address, msg.to_address, msg.amount);
    }

    static CreateMsgMultiSend(msg) {
        return new MsgMultiSend(msg.inputs, msg.outputs);
    }
};
