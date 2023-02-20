use anchor_lang::prelude::*;

#[account]
pub struct Bank {
    pub version: u8,
    pub authority: Pubkey,
    pub fee_payer: Pubkey,
    pub bump: u8
}

impl Bank {
    pub fn get_space() -> usize {
         8 + // account discriminator
         1 + // version
        32 + // authority
        32 + // fee_payer
         1   // bump
    }
    pub fn log_init(&self){
        msg!("Init new bank v.{}", self.version);
    }
}