use anchor_lang::prelude::*;


#[derive(Accounts)]
pub struct InitializeBank {
    
}

struct Bank {
    authority: Pubkey,
    bump: u8,
    version: u8,
    name: u8
}