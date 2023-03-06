import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { SolanaWallet } from "../solana/solana";
import { logIn as web3AuthLogIn } from "../solana/web3auth";
import { saveMember } from "../api/client";

export interface UserProfileContextState {
    wallet: SolanaWallet | undefined;
    name: string | undefined;
    email: string | undefined;
    imageUrl: string | undefined;
    loggedIn: boolean;
    usdcBalance: number | null;

    logIn: () => Promise<void>;
    logOut: () => Promise<void>;
    syncUsdcBalance: () => Promise<void>
}


export const UserProfileContext = createContext<UserProfileContextState>(
    {} as UserProfileContextState
);


export function useUserProfile(): UserProfileContextState {
    return useContext(UserProfileContext);
}

export function UserProfileProvider(props: { children: ReactNode }): JSX.Element {
    const [name, setName] = useState<UserProfileContextState["name"]>();
    const [email, setEmail] = useState<UserProfileContextState["email"]>();
    const [imageUrl, setImageUrl] = useState<UserProfileContextState["imageUrl"]>();
    const [wallet, setWallet] = useState<UserProfileContextState["wallet"]>();
    const [loggedIn, setLoggedIn] = useState<UserProfileContextState["loggedIn"]>(false);
    const [usdcBalance, setUsdcBalance] = useState<UserProfileContextState["usdcBalance"]>(null);
    const [logOut, setLogOut] = useState<UserProfileContextState["logOut"]>(async () => { });

    const logIn: UserProfileContextState["logIn"] = useCallback(async () => {
        if (loggedIn) return;
        const { user, wallet: userWallet, logOut } = await web3AuthLogIn();

        if (user.userInfo?.email == null) {
            throw new Error("User login did not provide required email address.");
        }

        await saveMember({
            email: user.userInfo.email,
            name: user.userInfo.name,
            profile: user.userInfo.profileImage,
            signerAddress: userWallet.getPublicKey()
        });

        setWallet(userWallet);
        setName(user.userInfo?.name);
        setEmail(user.userInfo?.email);
        setImageUrl(user.userInfo?.profileImage);
        setLoggedIn(userWallet !== undefined);

        //TODO temporarily save user info to device so they dont have to log
        // in every time

        const wrappedLogOut = async () => {
            if (userWallet === undefined) return;
            await logOut();
        }
        setLogOut(() => wrappedLogOut);

    }, [loggedIn, setName, setEmail, setImageUrl, setWallet]);


    const syncUsdcBalance: UserProfileContextState["syncUsdcBalance"] = useCallback(async () => {
        if (wallet !== undefined) {
            setUsdcBalance(await wallet.getUsdcBalance());
        }
    }, [wallet]);

    return (
        <UserProfileContext.Provider value={{
            name: name,
            email: email,
            imageUrl: imageUrl,
            wallet: wallet,
            usdcBalance: usdcBalance,
            loggedIn: loggedIn,
            logIn: logIn,
            logOut: logOut,
            syncUsdcBalance: syncUsdcBalance
        }}>
            {props.children}
        </UserProfileContext.Provider>
    );
}
