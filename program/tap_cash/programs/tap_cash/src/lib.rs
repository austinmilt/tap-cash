pub mod state;
pub mod constants;
pub mod instructions;
pub mod model;
pub mod id;

use anchor_lang::prelude::*;
use instructions::*;

pub use id::ID;

#[program]
pub mod tap_cash {
    use super::*;

    pub fn initialize_bank(ctx: Context<InitializeBank>) -> Result<()> {
        instructions::init_bank(ctx)
    }

    pub fn initialize_member(ctx: Context<InitializeMember>) -> Result<()> {
        instructions::init_member(ctx)
    }

    pub fn initialize_account(ctx: Context<InitializeMemberAccount>) -> Result<()>{
        instructions::init_account(ctx)
    }

    pub fn send_spl(ctx: Context<SendSpl>, withdraw_amount: u64) -> Result<()>{
        instructions::send_spl(ctx, withdraw_amount)
    }
}
