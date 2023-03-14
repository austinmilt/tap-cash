use anchor_lang::prelude::*;

#[account]
pub struct MemberAccount {
    /// Version of the Member Account
    pub version: u8,
    /// The member pda
    pub member: Pubkey,
    /// The token mint
    pub token_mint: Pubkey,
    /// The associated token account
    pub ata: Pubkey,
    /// Bump seed for the member account
    pub bump: u8,
    /// Account number
    pub acct_no: u8,
    /// Account type (0=checking, 1=savings)
    pub acct_type: u8
}

impl MemberAccount {
    /// Returns the size of the `MemberAccount` account in bytes
    pub fn get_space() -> usize {
         8 + // account discriminator
         1 + // version
        32 + // member pda
        32 + // token_mint
        32 + // ata
         1 + // bump
         1 + // account no
         1   // account type
    }
    /// Prints a log message with the member's PDA address
    pub fn log_init(&self){
        msg!("Init new acct for:{}", self.member);
    }
}