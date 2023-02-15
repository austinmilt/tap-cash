import { NavScreen, Navigation } from "../common/navigation";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { View } from "../components/View";
import Web3Auth, { OPENLOGIN_NETWORK, LOGIN_PROVIDER, MFA_LEVELS, MfaLevelType } from "@web3auth/react-native-sdk";
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import { useState } from "react";

interface Props {
    navigation: Navigation;
}

export function Authenticate({ navigation }: Props): JSX.Element {
    return (
        <Screen>
            <View flex center>
                <Button.Primary
                    title="Log In"
                    onPress={() => navigation.navigate(NavScreen.HOME)}
                />
                <Web3AuthButton />
            </View>
        </Screen>
    )
}


// https://web3auth.io/docs/integration-builder?lang=REACT_NATIVE&chain=ETH&evmFramework=WEB3&customAuth=NONE&mfa=DEFAULT&whitelabel=NO&useModal=YES&web3AuthNetwork=TESTNET&rnMode=BARE_RN&stepIndex=6
const scheme = 'tapcash';
const resolvedRedirectUrl = `${scheme}://openlogin/`;
const clientId = "BDDQNk8VwljopX6sICcjhtfdYMsNuh5axKKrAltuJ41EULnR5CFStUsQ20tpuJg2OtrQ3gF7scHTeo3UAgjlfy0";


function Web3AuthButton(): JSX.Element {
    const [key, setKey] = useState<any>();
    const [userInfo, setUserInfo] = useState<any>("");

    const login = async () => {
        try {
            console.log("Logging in");
            const web3auth = new Web3Auth(WebBrowser, {
                clientId,
                network: OPENLOGIN_NETWORK.TESTNET,
            });

            console.log("Step 2", web3auth);
            const info = await web3auth.login({
                redirectUrl: resolvedRedirectUrl,
                mfaLevel: MFA_LEVELS.DEFAULT as MfaLevelType, // Pass on the mfa level of your choice: default, optional, mandatory, none
                loginProvider: LOGIN_PROVIDER.GOOGLE, // Pass on the login provider of your choice: google, facebook, discord, twitch, twitter, github, linkedin, apple, etc.
            });

            console.log("Step 3", info);
            setUserInfo(info);
            setKey(info.privKey);
            console.log("Logged In");
        } catch (e) {
            console.error(e, (e as Error).stack);
            throw e;
        }
    };

    const getChainId = async () => {
        console.log('Getting chain id');
        // const networkDetails = await RPC.getChainId();
        console.log("networkDetails");
    };

    const getAccounts = async () => {
        console.log('Getting account');
        // const address = await RPC.getAccounts(key);
        console.log("address");
    };

    const getBalance = async () => {
        console.log('Fetching balance');
        // const balance = await RPC.getBalance(key);
        console.log("balance");
    };

    const sendTransaction = async () => {
        console.log('Sending transaction');
        // const tx = await RPC.sendTransaction(key);
        console.log("tx");
    };

    const signMessage = async () => {
        console.log('Signing message');
        // const message = await RPC.signMessage(key);
        console.log("message");
    };

    const loggedInView = (
        <View>
            <Button.Primary title="Get User Info" onPress={() => console.log(userInfo)} />
            <Button.Primary title="Get Chain ID" onPress={() => getChainId()} />
            <Button.Primary title="Get Accounts" onPress={() => getAccounts()} />
            <Button.Primary title="Get Balance" onPress={() => getBalance()} />
            <Button.Primary title="Send Transaction" onPress={() => sendTransaction()} />
            <Button.Primary title="Sign Message" onPress={() => signMessage()} />
            <Button.Primary title="Get Private Key" onPress={() => console.log(key)} />
            <Button.Primary title="Log Out" onPress={() => setKey('')} />
        </View>
    );

    const unloggedInView = (
        <View>
            <Button.Primary title="Login with Web3Auth" onPress={login} />
        </View>
    );

    return (
        <View height={1}>
            {key ? loggedInView : unloggedInView}
        </View>
    );
}
