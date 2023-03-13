import Web3Auth, { LOGIN_PROVIDER, MFA_LEVELS, State } from "@web3auth/react-native-sdk";
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import { SolanaWallet } from "../solana/solana";
import { Buffer } from "buffer";
import { SOLANA_RPC_URL, WEB3_AUTH_CLIENT_ID, WEB3_AUTH_NETWORK } from "../common/constants";
import { useCallback, useEffect, useRef, useState } from "react";

global.Buffer = global.Buffer || Buffer

// https://web3auth.io/docs/integration-builder?lang=REACT_NATIVE&chain=ETH&evmFramework=WEB3&customAuth=NONE&mfa=DEFAULT&whitelabel=NO&useModal=YES&web3AuthNetwork=TESTNET&rnMode=BARE_RN&stepIndex=6
const scheme = 'tapcash';
const resolvedRedirectUrl = `${scheme}://openlogin/`;

interface Context {
    logIn: () => Promise<void>;
    logOut: () => Promise<void>;
    user: State | undefined;
    wallet: SolanaWallet | undefined;
    loading: boolean;
    error: Error | undefined;
}


export function useWeb3Auth(): Context {
    const [user, setUser] = useState<Context['user']>();
    const [wallet, setWallet] = useState<Context['wallet']>();
    const [loading, setLoading] = useState<Context['loading']>(false);
    const [error, setError] = useState<Context['error']>();
    const [logOut, setLogOut] = useState<Context['logOut']>(() => new Promise(() => { }));
    const web3Auth = useRef<Web3Auth>();

    useEffect(() => {
        // dont know why I'm using a ref, just following the web3auth example
        // https://github.com/Web3Auth/web3auth-react-native-sdk/blob/master/example/App.tsx
        const newAuth: Web3Auth = new Web3Auth(WebBrowser, {
            clientId: WEB3_AUTH_CLIENT_ID,
            network: WEB3_AUTH_NETWORK,
            whiteLabel: {
                name: "Tap",
                defaultLanguage: "en",
            }
        });
        web3Auth.current = newAuth;
        setLogOut(() => () => newAuth.logout({ redirectUrl: resolvedRedirectUrl }))
    }, []);

    const logIn: Context['logIn'] = useCallback(async () => {
        if (web3Auth.current !== undefined) {
            setLoading(true);
            try {
                const info: State = await web3Auth.current.login({
                    redirectUrl: resolvedRedirectUrl,
                    mfaLevel: MFA_LEVELS.NONE,
                    loginProvider: LOGIN_PROVIDER.GOOGLE
                });

                if (info?.ed25519PrivKey === undefined) {
                    setError(new Error("Missing required ed25519 private key for login."));
                    return;
                }

                setWallet(SolanaWallet.of(info.ed25519PrivKey, SOLANA_RPC_URL));
                setUser(info);

            } catch (e) {
                setError(e as Error);

            } finally {
                setLoading(false);
            }
        }
    }, [web3Auth.current]);

    return {
        user: user,
        loading: loading,
        wallet: wallet,
        error: error,
        logIn: logIn,
        logOut: logOut
    }
}
