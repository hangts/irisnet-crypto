'use strict';
const Builder = require("../../builder").Builder;
const Old = require('old');
const Bank = require('./bank');
const Stake = require('./stake');
const Distribution = require('./distribution');
const Coinswap = require('./coinswap');
const IrisKeypair = require('./keypair');
const Codec = require("../../util/codec");
const Config = require('../../../config');
const Utils = require("../../util/utils");

const Tx = require('./tx');
const TxHelper = require('../../util/txHelper');

class IrisBuilder extends Builder {

    /**
     * 构造msg结构
     *
     * @param msg  请求内容
     * @returns msg
     */
    createMsg(message){
        let msg = {};
        switch (message.type) {
            case Config.iris.tx.transfer.type: {
                msg = Bank.CreateMsgSend(message.value);
                break;
            }
            case Config.iris.tx.delegate.type: {
                msg = Stake.CreateMsgDelegate(message.value);
                break;
            }
            case Config.iris.tx.undelegate.type: {
                msg = Stake.CreateMsgBeginUnbonding(message.value);
                break;
            }
            case Config.iris.tx.redelegate.type: {
                msg = Stake.CreateMsgBeginRedelegate(message.value);
                break;
            }
            // case Config.iris.tx.withdrawDelegationRewardsAll.type: {
            //     msg = Distribution.CreateMsgWithdrawDelegatorRewardsAll(message.value);
            //     break;
            // }
            case Config.iris.tx.withdrawDelegationReward.type: {
                msg = Distribution.CreateMsgWithdrawDelegatorReward(message.value);
                break;
            } 
            case Config.iris.tx.addLiquidity.type: {
                msg = Coinswap.createMsgAddLiquidity(message.value);
                break;
            } 
            case Config.iris.tx.removeLiquidity.type: {
                msg = Coinswap.createMsgRemoveLiquidity(message.value);
                break;
            } 
            case Config.iris.tx.swapOrder.type: {
                msg = Coinswap.createMsgSwapOrder(message.value);
                break;
            }
            default: {
                throw new Error("not exist tx type");
            }
        }
        return msg;
    }

    /**
     * 构造签名内容
     *
     * @param tx  请求内容
     * @returns {StdTx}
     */
    buildTx(tx) {
        let req = super.buildParam(tx);
        let msgs = req.msgs.map(item=>this.createMsg(item));
        req.msgs = msgs;
        TxHelper.ValidateBasic(req);
        // let signMsg = Bank.NewStdSignMsg(req.chain_id, req.account_number, req.sequence, stdFee, msg, req.memo, req.type);
        // signMsg.ValidateBasic();
        // return Bank.NewStdTx(signMsg);
        return new Tx(req);
    }

    /**
     * 签名交易数据
     *
     * @param stdTx
     * @param privateKey
     * @returns {}
     */
    sign(stdTx, privateKey) {
        if (!stdTx instanceof Tx) {
                throw new Error("stdTx is not instanceof Tx");
        }

        if (!stdTx.hasPublicKey()) {
            console.log('9999999999999999999999');
            let keypair = IrisKeypair.import(privateKey);
            stdTx.setPubKey(keypair.publicKey);
        }

        let sign = IrisKeypair.sign(privateKey, stdTx.getSignDoc());
        stdTx.addSignature(sign);
        return stdTx;
    }

    /**
     * (热钱包)
     *
     * 根据请求内容构造交易并对交易进行签名
     *
     * @param tx  请求内容
     * @param privateKey 发送方账户私钥
     * @returns {StdTx}  交易
     */
    buildAndSignTx(tx, privateKey) {
        let stdTx = this.buildTx(tx);
        let mode = tx.mode ? tx.mode : Config.iris.mode.normal;
        if (mode === Config.iris.mode.normal) {
            if (Utils.isEmpty(privateKey)) {
                throw new Error("privateKey is  empty");
            }
            stdTx = this.sign(stdTx, privateKey);
        }
        return stdTx;
    }
}
module.exports = Old(IrisBuilder);