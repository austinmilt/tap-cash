import Web3Auth, { OPENLOGIN_NETWORK, LOGIN_PROVIDER, MFA_LEVELS, MfaLevelType, State } from "@web3auth/react-native-sdk";
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import { SolanaWallet } from "../solana/solana";

// https://web3auth.io/docs/integration-builder?lang=REACT_NATIVE&chain=ETH&evmFramework=WEB3&customAuth=NONE&mfa=DEFAULT&whitelabel=NO&useModal=YES&web3AuthNetwork=TESTNET&rnMode=BARE_RN&stepIndex=6
const scheme = 'tapcash';
const resolvedRedirectUrl = `${scheme}://openlogin/`;
const clientId = "BDDQNk8VwljopX6sICcjhtfdYMsNuh5axKKrAltuJ41EULnR5CFStUsQ20tpuJg2OtrQ3gF7scHTeo3UAgjlfy0";

interface LogInResult {
    user: State;
    wallet: SolanaWallet;
    logOut: () => Promise<void>;
}

export async function logIn(): Promise<LogInResult> {

    const web3auth: Web3Auth = new Web3Auth(WebBrowser, {
        clientId,
        network: OPENLOGIN_NETWORK.TESTNET,
    });

    const info: State = await web3auth.login({
        redirectUrl: resolvedRedirectUrl,
        mfaLevel: MFA_LEVELS.DEFAULT as MfaLevelType,
        loginProvider: LOGIN_PROVIDER.GOOGLE,
    });

    if (info.ed25519PrivKey === undefined) {
        throw new Error("Missing required ed25519 private key for login.");
    }
    //TODO set RPC based on env
    const wallet: SolanaWallet = SolanaWallet.devnet(info.ed25519PrivKey);

    return {
        user: info,
        wallet: wallet,
        logOut: () => web3auth.logout({})
    };
}
