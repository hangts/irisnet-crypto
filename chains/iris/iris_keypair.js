'use strict';

const Hex = require("../../util/hex");
const Sha256 = require("sha256");
const RIPEMD160 = require('ripemd160');
const Bip39 = require('bip39');
const Random = require('randombytes');
const Secp256k1 = require('secp256k1');
const Bignum = require('bignum');
const Constants = require('./constants');
const Codec = require('./amino');

class CosmosKeypair {

    static getPrivateKeyFromSecret(mnemonicS) {
        let seed = Bip39.mnemonicToSeed(mnemonicS);
        let master = ComputeMastersFromSeed(seed);
        let derivedPriv = DerivePrivateKeyForPath(master.secret,master.chainCode,Constants.AminoKey.FullFundraiserPath);
        return derivedPriv;
    }

    static sign(private_key, msg) {

        //将签名字符串使用Sha256构造32位byte数组
        let sigByte = Buffer.from(JSON.stringify(msg));
        let sig32 = Buffer.from(Sha256(sigByte,{ asBytes: true }));

        //对数据签名
        let prikeyArr = new Uint8Array(Hex.hexToBytes(private_key));
        let sig = Secp256k1.sign(sig32,prikeyArr);
        let signature = Buffer.from(Serialize(sig.signature));

        //将签名结果加上amino编码前缀(irishub反序列化需要)
        signature = Codec.MarshalBinary(Constants.AminoKey.SignatureSecp256k1_prefix,signature);

        console.log(JSON.stringify(signature));
        return signature
    }

    static getAddress(publicKey) {
        if (publicKey.length > 33){
            //去掉amino编码前缀
            publicKey = publicKey.slice(5,publicKey.length)
        }
        let hmac = Sha256(publicKey);
        let b = Buffer.from(Hex.hexToBytes(hmac));
        let addr = new RIPEMD160().update(b);
        return addr.digest('hex').toUpperCase();
    }

    static create() {
        //生成24位助记词
        let entropySize = 24 * 11 - 8;
        let entropy = Random(entropySize / 8);
        let mnemonicS = Bip39.entropyToMnemonic(entropy);

        //生成私钥
        let secretKey = this.getPrivateKeyFromSecret(mnemonicS);

        //构造公钥
        let pubKey = Secp256k1.publicKeyCreate(secretKey);
        //将公钥加上amino编码前缀(irishub反序列化需要)
        pubKey = Codec.MarshalBinary(Constants.AminoKey.PubKeySecp256k1_prefix,pubKey);

        return {
            "secret": mnemonicS,
            "address": this.getAddress(pubKey),
            "privateKey": Hex.bytesToHex(secretKey),
            "publicKey": Hex.bytesToHex(pubKey)
        };
    }

    static recover(mnemonic){
        //生成私钥
        let secretKey = this.getPrivateKeyFromSecret(mnemonic);
        //构造公钥
        let pubKey = Secp256k1.publicKeyCreate(secretKey);
        //将公钥加上amino编码前缀(irishub反序列化需要)
        pubKey = Codec.MarshalBinary(Constants.AminoKey.PubKeySecp256k1_prefix,pubKey);

        return {
            "secret": mnemonic,
            "address": this.getAddress(pubKey),
            "privateKey": Hex.bytesToHex(secretKey),
            "publicKey": Hex.bytesToHex(pubKey)
        };
    }

    static import(secretKey){
        let secretBytes = Buffer.from(secretKey,"hex");
        //构造公钥
        let pubKey = Secp256k1.publicKeyCreate(secretBytes);
        //将公钥加上amino编码前缀(irishub反序列化需要)
        pubKey = Codec.MarshalBinary(Constants.AminoKey.PubKeySecp256k1_prefix,pubKey);
        return {
            "address": this.getAddress(pubKey),
            "privateKey": secretKey,
            "publicKey": Hex.bytesToHex(pubKey)
        };
    }

    static isValidAddress(address) {
        return /^[0-9a-fA-F]{40}$/i.test(address);
    }

    static isValidPrivate(privateKey) {
        return /^[0-9a-fA-F]{32}$/i.test(privateKey);
    }
}

function ComputeMastersFromSeed(seed) {
    let masterSecret = Buffer.from("Bitcoin seed");
    let master = i64(masterSecret,seed);
    return master
}
function DerivePrivateKeyForPath(privKeyBytes, chainCode, path) {
    let data = privKeyBytes;
    let parts = path.split("/");
    parts.forEach(function (part) {
        let harden = part.slice(part.length-1,part.length) === "'";
        if (harden) {
            part = part.slice(0,part.length -1);
        }
        let idx = parseInt(part)
        let json = derivePrivateKey(data, chainCode, idx, harden);
        data = json.data;
        chainCode = json.chainCode;
    });
    let derivedKey = data;
    return derivedKey
}

function i64(key , data) {
    let createHmac = require('create-hmac');
    let hmac = createHmac('sha512', key);
    hmac.update(data); //optional encoding parameter
    let i = hmac.digest(); // synchronously get result with optional encoding parameter
    return {
        secret : i.slice(0,32),
        chainCode : i.slice(32,i.length)
    }
}

function derivePrivateKey(privKeyBytes, chainCode, index, harden) {
    let data;
    let indexBuffer = Buffer.from([index]);
    if(harden){
        indexBuffer = Bignum(index).or(Bignum(0x80000000)).toBuffer();
        let privKeyBuffer = Buffer.from(privKeyBytes);
        data = Buffer.from([0]);
        data = Buffer.concat([data,privKeyBuffer]);
    }else{
        const pubKey = Secp256k1.publicKeyCreate(privKeyBytes);
        // TODO
        if (index ==0){
            indexBuffer = Buffer.from([0,0,0,0]);
        }
        data = pubKey
    }
    data = Buffer.concat([data,indexBuffer]);
    let i64P = i64(chainCode, Uint8Array.from(data));
    let aInt = Bignum.fromBuffer(privKeyBytes);
    let bInt = Bignum.fromBuffer(i64P.secret);
    let x = addScalars(aInt, bInt);

    return {
        data : x.toBuffer(),
        chainCode : i64P.chainCode
    }
}

function addScalars(a,b) {
    let c = a.add(b);
    const bn = require('secp256k1/lib/js/bn/index');
    let n = bn.n.toBuffer();
    let x = c.mod(Bignum.fromBuffer(n));
    return x
}

function Serialize(sig) {
    var sigObj = {r: sig.slice(0, 32), s: sig.slice(32, 64)};
    const SignatureFun = require('elliptic/lib/elliptic/ec/signature');
    let signature = new SignatureFun(sigObj);
    return signature.toDER();
}

module.exports = CosmosKeypair;