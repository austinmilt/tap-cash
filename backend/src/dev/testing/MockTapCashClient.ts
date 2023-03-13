import { Keypair, PublicKey } from "../../helpers/solana";
import { MEMBER_SEED, TAPCASH_PROGRAM_ID } from "../../program/constants";
import { SendTokensArgs, TapCashClient, TransactionDetail } from "../../program/sdk";
import * as anchor from "@project-serum/anchor";
import { IDL, TapCash } from "../../types/tap-cash";
import { v4 as uuid } from "uuid";

interface Account {
    balance: number;
}

export class MockTapCashClient implements TapCashClient {
    private readonly accounts: Map<string, Account> = new Map();
    private readonly ataToUserId: Map<string, string> = new Map();
    private readonly bankAuth: Keypair = Keypair.generate();
    private readonly program: anchor.Program<TapCash> = new anchor.Program(
        IDL as unknown as TapCash,
        TAPCASH_PROGRAM_ID,
        {} as anchor.AnchorProvider
    );
    private readonly activity: TransactionDetail[] = [];

    private constructor() {

    }

    public static make(): MockTapCashClient {
        return new MockTapCashClient();
    }

    public getMemberAccount(userId: PublicKey): Account | undefined {
        return this.accounts.get(userId.toBase58());
    }

    public async initializeNewMember(userId: PublicKey): Promise<PublicKey> {
        return this.initializeNewMemberWithBalance(userId, 0);
    }

    public setMemberBalance(userId: PublicKey, balance: number): void {
        this.accounts.set(userId.toBase58(), {
            ...this.accounts.get(userId.toBase58()),
            balance: balance
        });
    }

    public getMemberIdFromAta(ataAddress: PublicKey): PublicKey | undefined {
        const id: string | undefined = this.ataToUserId.get(ataAddress.toBase58());
        return id === undefined ? undefined : new PublicKey(id);
    }

    public initializeNewMemberWithBalance(userId: PublicKey, balance: number): PublicKey {
        this.accounts.set(userId.toBase58(), { balance: balance });
        const ata: PublicKey = this.getMemberAta(userId);
        this.ataToUserId.set(ata.toBase58(), userId.toBase58());
        return ata;
    }

    public async sendTokens(args: SendTokensArgs): Promise<string> {
        const recipientId: string | undefined = this.ataToUserId.get(args.destinationAta.toBase58());
        if (recipientId == null) {
            throw new Error("Destination member account has not been initialized: " + args.destinationAta.toBase58());
        }
        const senderId: PublicKey = args.fromMember.publicKey;
        const amount: number = args.amount;

        const senderAccount: Account | undefined = this.accounts.get(senderId.toBase58());
        if (senderAccount == null) throw new Error("Sender is not a member " + senderId.toBase58());

        const recipientAccount: Account | undefined = this.accounts.get(recipientId);
        if (recipientAccount == null) throw new Error("Sender is not a member " + recipientId);

        if (senderAccount.balance < amount) throw new Error("Member has insufficient balance " + senderId.toBase58());

        this.accounts.set(senderId.toBase58(), {
            ...senderAccount,
            balance: senderAccount.balance - amount
        });

        this.accounts.set(recipientId, {
            ...recipientAccount,
            balance: recipientAccount.balance + amount
        });

        this.activity.push({
            bankChange: 0,
            otherPartyChange: amount,
            memberChange: -amount,
            otherPartyAtaAddress: this.getMemberAta(new PublicKey(recipientId)),
            memberAtaAddress: this.getMemberAta(new PublicKey(senderId)),
            unixTimestamp: Math.floor((new Date().getTime()) / 1000)
        });

        return uuid();
    }

    public async getRecentActivity(memberAtaAddress: PublicKey, maxNumberTx: number): Promise<TransactionDetail[]> {
        const results: TransactionDetail[] = [];
        const ataAddressString: string = memberAtaAddress.toBase58();
        for (const act of this.activity) {
            if (results.length >= maxNumberTx) break;
            if (act.memberAtaAddress.toBase58() === ataAddressString) {
                results.push(act);
            }
        }
        return results;
    }

    public getMemberAta(userId: PublicKey): PublicKey {
        const [memberPda] = PublicKey.findProgramAddressSync(
            [Buffer.from(MEMBER_SEED), this.bankAuth.publicKey.toBuffer(), userId.toBuffer()],
            this.program.programId
        );
        return memberPda;
    }
    public async fetchAtaIfInitialized(memberPubkey: PublicKey): Promise<PublicKey | undefined> {
        try {
            let account = this.getMemberAccount(memberPubkey);
            if (!account) return undefined;
            let ata = this.getMemberAta(memberPubkey);
            return ata;
        }
        catch {
            return undefined;
        }
    }

}



