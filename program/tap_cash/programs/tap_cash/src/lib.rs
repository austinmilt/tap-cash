pub mod state;
pub mod constants;
pub mod instructions;
pub mod model;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("TAPyxAHSs72DNFzhxmWhD9cVJjYqcgH2kHuDsq2NzEz");

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
}
