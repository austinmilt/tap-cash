use anchor_lang::prelude::*;

#[account]
pub struct Member {
    pub initialized: bool,
    pub version: u8,
    pub bank: Pubkey,
    pub user_id: Pubkey,        // PubKey received on enrollment 
    pub bump: u8,
    pub num_accounts: u8 // should this be a vec that has all?
}

impl Member {
    pub fn get_space() -> usize {
         8 + // account discriminator
         1 + // initialized
         1 + // version
        32 + // bank pda
        32 + // user id
         1 + // num_accounts
         1   // bump
    }
    pub fn log_init(&self){
        msg!("Init new member:{}", self.user_id);
    }
}
//https://book.anchor-lang.com/anchor_references/space.html