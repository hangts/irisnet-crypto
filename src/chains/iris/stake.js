'use strict';

const Builder = require("../../builder");
const Utils = require('../../util/utils');
const Config = require('../../../config');
const Bech32 = require('bech32');

const Staking_tx_pb = require('../../types/cosmos/staking/v1beta1/tx_pb');
const TxModelCreator = require('../../util/txModelCreator');
const TxHelper = require('../../util/txHelper');

class MsgDelegate extends Builder.Msg {

    constructor(delegator_address, validator_address, amount) {
        super(Config.iris.tx.delegate.prefix);
        this.delegator_address = delegator_address;
        this.validator_address = validator_address;
        this.amount = amount;
    }

    getModelClass(){
        return Staking_tx_pb.MsgDelegate;
    }

    getModel(){
        let msg = new (this.getModelClass())();
        msg.setDelegatorAddress(TxHelper.ecodeModelAddress(this.delegator_address));
        msg.setValidatorAddress(TxHelper.ecodeModelAddress(this.validator_address));
        msg.setAmount(TxModelCreator.createCoinModel(this.amount.denom, this.amount.amount));
        return msg;
    }

    ValidateBasic() {
        if (Utils.isEmpty(this.delegator_address)) {
            throw new Error("delegator_address is empty");
        }

        if (Utils.isEmpty(this.validator_address)) {
            throw new Error("validator_address is empty");
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

class MsgBeginUnbonding extends Builder.Msg {
    constructor(delegator_address, validator_address, amount) {
        super(Config.iris.tx.undelegate.prefix);
        this.delegator_address = delegator_address;
        this.validator_address = validator_address;
        this.amount = amount;
    }

    getModelClass(){
        return Staking_tx_pb.MsgUndelegate;
    }

    getModel(){
        let msg = new (this.getModelClass())();
        msg.setDelegatorAddress(TxHelper.ecodeModelAddress(this.delegator_address));
        msg.setValidatorAddress(TxHelper.ecodeModelAddress(this.validator_address));
        msg.setAmount(TxModelCreator.createCoinModel(this.amount.denom, this.amount.amount));
        return msg;
    }

    ValidateBasic() {
        if (Utils.isEmpty(this.delegator_address)) {
            throw new Error("delegator_address is empty");
        }

        if (Utils.isEmpty(this.validator_address)) {
            throw new Error("validator_address is empty");
        }

        if (Utils.isEmpty(this.amount)) {
            throw new Error("amount  is empty");
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
        //     sharesAmount: this.shares_amount
        // }
    }

    GetDisplayContent(){
        // return {
        //     i18n_tx_type:"i18n_begin_unbonding",
        //     i18n_delegator_addr:this.delegatorAddress,
        //     i18n_validator_addr:this.validatorAddress,
        //     i18n_shares_amount:this.shares_amount,
        // }
    }

}

class MsgBeginRedelegate extends Builder.Msg {

    constructor(delegator_address, validator_src_address, validator_dst_address, amount) {
        super(Config.iris.tx.redelegate.prefix);
        this.delegator_address = delegator_address;
        this.validator_src_address = validator_src_address;
        this.validator_dst_address = validator_dst_address;
        this.amount = amount;
    }

    getModelClass(){
        return Staking_tx_pb.MsgBeginRedelegate;
    }

    getModel(){
        let msg = new (this.getModelClass())();
        msg.setDelegatorAddress(TxHelper.ecodeModelAddress(this.delegator_address));
        msg.setValidatorSrcAddress(TxHelper.ecodeModelAddress(this.validator_src_address));
        msg.setValidatorDstAddress(TxHelper.ecodeModelAddress(this.validator_dst_address));
        msg.setAmount(TxModelCreator.createCoinModel(this.amount.denom, this.amount.amount));
        return msg;
    }

    ValidateBasic() {
        if (Utils.isEmpty(this.delegator_address)) {
            throw new Error("delegator_address is empty");
        }

        if (Utils.isEmpty(this.validator_src_address)) {
            throw new Error("validator_src_address is empty");
        }

        if (Utils.isEmpty(this.validator_dst_address)) {
            throw new Error("validator_dst_address is empty");
        }

        if (Utils.isEmpty(this.amount)) {
            throw new Error("amount is empty");
        }
    }

    GetMsg() {
        // let delegator_key = Bech32.decode(this.delegatorAddress);
        // let delegator_addr = Bech32.fromWords(delegator_key.words);

        // let validator_src_key = Bech32.decode(this.validator_src_addr);
        // let validator_src_addr = Bech32.fromWords(validator_src_key.words);

        // let validator_dst_key = Bech32.decode(this.validator_dst_addr);
        // let validator_dst_addr = Bech32.fromWords(validator_dst_key.words);

        // return {
        //     delegatorAddr: delegator_addr,
        //     validatorSrcAddr: validator_src_addr,
        //     validatorDstAddr: validator_dst_addr,
        //     sharesAmount: this.shares_amount
        // }
    }

    GetDisplayContent(){
        // return {
        //     i18n_tx_type:"i18n_redelegate",
        //     i18n_delegator_addr:this.delegatorAddress,
        //     i18n_validator_src_addr:this.validator_src_addr,
        //     i18n_validator_dst_addr:this.validator_dst_addr,
        //     i18n_shares_amount:this.shares_amount,
        // }
    }
}

module.exports = class Stake {
    static CreateMsgDelegate(msg) {
        return new MsgDelegate(msg.delegatorAddress, msg.validatorAddress, msg.amount);
    }

    static CreateMsgBeginUnbonding(msg) {
        return new MsgBeginUnbonding(msg.delegator_address, msg.validator_address, msg.amount);
    }

    static CreateMsgBeginRedelegate(msg) {
        return new MsgBeginRedelegate(msg.delegator_address, msg.validator_src_address, msg.validator_dst_address, msg.amount);
    };
};

// class Dec {
//     static String(share) {
//         if (share.indexOf(".") === -1) {
//             share = share + ".0000000000"
//         }
//         return share
//     }
// }