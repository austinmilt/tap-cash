import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { PublicKey, SolanaWallet } from "../solana/solana";
import { useWeb3Auth } from "../solana/web3auth";
import { getMember, saveMember, SaveMemberArgs } from "../api/client";
import { MemberPrivateProfile } from "../shared/member";

export interface UserProfileContextState {
    wallet: SolanaWallet | undefined;
    name: string | undefined;
    email: string | undefined;
    imageUrl: string | undefined;
    loggedIn: boolean;
    usdcBalance: number | null;
    profileReady: boolean;

    loading: boolean;
    error: Error | undefined;

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
    const [loggedIn, setLoggedIn] = useState<UserProfileContextState["loggedIn"]>(false);
    const [usdcBalance, setUsdcBalance] = useState<UserProfileContextState["usdcBalance"]>(null);
    const [usdcAddress, setUsdcAddress] = useState<PublicKey | undefined>();
    const web3authContext = useWeb3Auth();

    const getAndUpdateAccountIfNeeded = useCallback(async (profile: SaveMemberArgs) => {
        let savedProfile: MemberPrivateProfile | undefined;
        try {
            savedProfile = await getMember({ member: profile.email });

        } catch (e) {
            //TODO right now we swallow when the user hasnt been created yet,
            // but it would be better to not rely on an error
        }
        setEmail(profile.email);
        setName(profile.name);
        setImageUrl(profile.profile);
        setUsdcAddress(savedProfile?.usdcAddress);

        if (
            (savedProfile?.email !== profile.email) ||
            (savedProfile?.name !== profile.name) ||
            (savedProfile?.profile !== profile.profile) ||
            (savedProfile?.signerAddress.toBase58() !== profile.signerAddress.toBase58())
        ) {
            await saveMember(profile);
            const updatedProfile: MemberPrivateProfile = await getMember({ member: profile.email });
            setUsdcAddress(updatedProfile.usdcAddress);
        }
    }, [setUsdcAddress, setEmail, setName, setImageUrl]);

    const logIn: UserProfileContextState["logIn"] = useCallback(async () => {
        await web3authContext.logIn();
    }, [web3authContext.logIn]);

    useEffect(() => {
        if (
            (web3authContext.user !== undefined) &&
            (web3authContext.wallet !== undefined) &&
            (!web3authContext.loading)
        ) {
            const user = web3authContext.user;
            const wallet = web3authContext.wallet;
            getAndUpdateAccountIfNeeded({
                email: user.userInfo.email,
                name: user.userInfo.name,
                profile: user.userInfo.profileImage,
                signerAddress: wallet.getPublicKey()
            });
            setLoggedIn(true);
        }
    }, [web3authContext.user, web3authContext.wallet, web3authContext.loading]);

    const syncUsdcBalance: UserProfileContextState["syncUsdcBalance"] = useCallback(async () => {
        const wallet = web3authContext.wallet;
        if ((wallet !== undefined) && (usdcAddress !== undefined)) {
            setUsdcBalance(await wallet.getUsdcBalance(usdcAddress));
        }
    }, [web3authContext.wallet, usdcAddress, setUsdcBalance]);


    useEffect(() => {
        if (loggedIn) {
            syncUsdcBalance();
        }
    }, [loggedIn]);

    const profileReady: boolean = (name !== undefined) &&
        (email !== undefined) &&
        (imageUrl !== undefined) &&
        (web3authContext.wallet !== undefined);

    return (
        <UserProfileContext.Provider value={{
            name: name,
            email: email,
            imageUrl: imageUrl,
            wallet: web3authContext.wallet,
            usdcBalance: usdcBalance,
            loggedIn: loggedIn,
            loading: web3authContext.loading,
            error: web3authContext.error,
            profileReady: profileReady,
            logIn: logIn,
            logOut: web3authContext.logOut,
            syncUsdcBalance: syncUsdcBalance
        }}>
            {props.children}
        </UserProfileContext.Provider>
    );
}
