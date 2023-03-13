use anchor_lang::prelude::*;

#[account]
pub struct Bank {
    /// Version of the Bank Account 
    pub version: u8,
    /// The authority key for the bank
    pub authority: Pubkey,
    /// The fee payer key for the bank
    pub fee_payer: Pubkey,
    /// Bump seed for the bank
    pub bump: u8
}

impl Bank {
    /// Returns the expected size of the account in bytes.
    pub fn get_space() -> usize {
         8 + // account discriminator
         1 + // version
        32 + // authority
        32 + // fee_payer
         1   // bump
    }
    /// Logs a message indicating that a new bank has been initialized.
    pub fn log_init(&self){
        msg!("Init new bank v.{}", self.version);
    }
}