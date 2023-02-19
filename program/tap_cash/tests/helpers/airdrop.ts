import * as anchor from "@project-serum/anchor";
import { web3 } from '@project-serum/anchor';

const { LAMPORTS_PER_SOL } = web3;

export async function requestAirdrops(connection, addresses: anchor.web3.PublicKey[]) {
    const promises = addresses.map(async (address) => {
      try {
        const airdropBlock = await connection.getLatestBlockhash('finalized');
        const airdrop = await connection.requestAirdrop(address, 100 * LAMPORTS_PER_SOL);
        await connection.confirmTransaction({
          signature: airdrop,
          blockhash: airdropBlock.blockhash,
          lastValidBlockHeight: airdropBlock.lastValidBlockHeight
        });
        return { publicKey: address.toString(), status: 'success', txSignature: airdrop };
      } catch (error) {
        console.error(`Error while requesting airdrop for ${address.toString()}: ${error}`);
        return { publicKey: address.toString(), status: 'error', error: error };
      }
    });
    const results = await Promise.allSettled(promises);
    return results.map((result, index) => {
      const address = addresses[index];
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return { publicKey: address.toString(), status: 'error', error: result.reason };
      }
    });
  }