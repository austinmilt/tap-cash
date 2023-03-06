import Web3Auth, { LOGIN_PROVIDER, MFA_LEVELS, MfaLevelType, State } from "@web3auth/react-native-sdk";
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import { SolanaWallet } from "../solana/solana";
import { Buffer } from "buffer";
import { SOLANA_RPC_URL, WEB3_AUTH_CLIENT_ID, WEB3_AUTH_NETWORK } from "../common/constants";

global.Buffer = global.Buffer || Buffer

// https://web3auth.io/docs/integration-builder?lang=REACT_NATIVE&chain=ETH&evmFramework=WEB3&customAuth=NONE&mfa=DEFAULT&whitelabel=NO&useModal=YES&web3AuthNetwork=TESTNET&rnMode=BARE_RN&stepIndex=6
const scheme = 'tapcash';
const resolvedRedirectUrl = `${scheme}://openlogin/`;

interface LogInResult {
    user: State;
    wallet: SolanaWallet;
    logOut: () => Promise<void>;
}

const web3auth: Web3Auth = new Web3Auth(WebBrowser, {
    clientId: WEB3_AUTH_CLIENT_ID,
    network: WEB3_AUTH_NETWORK,
});

export async function logIn(): Promise<LogInResult> {

    const info: State = await web3auth.login({
        redirectUrl: resolvedRedirectUrl,
        mfaLevel: MFA_LEVELS.DEFAULT as MfaLevelType,
        loginProvider: LOGIN_PROVIDER.GOOGLE,
    });

    if (info.ed25519PrivKey === undefined) {
        throw new Error("Missing required ed25519 private key for login.");
    }
    const wallet: SolanaWallet = SolanaWallet.of(info.ed25519PrivKey, SOLANA_RPC_URL);

    return {
        user: info,
        wallet: wallet,
        logOut: () => web3auth.logout({ redirectUrl: resolvedRedirectUrl })
    };
}
