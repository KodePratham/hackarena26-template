import algosdk from 'algosdk';
import logger from './logger';

const algodToken = process.env.ALGOD_TOKEN || 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const algodServer = process.env.ALGOD_SERVER || 'http://localhost';
const algodPort = process.env.ALGOD_PORT || 4001;

export const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

export const checkAlgorandStatus = async () => {
    try {
        const status = await algodClient.status().do();
        logger.info(`Algorand node connected. Block: ${status['last-round']}`);
        return true;
    } catch (error) {
        logger.warn('Algorand node not reachable. Working in mock mode.');
        return false;
    }
};
