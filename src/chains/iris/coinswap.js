const Builder = require("../../builder");
const Config = require('../../../config');
const Bech32 = require('bech32');
const Utils = require('../../util/utils');

const Coinswap_pb = require('../../types/cosmos/coinswap/coinswap_pb');
const TxModelCreator = require('../../util/txModelCreator');
const TxHelper = require('../../util/txHelper');

class MsgSwapOrder extends Builder.Msg{
    constructor(input, output, deadline, isBuyOrder){
        super(Config.iris.tx.swapOrder.prefix);
        this.input = input;
        this.output = output;
        this.deadline = deadline;
        this.isBuyOrder = isBuyOrder;
    }

    getModelClass(){
        return Coinswap_pb.MsgSwapOrder;
    }

    getModel(){
        let msg = new (this.getModelClass())();
        
        let inputModel = new Coinswap_pb.Input();
        inputModel.setAddress(TxHelper.ecodeModelAddress(this.input.address));
        inputModel.setCoin(TxModelCreator.createCoinModel(this.input.coin.denom, this.input.coin.amount));

        let outputModel = new Coinswap_pb.Output();
        outputModel.setAddress(TxHelper.ecodeModelAddress(this.output.address));
        outputModel.setCoin(TxModelCreator.createCoinModel(this.output.coin.denom, this.output.coin.amount));

        msg.setInput(inputModel);
        msg.setOutput(outputModel);
        msg.setDeadline(this.deadline);
        msg.setIsBuyOrder(this.isBuyOrder);
        return msg;
    }

    ValidateBasic() { 
        if (Utils.isEmpty(this.input)) {
            throw new Error("input is  empty");
        }
        if (Utils.isEmpty(this.output)) {
            throw new Error("output is  empty");
        }
        if (Utils.isEmpty(this.deadline)) {
            throw new Error("deadline is  empty");
        }
        if (Utils.isEmpty(this.isBuyOrder)) {
            throw new Error("isBuyOrder is  empty");
        }
    }

    GetMsg() {
        // let sender = Bech32.fromWords(this.input.address);
        // let receiver = Bech32.fromWords(this.output.address);
        // let input = {
        //     address: sender,
        //     coin: this.input.coin
        // };
        // let output = {
        //     address: receiver,
        //     coin: this.output.coin
        // };
        // return {
        //     input: input,
        //     output: output,
        //     deadline: this.deadline,
        //     isBuyOrder: this.isBuyOrder
        // }
    };

    GetDisplayContent() {
        // let sender = Bech32.encode(Config.iris.bech32.accAddr, this.input.address);
        // let receiver = Bech32.encode(Config.iris.bech32.accAddr, this.output.address);
        // return {
        //     i18n_tx_type: "i18n_swap_order",
        //     i18n_input: {
        //         address: sender,
        //         coin: this.input.coin
        //     },
        //     i18n_output: {
        //         address: receiver,
        //         coin: this.output.coin
        //     },
        //     i18n_deadline: this.deadline,
        //     i18n_is_buy_order: this.isBuyOrder
        // }
    };
}

class MsgAddLiquidity extends Builder.Msg{
    constructor(max_token, exact_standard_amt, min_liquidity, deadline, sender){
        super(Config.iris.tx.addLiquidity.prefix);
        this.max_token = max_token;
        this.exact_standard_amt = exact_standard_amt;
        this.min_liquidity = min_liquidity;
        this.deadline = deadline;
        this.sender = sender;
    }

    getModelClass(){
        return Coinswap_pb.MsgAddLiquidity;
    }

    getModel(){
        let msg = new (this.getModelClass())();
        msg.setMaxToken(TxModelCreator.createCoinModel(this.max_token.denom, this.max_token.amount));
        msg.setExactStandardAmt(this.exact_standard_amt);
        msg.setMinLiquidity(this.min_liquidity);
        msg.setDeadline(this.deadline);
        msg.setSender(TxHelper.ecodeModelAddress(this.sender));
        return msg;
    }

    ValidateBasic() { 
        if (Utils.isEmpty(this.max_token)) {
            throw new Error("max_token is  empty");
        }
        if (Utils.isEmpty(this.exact_standard_amt)) {
            throw new Error("exact_standard_amt is  empty");
        }
        if (Utils.isEmpty(this.min_liquidity)) {
            throw new Error("min_liquidity is  empty");
        }
        if (Utils.isEmpty(this.deadline)) {
            throw new Error("deadline is  empty");
        }
        if (Utils.isEmpty(this.sender)) {
            throw new Error("sender is  empty");
        }
    }

    GetMsg() {
        // let sender = Bech32.fromWords(this.sender);
        // return {
        //         maxToken: this.maxToken,
        //         exactIrisAmt: this.exactIrisAmt,
        //         minLiquidity: this.minLiquidity,
        //         deadline: this.deadline,
        //         sender: sender
        // }
    };

    GetDisplayContent() {
        // let sender = Bech32.encode(Config.iris.bech32.accAddr, this.sender);
        // return {
        //     i18n_tx_type: "i18n_add_liquidity",
        //     i18n_max_token: this.maxToken,
        //     i18n_exact_iris_amt: this.exactIrisAmt,
        //     i18n_deadline: this.deadline,
        //     i18n_min_liquidity: this.minLiquidity,
        //     i18n_sender: sender
        // }
    };
}

class MsgRemoveLiquidity extends Builder.Msg{
    constructor(withdraw_liquidity, min_token, min_standard_amt, deadline, sender){
        super(Config.iris.tx.removeLiquidity.prefix);
        this.withdraw_liquidity = withdraw_liquidity;
        this.min_token = min_token;
        this.min_standard_amt = min_standard_amt;
        this.deadline = deadline;
        this.sender = sender;
    }

    getModelClass(){
        return Coinswap_pb.MsgRemoveLiquidity;
    }

    getModel(){
        let msg = new (this.getModelClass())();
        msg.setWithdrawLiquidity(TxModelCreator.createCoinModel(this.withdraw_liquidity.denom, this.withdraw_liquidity.amount));
        msg.setMinToken(this.min_token);
        msg.setMinStandardAmt(this.min_standard_amt);
        msg.setDeadline(this.deadline);
        msg.setSender(TxHelper.ecodeModelAddress(this.sender));
        return msg;
    }

    ValidateBasic() { 
        if (Utils.isEmpty(this.withdraw_liquidity)) {
            throw new Error("withdraw_liquidity is  empty");
        }
        if (Utils.isEmpty(this.min_token)) {
            throw new Error("min_token is  empty");
        }
        if (Utils.isEmpty(this.min_standard_amt)) {
            throw new Error("min_standard_amt is  empty");
        }
        if (Utils.isEmpty(this.deadline)) {
            throw new Error("deadline is  empty");
        }
        if (Utils.isEmpty(this.sender)) {
            throw new Error("sender is  empty");
        }
    }

    GetMsg() {
        // let sender = Bech32.fromWords(this.sender);
        // return {
        //     minToken: this.minToken,
        //     withdrawLiquidity: this.withdrawLiquidity,
        //     minIrisAmt: this.minIrisAmt,
        //     deadline: this.deadline,
        //     sender: sender
        // }
    };

    GetDisplayContent() {
        // let sender = Bech32.encode(Config.iris.bech32.accAddr, this.sender);
        // return {
        //     i18n_tx_type: "i18n_remove_liquidity",
        //     i18n_min_token: this.minToken,
        //     i18n_withdraw_liquidity: this.withdrawLiquidity,
        //     i18n_min_iris_amt: this.minIrisAmt,
        //     i18n_deadline: this.deadline,
        //     i18n_sender: sender
        // }
    };
}

module.exports = class CoinSwap {
    static createMsgAddLiquidity(msg) {
        let maxToken = {
            denom: msg.max_token.denom,
            amount: Utils.toString(msg.max_token.amount),
        };
        let exact_standard_amt = Utils.toString(msg.exact_standard_amt);
        let min_liquidity = Utils.toString(msg.min_liquidity);
        return new MsgAddLiquidity(
            maxToken , 
            exact_standard_amt, 
            min_liquidity,
            Utils.toString(msg.deadline),
            msg.sender
        );
    }

    static createMsgRemoveLiquidity(msg) {
        let withdrawLiquidity = {
            denom: msg.withdraw_liquidity.denom,
            amount: Utils.toString(msg.withdraw_liquidity.amount),
        };
        let min_standard_amt = Utils.toString(msg.min_standard_amt);
        let min_token = Utils.toString(msg.min_token);
        return new MsgRemoveLiquidity(
            withdrawLiquidity,
            min_token,
            min_standard_amt,
            Utils.toString(msg.deadline),
            msg.sender
        );
    }

    static createMsgSwapOrder(msg) {
        let input = {
            address: msg.input.address,
            coin: {
                denom: msg.input.coin.denom,
                amount: Utils.toString(msg.input.coin.amount),
            },
        };
        let output = {
            address: msg.output.address,
            coin: {
                denom: msg.output.coin.denom,
                amount: Utils.toString(msg.output.coin.amount),
            },
        };
        return new MsgSwapOrder(
            input,
            output,
            Utils.toString(msg.deadline),
            msg.isBuyOrder
        );
    }
};