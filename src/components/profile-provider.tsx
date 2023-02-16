import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { SolanaWallet } from "../solana/solana";
import { logIn as web3AuthLogIn } from "../solana/web3auth";

export interface UserProfileContextState {
    wallet: SolanaWallet | undefined;
    name: string | undefined;
    email: string | undefined;
    imageUrl: string | undefined;
    loggedIn: boolean;

    logIn: () => Promise<void>;
    logOut: () => Promise<void>;
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
    const [logOut, setLogOut] = useState<UserProfileContextState["logOut"]>(async () => { });

    const logIn: UserProfileContextState["logIn"] = useCallback(async () => {
        if (loggedIn) return;
        const { user, wallet: userWallet, logOut } = await web3AuthLogIn();
        setWallet(userWallet);
        setName(user.userInfo?.name);
        setEmail(user.userInfo?.email);
        setImageUrl(user.userInfo?.profileImage);
        setLoggedIn(userWallet !== undefined);
        setLogOut(async () => {
            if (userWallet === undefined) return;
            await logOut();
        });

    }, [loggedIn, setName, setEmail, setImageUrl, setWallet]);


    return (
        <UserProfileContext.Provider value={{
            name: name,
            email: email,
            imageUrl: imageUrl,
            wallet: wallet,
            loggedIn: loggedIn,
            logIn: logIn,
            logOut: logOut
        }}>
            {props.children}
        </UserProfileContext.Provider>
    );
}
