'use strict';

const Config = require('../config');
const Utils = require('./util/utils');
const TxHelper = require('./util/txHelper');
const TxModelCreator = require('./util/txModelCreator');
class Builder {

    /**
     * (冷钱包)
     *
     * 构造需要签名的交易内容,得到签名对象后，调用GetSignBytes()方法获取签名字符串
     *
     * @param tx {blockChainThriftModel.Tx} 请求内容
     * @returns {*}
     */
    buildTx(tx) {
        throw new Error("not implement");
    }


    /**
     * (冷钱包)
     *
     * 根据请求内容构造交易并对交易进行签名
     *
     * @param data {*}
     * @param privateKey {string} 交易发送方私钥(hex编码)，冷钱包提供
     * @returns {StdSignature} 交易
     */
    sign(data,privateKey) {
        throw new Error("not implement");
    }

    /**
     * (热钱包)
     *
     * 根据请求内容构造交易并对交易进行签名
     *
     * @param tx {blockChainThriftModel.Tx} 请求内容
     * @param privateKey 发送方账户私钥
     * @returns {StdTx}  交易
     */
    buildAndSignTx(tx, privateKey) {
        throw new Error("not implement");
    }

    /**
     * builder 构建方法，返回具体实现类
     *
     * @param chainName 链名字
     * @returns {*} 具体实现(iris_builder | ethermint_builder)
     */
    static getBuilder(chainName) {
        switch (chainName) {
            case Config.chain.iris: {
                return require('./chains/iris/builder')();
            }
            // case Config.chain.ethermint: {
            //     return require('./chains/ethermint/ethermint_builder')();
            // }
            case Config.chain.cosmos: {
                return require('./chains/cosmos/builder')();
            }
            default: {
                throw new Error("not correct chain");
            }
        }
    };

    /**
     * 将外部请求参数封装为crypto统一类型，与具体业务代码松耦合.由具体子类调用
     *
     * @param tx {blockChainThriftModel.Tx} 传入参数
     * @returns {{acc, to, coins, fees, gas, type}}
     */
    buildParam(tx){
        let convert = function (tx) {
            let memo = tx.memo ? tx.memo : '';
            return new Request(
                tx.chain_id,
                tx.account_number,
                tx.sequence,
                tx.fee, memo,
                tx.msgs,
                tx.publicKey
            );
        };
        return convert(tx);
    }
}

class Request {
    constructor(chain_id, account_number, sequence, fee, memo, msgs, publicKey) {
        if (Utils.isEmpty(chain_id)) {
            throw new Error("chain_id is empty");
        }
        if (account_number < 0) {
            throw new Error("account_number is empty");
        }
        if (sequence < 0) {
            throw new Error("sequence is empty");
        }
        if (Utils.isEmpty(fee)) {
            throw new Error("fee is empty");
        }
        if (!msgs || msgs.length < 1) {
            throw new Error("msgs is empty");
        }

        this.chain_id = chain_id;
        this.account_number = account_number;
        this.sequence = sequence;
        this.fee = fee;
        // this.gas = gas;
        this.memo = memo;
        // this.type = type;
        this.msgs = msgs;
        this.publicKey = publicKey;
    }
}

/**
 * 校验器接口
 *
 */
class Validator{
    ValidateBasic() {
        throw new Error("not implement");
    }
}

/**
 * 签名消息接口
 *
 */

class Msg extends Validator{
    constructor(type) {
        super();
        this.type = type
    }

    getModelClass(){
        throw new Error("not implement");
    }

    getModel(){
        throw new Error("not implement");
    }

    pack(){
        let msg = this.getModel();
        return TxModelCreator.createAnyModel(this.type, msg.serializeBinary());
    }

    unpack(msg_any){
        if (!TxHelper.isAny(msg_any)) {
            throw new Error("msg_any is not instanceof protobuf.Any");
        }
        return this.getModelClass().deserializeBinary(msg_any.getValue());
    }

    GetMsg(){
        throw new Error("not implement");
    }

    GetDisplayContent(){
        throw new Error("not implement");
    }

    ValidateBasic(){
        throw new Error("not implement");
    }
}

module.exports = {Builder,Msg,Validator};