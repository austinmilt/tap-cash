use anchor_lang::prelude::*;

#[account]
pub struct MemberAccount {
    pub version: u8,
    pub member: Pubkey,
    pub token_mint: Pubkey,
    pub ata: Pubkey,
    pub bump: u8,
    pub acct_no: u8,
    pub acct_type: u8
}

impl MemberAccount {
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
    pub fn log_init(&self){
        msg!("Init new acct for:{}", self.member);
    }
}