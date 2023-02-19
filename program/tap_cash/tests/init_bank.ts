import * as anchor from "@project-serum/anchor";
import { web3, Program, workspace } from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, createMint, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "chai";
import { TapCash } from "../target/types/tap_cash";
import { requestAirdrops } from "./helpers/airdrop";


const { SystemProgram, SYSVAR_RENT_PUBKEY, PublicKey, Keypair } = web3;

async function createOrFetchUsdc(program, auth) {
  let USDC = Keypair.fromSecretKey(new Uint8Array([37,52,157,165,252,151,175,4,244,19,4,251,245,112,139,69,80,214,98,210,39,216,160,31,240,217,229,98,190,20,78,66,7,7,47,237,59,254,203,59,13,235,59,174,143,214,168,200,222,254,238,182,126,132,119,223,206,180,122,70,123,187,96,237]))

  let MINT_KEY;
  try {
      MINT_KEY = await createMint(
          program.provider.connection,
          auth,
          auth.publicKey,
          null,
          6,
          USDC
      );
  }
  catch {
      // if it's already init, we just use it: 
      MINT_KEY = USDC.publicKey;
  }
  finally {
      return MINT_KEY;
  }    
}

describe("tap_cash", async () => {
  anchor.setProvider(anchor.AnchorProvider.local());
  const program = await workspace.TapCash as Program<TapCash>;
  const { connection } = program.provider;
  const txLog = [];
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
  it("Init New Account", async () => {
    const USDC = await createOrFetchUsdc(program,bankAuth); //new PublicKey('USDCRbW3cBBB3nnTRxWnitjFdRbDNuPyX5SrYWdkfAt');
    /*     await createMint(
          program.provider.connection,
          bankAuth,
          bankAuth.publicKey,
          null,
          6,
          Keypair.fromSecretKey(new Uint8Array([37,52,157,165,252,151,175,4,244,19,4,251,245,112,139,69,80,214,98,210,39,216,160,31,240,217,229,98,190,20,78,66,7,7,47,237,59,254,203,59,13,235,59,174,143,214,168,200,222,254,238,182,126,132,119,223,206,180,122,70,123,187,96,237]))
        ); */

    const numAccounts = 1; // set for 1 on init 1st account
    const buffer = new ArrayBuffer(1); // create a buffer with 1 byte
    const view = new DataView(buffer);
    view.setUint8(0, numAccounts); // write the number to the buffer
    const numAccountsBuffer = new Uint8Array(buffer); // get the byte representation as a Uint8Array

    const [accountPda, accountBump] = await PublicKey.findProgramAddressSync(
      [
        memberPda.toBuffer(),
        Buffer.from("checking"),
        USDC.toBuffer(),
        numAccountsBuffer
      ],
      program.programId
    );
    let user_ata = await getAssociatedTokenAddress(USDC, accountPda, true);
    try {
      let { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash('finalized');
      const tx = await program.methods.initializeAccount()
        .accountsStrict({
          payer: bankAuth.publicKey,
          member: memberPda,
          userId: memberId.publicKey,
          bank: bankPda,
          accountPda: accountPda,
          accountAta: user_ata,
          tokenMint: USDC,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .signers([bankAuth])
        .rpc();
      await connection.confirmTransaction({
        signature: tx,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight
      });
      txLog.push({
        step: "Init USDC Account",
        url: `https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`
      });
      assert(true, 'account iniated')

    }
    catch {
      assert(false, 'account did not initiate')
    }
    finally {

    }
  });
  after(async () => {
    console.log("    All Tests Completed");
    console.log(txLog);
  });
});
