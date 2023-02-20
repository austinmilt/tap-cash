use anchor_lang::prelude::*;

use crate::{
    constants::{BANK_SEED},
    state::{Bank},
    model::error::{BankError}
};

#[derive(Accounts)]
pub struct InitializeBank<'info> {
    #[account(
        mut,
        owner = system_program.key() @ BankError::InvalidAuthority
    )]
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

pub fn initialize_bank(
    ctx: Context<InitializeBank>
) -> Result<()> { 
    let bank = &mut ctx.accounts.bank;

    bank.set_inner(Bank {
        version: 1,
        authority: ctx.accounts.bank_authority.key(),
        fee_payer: ctx.accounts.bank_authority.key(),
        bump: *ctx.bumps.get("bank").unwrap()
    });
    bank.log_init();
    Ok(()) 
}