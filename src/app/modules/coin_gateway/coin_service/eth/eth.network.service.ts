import { NetworkModel } from 'src/app/models/db/network.model';
import { NodeWallet, NetworkServiceInterface } from '../coin_gateway.interface';
import Web3, { Transaction, TransactionReceipt } from 'web3';
import {
  clearTrailingSlash,
  convertCoinAmountFromInt,
  multiplyNumbers,
} from '../../../../helpers/functions';
import { REGEX } from '../../../../helpers/coreconstant';
import { NETWORK_TRANSACTION_FEE_LIMIT } from '../../../../helpers/network_&_coin_constants';

export class ETHNetworkService implements NetworkServiceInterface {
  private network: NetworkModel;
  client: Web3;

  async init(network: NetworkModel): Promise<void> {
    this.network = network;
    this.client = new Web3(`${clearTrailingSlash(this.network.rpc_url)}`);
  }

  createWallet(): NodeWallet {
    const wallet = this.client.eth.accounts.create();
    return {
      pvkey: wallet.privateKey,
      address: wallet.address,
    };
  }

  validateAddress(address: string): boolean {
    return new RegExp(REGEX.ETH_ADDRESS).test(address);
  }

  validateTxHash(txHash: string): boolean {
    return new RegExp(REGEX.ETH_TXHASH).test(txHash);
  }

  async getMaxFee(coinDecimal?: number): Promise<number> {
    const gasPrice = await this.client.eth.getGasPrice();
    const gasLimit = NETWORK_TRANSACTION_FEE_LIMIT[this.network.slug];
    let maxFee = multiplyNumbers(gasLimit, Number(gasPrice));
    if (coinDecimal) {
      maxFee = Number(
        convertCoinAmountFromInt(
          multiplyNumbers(gasLimit, Number(gasPrice)),
          coinDecimal,
        ),
      );
    }
    return maxFee;
  }

  async getTransaction(txHash: string): Promise<Transaction> {
    try {
      const txObj = await this.client.eth.getTransaction(txHash);
      return txObj;
    } catch (e) {
      return null;
    }
  }

  async getConfirmedTransaction(txHash: string): Promise<TransactionReceipt> {
    try {
      const txObj = await this.client.eth.getTransactionReceipt(txHash);
      return txObj;
    } catch (e) {
      return null;
    }
  }

  async getTransactionReceipt(txHash: string): Promise<TransactionReceipt> {
    try {
      const txObj = await this.client.eth.getTransactionReceipt(txHash);
      return txObj;
    } catch (e) {
      return null;
    }
  }

  async getBlockNumber(): Promise<string | number | bigint> {
    return await this.client.eth.getBlockNumber();
  }
}
