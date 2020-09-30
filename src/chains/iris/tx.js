'use strict';

const TxSerializer = require("./tx/tx_serializer");
const Base64 = require('base64-node');

let Tx_pb = require('../../types/cosmos/tx/v1beta1/tx_pb');
const TxModelCreator = require('../../util/txModelCreator');

module.exports = class StdTx {
    constructor(properties) {
        let {msgs, memo, fee, sequence, account_number, chain_id, publicKey} = properties;
        this.txData = properties;

        this.body = TxModelCreator.createBodyModel(msgs, memo, 0);
        this.authInfo = TxModelCreator.createAuthInfoModel(fee, sequence, publicKey);
        this.signatures = [];
    }

    /**
     * 导入 signature
     * @param {[string]} signature base64
     */
    addSignature(signature){
        if (!signature || !signature.length) {
            throw new Error("signature is  empty");
        }
        this.signatures.push(signature);
    }

    /**
     * 导入public key
     * @param {[string]} pubkey   bech32/hex 
     * @param {optional [number]} sequence 
     */
    setPubKey(pubkey, sequence){
        sequence = sequence || this.txData.sequence;
        let signerInfo = TxModelCreator.createSignerInfoModel(sequence, pubkey);
        this.authInfo.addSignerInfos(signerInfo);
    }

    /**
     *  获取tx SignDoc 用于签名
     * @returns SignDoc  protobuf.Tx.SignDoc 
     */
    getSignDoc(){
        if (!this.hasPubKey()) {
            throw new Error("please set pubKey");
        }
        let signDoc = new Tx_pb.SignDoc();
        signDoc.setBodyBytes(this.body.serializeBinary());
        signDoc.setAuthInfoBytes(this.authInfo.serializeBinary());
        signDoc.setAccountNumber(String(this.txData.account_number));
        signDoc.setChainId(this.txData.chain_id);
        return signDoc;
    }

    /**
     *  是否已导入public key
     * @returns true/false
     */
    hasPubKey(){
        return this.authInfo.getSignerInfosList().length > 0;
    }

    /**
     *  用于rpc发送交易
     *  可以直接将data提交到rpc broadcast_tx_commit
     * @returns base64 string
     */
    getData() {
        let tx = new Tx_pb.Tx();
        tx.setBody(this.body);
        tx.setAuthInfo(this.authInfo);
        this.signatures.forEach((signature)=>{
            tx.addSignatures(signature);
        })
        return Buffer.from(tx.serializeBinary()).toString('base64');
    }

    /**
     *  用于计算交易hash和签名后的交易内容(base64编码)
     *  可以直接将data提交到irishub的/txs接口
     * @returns {{data: *, hash: *}}
     * @constructor
     */
    hash() {
        // let result = TxSerializer.encode(this);
        // return {
        //     data: Base64.encode(result.data),
        //     hash: result.hash
        // }
    }

    /**
     *  获取tx信息
     * @returns tx info
     */
    getDisplayContent(){
        // let msg = this.msgs[0];
        // let content = msg.GetDisplayContent();
        // content.i18n_fee = this.fee.amount;
        // return content

        let tx = new Tx_pb.Tx();
        tx.setBody(this.body);
        tx.setAuthInfo(this.authInfo);
        this.signatures.forEach((signature)=>{
            tx.addSignatures(signature);
        })
        return JSON.stringify(tx.toObject());
    }
}