import * as anchor from "@project-serum/anchor";

export interface MemberPdaProps {
    userId: anchor.web3.PublicKey;
    programId: anchor.web3.PublicKey;
}

export interface NewMemberProps extends MemberPdaProps {
    memberPda: anchor.web3.PublicKey;
    systemProgram: anchor.web3.PublicKey;
    rent: anchor.web3.PublicKey;
    bank: anchor.web3.PublicKey;
}


export interface MemberAccountPdaProps {
    memberPda: anchor.web3.PublicKey;
    tokenMint: anchor.web3.PublicKey;
    accountNumber: number;
    programId: anchor.web3.PublicKey;
}

export interface NewAccountProps {
    member: anchor.web3.PublicKey;
    userId: anchor.web3.PublicKey;
    bank: anchor.web3.PublicKey;
    accountPda: anchor.web3.PublicKey;
    accountAta: anchor.web3.PublicKey;
    tokenMint: anchor.web3.PublicKey;
    tokenProgram: anchor.web3.PublicKey;
    associatedTokenProgram: anchor.web3.PublicKey;
    systemProgram: anchor.web3.PublicKey;
}

export interface InitMemberProps extends MemberAccountPdaProps {
    accountPda: anchor.web3.PublicKey;
    accountAta: anchor.web3.PublicKey;
    tokenMint: anchor.web3.PublicKey;
    tokenProgram: anchor.web3.PublicKey;
    associatedTokenProgram: anchor.web3.PublicKey;
}