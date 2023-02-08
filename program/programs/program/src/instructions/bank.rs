use anchor_lang::prelude::*;

use crate::{
    constants::{BANK_SEED},
    state::{Bank},
    model::error::{BankError}
};

#[derive(Accounts)]
pub struct InitializeBank<'info> {
    #[account(mut)]
    pub bank_authority: Signer<'info>,
    #[account(
        init,
        payer = bank_authority,
        space = Bank::get_space(),
        seeds = [BANK_SEED.as_ref(), bank_authority.key().as_ref()],
        bump
    )]
    pub bank: Account<'info,Bank>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}

pub fn init_bank(
    ctx: Context<InitializeBank>
) -> Result<()> { 
    let bank = &mut ctx.accounts.bank;

    require!(bank.initialized, BankError::AlreadyInitialized);

    bank.initialized = true;
    bank.version = 1;
    bank.authority = ctx.accounts.bank_authority.key();
    bank.bump = *ctx.bumps.get("bank").unwrap();

    Ok(()) 
}