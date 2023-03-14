use anchor_lang::prelude::*;

#[account]
pub struct Member {
    /// Version of the Member Account
    pub version: u8,
    /// The bank pda
    pub bank: Pubkey,
    /// The member PubKey received on enrollment (currently via Web3 auth)
    pub user_id: Pubkey,
    /// Bump seed for the member 
    pub bump: u8,
    /// Number of accounts
    pub num_accounts: u8
}

impl Member {
    /// Returns the expected size of the account in bytes.
    pub fn get_space() -> usize {
         8 + // account discriminator
         1 + // version
        32 + // bank pda
        32 + // user id
         1 + // num_accounts
         1   // bump
    }
    /// Logs a message indicating that a new member has been initialized.
    pub fn log_init(&self){
        msg!("Init new member:{}", self.user_id);
    }
}