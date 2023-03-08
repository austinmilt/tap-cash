import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { PublicKey, SolanaWallet } from "../solana/solana";
import { logIn as web3AuthLogIn } from "../solana/web3auth";
import { getMember, saveMember, SaveMemberArgs } from "../api/client";
import { MemberPrivateProfile } from "../shared/member";

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
    const [usdcAddress, setUsdcAddress] = useState<PublicKey | undefined>();

    const getAndUpdateAccountIfNeeded = useCallback(async (profile: SaveMemberArgs) => {
        const savedProfile: MemberPrivateProfile = await getMember({ member: profile.email });
        setEmail(profile.email);
        setName(profile.name);
        setImageUrl(profile.profile);

        if (
            (savedProfile.email !== profile.email) ||
            (savedProfile.name !== profile.name) ||
            (savedProfile.profile !== profile.profile) ||
            (savedProfile.signerAddress.toBase58() !== profile.signerAddress.toBase58())
        ) {
            await saveMember(profile);
            const updatedProfile: MemberPrivateProfile = await getMember({ member: profile.email });
            setUsdcAddress(updatedProfile.usdcAddress);
        }
    }, [setUsdcAddress, setEmail, setName, setImageUrl]);

    const logIn: UserProfileContextState["logIn"] = useCallback(async () => {
        if (loggedIn) return;
        const { user, wallet: userWallet, logOut } = await web3AuthLogIn();

        if (user.userInfo?.email == null) {
            throw new Error("User login did not provide required email address.");
        }

        await getAndUpdateAccountIfNeeded({
            email: user.userInfo.email,
            name: user.userInfo.name,
            profile: user.userInfo.profileImage,
            signerAddress: userWallet.getPublicKey()
        });
        setWallet(userWallet);

        setLoggedIn(userWallet !== undefined);

        //TODO temporarily save user info to device so they dont have to log
        // in every time

        const wrappedLogOut = async () => {
            if (userWallet === undefined) return;
            await logOut();
        }
        setLogOut(() => wrappedLogOut);

    }, [loggedIn, setWallet, getAndUpdateAccountIfNeeded, setLoggedIn, setLogOut]);


    const syncUsdcBalance: UserProfileContextState["syncUsdcBalance"] = useCallback(async () => {
        if (!email)return;
        // TODO check if there's a better place for this
        // (I added here because it was not firing in the login function)
        const memberInfo = await getMember({ member: email });
        setUsdcAddress(memberInfo.usdcAddress);
        console.log('member info', memberInfo);
        if ((wallet !== undefined) && (usdcAddress !== undefined)) {
            const balance = await wallet.getUsdcBalance(usdcAddress);
            console.log(balance);
            setUsdcBalance(balance);
        }
    }, [wallet, usdcAddress, setUsdcBalance]);


    useEffect(() => {
        if (loggedIn) {
            syncUsdcBalance();
        }
    }, [loggedIn]);


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
