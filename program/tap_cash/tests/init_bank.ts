import * as anchor from "@project-serum/anchor";
import { web3, Program, workspace } from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, createMint, createMintToCheckedInstruction, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "bn.js";
import { assert } from "chai";
import { TapCash } from "../target/types/tap_cash";
import { requestAirdrops } from "./helpers/airdrop";

const logAllTx = false;
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
  return MINT_KEY;
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
  let friend = Keypair.generate();


  before(async () => {

    await requestAirdrops(connection, [bankAuth.publicKey, memberId.publicKey, friend.publicKey]);

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
    const USDC = await createOrFetchUsdc(program,bankAuth); 
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
    let userAta = await getAssociatedTokenAddress(USDC, accountPda, true);
    try {
      let { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash('finalized');
      const tx = await program.methods.initializeAccount()
        .accountsStrict({
          payer: bankAuth.publicKey,
          member: memberPda,
          userId: memberId.publicKey,
          bank: bankPda,
          accountPda: accountPda,
          accountAta: userAta,
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

      const usdcAcct = await program.account.memberAccount.fetch(accountPda);
      assert(true, 'account iniated')

    }
    catch {
      assert(false, 'account did not initiate')
    }
    finally {

    }
  });
  it("Init Recieve and transfer USDC", async () => {
    const USDC = await createOrFetchUsdc(program,bankAuth); 
    const numAccounts = 1; // set for 1 on init 1st account
    const buffer = new ArrayBuffer(1); // create a buffer with 1 byte
    const view = new DataView(buffer);
    view.setUint8(0, numAccounts); // write the number to the buffer
    const numAccountsBuffer = new Uint8Array(buffer); // get the byte 

    const [accountPda, accountBump] = await PublicKey.findProgramAddressSync(
      [
        memberPda.toBuffer(),
        Buffer.from("checking"),
        USDC.toBuffer(),
        numAccountsBuffer
      ],
      program.programId
    );
    let userAta = await getAssociatedTokenAddress(USDC, accountPda, true);
    let ix = await createMintToCheckedInstruction(USDC, userAta, bankAuth.publicKey, 100e6, 6);
    let transaction = new anchor.web3.Transaction().add(ix);
    
    try {
      let blockhash = await program.provider.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash.blockhash;
      transaction.lastValidBlockHeight = blockhash.lastValidBlockHeight;
      await anchor.web3.sendAndConfirmTransaction(program.provider.connection, transaction, [bankAuth]);
    }
    catch (error) {
      console.error("Error while minting fungible:", error);
    }

    // create a destination ATA (dummy user destination)
    let friendUsdcAta = await getOrCreateAssociatedTokenAccount(connection,friend,USDC,friend.publicKey);



    try {
      let { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash('finalized');
      const tx = await program.methods.sendSpl(new BN(1000000))
        .accountsStrict({
          payer: bankAuth.publicKey,
          member: memberPda,
          userId: memberId.publicKey,
          bank: bankPda,
          accountPda: accountPda,
          accountAta: userAta,
          destinationAta: friendUsdcAta.address,
          tokenMint: USDC,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .signers([bankAuth, memberId])
        .rpc();
      await connection.confirmTransaction({
        signature: tx,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight
      });
      txLog.push({
        step: "Send USDC",
        url: `https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`
      });

      assert(true, 'usdc transferred')

    }
    catch (e) {
      console.log('error! ', e)
      assert(false, 'did not transfer usdc')
    }

  })
  after(async () => {
    console.log("    All Tests Completed");
    if (logAllTx) console.log(txLog);
  });
});
