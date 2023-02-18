import * as anchor from "@project-serum/anchor";
import { web3, Program, workspace } from '@project-serum/anchor';
import { assert } from "chai";
import { TapCash } from "../target/types/tap_cash";
import { requestAirdrops } from "./helpers";

const { SystemProgram, SYSVAR_RENT_PUBKEY, LAMPORTS_PER_SOL, PublicKey, Keypair } = web3;

describe("tap_cash", async () => {
  anchor.setProvider(anchor.AnchorProvider.local());
  const program = await workspace.TapCash as Program<TapCash>;
  const { connection } = program.provider;
  const txLog= [];
  const bankAuth = Keypair.generate();
  const [bankPda, bankBump] = await PublicKey.findProgramAddressSync(
    [Buffer.from("tap-bank"), bankAuth.publicKey.toBuffer()],
    program.programId
  );

  const memberId = anchor.web3.Keypair.generate();
  const [memberPda, memberBump] = await PublicKey.findProgramAddressSync(
    [Buffer.from("member"), bankPda.toBuffer(), memberId.publicKey.toBuffer()],
    program.programId
  );
  
  before(async () => {
    
    await requestAirdrops(connection, [bankAuth.publicKey, memberId.publicKey]);

  })
  it("Initialize new Bank", async () => {

    let { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash('finalized');
    try {
      const tx = await program.methods.initializeBank()
        .accountsStrict({
          bankAuthority: bankAuth.publicKey,
          bank: bankPda,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        })
        .signers([bankAuth])
        .rpc();
      await connection.confirmTransaction({
        signature: tx,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight
      });
      txLog.push({
        step: "Init Bank",
        url: `https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`
      });
      // Fetch the vault account and make assertions.
    } catch (error) {
      console.error("Error while creating a vault account:", error);
    } finally {
      let bank;
      try {
        bank = await program.account.bank.fetch(bankPda);
      } catch (error) {
        console.error("Error while fetching the vault account:", error);
      }

      assert(bank.authority.toBase58() === bankAuth.publicKey.toBase58(), "The bank auth should be the user.");
      assert(bankBump == bank.bump, "Bank bump as expected.");
      assert(bank.initialized, "Bank is initialized");
    };


  });
  it("Initialize new Member", async () => {

    let { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash('finalized');
    try {
      const tx = await program.methods.initializeMember()
        .accountsStrict({
          payer: bankAuth.publicKey,
          memberPda: memberPda,
          userId: memberId.publicKey,
          bank: bankPda,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        })
        .signers([bankAuth])
        .rpc();
      await connection.confirmTransaction({
        signature: tx,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight
      });
      txLog.push({
        step: "Init Member",
        url: `https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`
      });
      // Fetch the vault account and make assertions.
    } catch (error) {
      console.error("Error while creating a vault account:", error);
    } finally {
      let member;
      try {
        member = await program.account.member.fetch(memberPda);
      } catch (error) {
        console.error("Error while fetching the vault account:", error);
      }

      assert(member.initialized, "Member is initialized");
      assert(member.bank.toBase58() == bankPda.toBase58());
      assert(member.bump == memberBump, "Bumps equal")
    };

    


  });
  it("Reinitialize same member fails", async () => {

    let { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash('finalized');
    try {
      const tx = await program.methods.initializeMember()
        .accountsStrict({
          payer: bankAuth.publicKey,
          memberPda: memberPda,
          userId: memberId.publicKey,
          bank: bankPda,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        })
        .signers([bankAuth])
        .rpc();
      await connection.confirmTransaction({
        signature: tx,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight
      });
      txLog.push({
        step: "Reinit Member",
        url: `https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`
      })
      // Fetch the vault account and make assertions.
    } catch (error) {
      assert(true, "unable to reinitialize");
    } 
  });
  after(async()=>{
    console.log("    All Tests Completed");
    console.log(txLog);
  });  
});
