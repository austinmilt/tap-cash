use anchor_lang::prelude::*;

use crate::{
    constants::{BANK_SEED, BANK_VERSION},
    state::{Bank},
    model::error::{BankError}
};

/// Accounts and constraints for initializing a new bank.
#[derive(Accounts)]
pub struct InitializeBank<'info> {
    /// The Bank's creator -- should be secure (e.g., ledger)
    #[account(
        mut,
        owner = system_program.key() @ BankError::InvalidAuthority
    )]
    pub bank_authority: Signer<'info>,

    /// The Bank (for now, there will only be 1 bank) - only allowing 1 per authority key
    #[account(
        init,
        payer = bank_authority,
        space = Bank::get_space(),
        seeds = [BANK_SEED.as_ref(), bank_authority.key().as_ref()],
        bump
    )]
    pub bank: Account<'info,Bank>,

    /// Standard system program, for creating accounts
    pub system_program: Program<'info, System>,
    
    /// Standard rent sysvar, for determining rent for created accounts
    pub rent: Sysvar<'info, Rent>
}

/// Initializes a new Bank.
///
/// This function creates a new account of type Bank and sets its initial state to include the bank version,
/// authority, fee payer, and bump value. This function should only be called once per bank authority key.
pub fn initialize_bank(
    ctx: Context<InitializeBank>
) -> Result<()> { 
    let bank = &mut ctx.accounts.bank;

    // Create bank state account 
    bank.set_inner(Bank {
        version: BANK_VERSION,
        authority: ctx.accounts.bank_authority.key(),
        fee_payer: ctx.accounts.bank_authority.key(),
        bump: *ctx.bumps.get("bank").unwrap()
    });
    bank.log_init();
    Ok(()) 
}