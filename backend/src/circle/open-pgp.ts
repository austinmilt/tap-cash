// Ref Implementation: https://github.com/circlefin/payments-sample-app/blob/78e3d1b5b3b548775e755f1b619720bcbe5a8789/lib/openpgp.ts

import { createMessage, encrypt, readKey } from 'openpgp';

interface PublicKey {
    keyId: string
    /* uuid Public Key (Not a web3 PublicKey) */
    publicKey: string
}

interface Result {
    /* Encrypted message */
    encryptedMessage: string;
    keyId: string;
}

/**
 * Encrypt dataToEncrypt
 *
 * @param {Object} dataToEncrypt
 * @param {PublicKey} Object containing keyId and publicKey properties
 *
 * @return {Object} Object containing encryptedMessage and keyId
 */
export async function pgpEncrypt(dataToEncrypt: object, { keyId, publicKey }: PublicKey): Promise<Result> {
    if (!publicKey || !keyId) {
        throw new Error('Unable to encrypt data');
    }

    const decodedPublicKey = await readKey({ armoredKey: atob(publicKey) });
    const message = await createMessage({ text: JSON.stringify(dataToEncrypt) });
    const ciphertext = await encrypt({
        message,
        encryptionKeys: decodedPublicKey,
    });

    return {
        // TODO replace btoa
        // @ts-ignore copied from online example...
        encryptedMessage: btoa(ciphertext),
        keyId,
    }
}
