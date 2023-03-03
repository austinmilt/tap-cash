import { Keypair } from "@solana/web3.js";

interface ApiInitializeMemberRequest {
    emailAddress: string;
    profilePictureUrl: string;
    name: string;
    signerAddressBase58: string;
}

function generateRandomRequest(): ApiInitializeMemberRequest {
    const emailSuffixes = ['@example.com', '@test.com', '@random.com'];
    const profilePictureUrls = [
        'https://picsum.photos/200/300',
        'https://picsum.photos/300/200',
        'https://picsum.photos/250/250',
    ];
    const names = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve'];

    const email = `${Math.random()
        .toString(36)
        .substring(7)}${emailSuffixes[Math.floor(Math.random() * emailSuffixes.length)]}`;
    const profilePictureUrl =
        profilePictureUrls[Math.floor(Math.random() * profilePictureUrls.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const signerAddressBase58 =
        Keypair.generate().publicKey.toBase58(); // Need to write this to do send function later

    return { emailAddress: email, profilePictureUrl, name, signerAddressBase58 };
}

const requestData = generateRandomRequest();

const curlCommand = `curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(
    requestData,
)}' http://localhost:8080/new-member`;

console.log(curlCommand);
