import { web3 } from "@project-serum/anchor";

export interface MemberAccounts {

    /**
     * PublicKey address of the member's wallet used to sign transactions.
     */
    signerAddress: web3.PublicKey;

    /**
     * PublicKey address of the user's USDC associated token account.
     */
    usdcAddress: web3.PublicKey;
}
