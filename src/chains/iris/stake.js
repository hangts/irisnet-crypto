'use strict';

const Builder = require("../../builder");
const Utils = require('../../util/utils');
const Amino = require('../base');
const Config = require('../../../config');
const Bech32 = require('bech32');

const Staking_tx_pb = require('../../types/cosmos/staking/v1beta1/tx_pb');
const TxModelCreator = require('../../util/txModelCreator');
const TxHelper = require('../../util/txHelper');

class MsgDelegate extends Builder.Msg {

    constructor(delegatorAddress, validatorAddress, amount) {
        super(Config.iris.tx.delegate.prefix);
        this.delegatorAddress = delegatorAddress;
        this.validatorAddress = validatorAddress;
        this.amount = amount;

        // let Msg = new Staking_tx_pb.MsgDelegate();
        // Msg.setDelegatorAddress(Buffer.from(Bech32.fromWords(del_words)));
        // Msg.setValidatorAddress(Buffer.from(Bech32.fromWords(val_words)));
        // Msg.setAmount(amount_delegate);
    }

    getModelClass(){
        return Staking_tx_pb.MsgDelegate;
    }

    getModel(){
        let msg = new (this.getModelClass())();
        msg.setDelegatorAddress(TxHelper.ecodeModelAddress(this.delegatorAddress));
        msg.setValidatorAddress(TxHelper.ecodeModelAddress(this.validatorAddress));
        msg.setAmount(TxModelCreator.createCoinModel(this.amount.denom, this.amount.amount));
        return msg;
    }

    ValidateBasic() {
        if (Utils.isEmpty(this.delegatorAddress)) {
            throw new Error("delegatorAddress is empty");
        }

        if (Utils.isEmpty(this.validatorAddress)) {
            throw new Error("validatorAddress is empty");
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
    constructor(delegator_addr, validator_addr, shares_amount) {
        super(Config.iris.tx.undelegate.prefix);
        this.delegatorAddress = delegator_addr;
        this.validatorAddress = validator_addr;
        this.shares_amount = shares_amount;
    }

    GetSignBytes() {
        let msg = {
            "delegator_addr": this.delegatorAddress,
            "validator_addr": this.validatorAddress,
            "shares_amount": this.shares_amount
        };
        return Utils.sortObjectKeys(msg)
    }

    ValidateBasic() {
        if (Utils.isEmpty(this.delegatorAddress)) {
            throw new Error("delegator_addr is empty");
        }

        if (Utils.isEmpty(this.validatorAddress)) {
            throw new Error("validator_addr is empty");
        }

        if (Utils.isEmpty(this.shares_amount)) {
            throw new Error("shares must great than 0");
        }
    }

    Type() {
        return Config.iris.tx.undelegate.prefix;
    }

    GetMsg() {
        let delegator_key = Bech32.decode(this.delegatorAddress);
        let delegator_addr = Bech32.fromWords(delegator_key.words);

        let validator_key = Bech32.decode(this.validatorAddress);
        let validator_addr = Bech32.fromWords(validator_key.words);

        return {
            delegatorAddr: delegator_addr,
            validatorAddr: validator_addr,
            sharesAmount: this.shares_amount
        }
    }

    GetDisplayContent(){
        return {
            i18n_tx_type:"i18n_begin_unbonding",
            i18n_delegator_addr:this.delegatorAddress,
            i18n_validator_addr:this.validatorAddress,
            i18n_shares_amount:this.shares_amount,
        }
    }

}

class MsgBeginRedelegate extends Builder.Msg {

    constructor(delegator_addr, validator_src_addr, validator_dst_addr, shares_amount) {
        super(Config.iris.tx.redelegate.prefix);
        this.delegatorAddress = delegator_addr;
        this.validator_src_addr = validator_src_addr;
        this.validator_dst_addr = validator_dst_addr;
        this.shares_amount = shares_amount;
    }

    GetSignBytes() {
        let msg = {
            "delegator_addr": this.delegatorAddress,
            "validator_src_addr": this.validator_src_addr,
            "validator_dst_addr": this.validator_dst_addr,
            "shares": this.shares_amount
        };
        return Utils.sortObjectKeys(msg);
    }

    ValidateBasic() {
        if (Utils.isEmpty(this.delegatorAddress)) {
            throw new Error("delegator_addr is empty");
        }

        if (Utils.isEmpty(this.validator_src_addr)) {
            throw new Error("validator_src_addr is empty");
        }

        if (Utils.isEmpty(this.validator_dst_addr)) {
            throw new Error("validator_dst_addr is empty");
        }

        if (Utils.isEmpty(this.shares_amount)) {
            throw new Error("shares_amount is empty");
        }

    }

    Type() {
        return Config.iris.tx.redelegate.prefix;
    }

    GetMsg() {
        let delegator_key = Bech32.decode(this.delegatorAddress);
        let delegator_addr = Bech32.fromWords(delegator_key.words);

        let validator_src_key = Bech32.decode(this.validator_src_addr);
        let validator_src_addr = Bech32.fromWords(validator_src_key.words);

        let validator_dst_key = Bech32.decode(this.validator_dst_addr);
        let validator_dst_addr = Bech32.fromWords(validator_dst_key.words);

        return {
            delegatorAddr: delegator_addr,
            validatorSrcAddr: validator_src_addr,
            validatorDstAddr: validator_dst_addr,
            sharesAmount: this.shares_amount
        }
    }

    GetDisplayContent(){
        return {
            i18n_tx_type:"i18n_redelegate",
            i18n_delegator_addr:this.delegatorAddress,
            i18n_validator_src_addr:this.validator_src_addr,
            i18n_validator_dst_addr:this.validator_dst_addr,
            i18n_shares_amount:this.shares_amount,
        }
    }
}

module.exports = class Stake {
    static CreateMsgDelegate(msg) {
        return new MsgDelegate(msg.delegatorAddress, msg.validatorAddress, msg.amount);
    }

    static CreateMsgBeginUnbonding(req) {
        let shares = Dec.String(req.msg.shares_amount);
        let msg = new MsgBeginUnbonding(req.from, req.msg.validator_addr, shares);
        return msg;
    }

    static CreateMsgBeginRedelegate(req) {
        let shares = Dec.String(req.msg.shares_amount);
        let msg = new MsgBeginRedelegate(req.from, req.msg.validator_src_addr, req.msg.validator_dst_addr, shares);
        return msg;
    };
};

class Dec {
    static String(share) {
        if (share.indexOf(".") === -1) {
            share = share + ".0000000000"
        }
        return share
    }
}