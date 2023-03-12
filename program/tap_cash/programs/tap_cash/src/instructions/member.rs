use anchor_lang::prelude::*;

use crate::{
    constants::{MEMBER_SEED, MEMBER_VERSION},
    state::{Member, Bank},
};

/// Accounts and constraints for initializing a new member account.
#[derive(Accounts)]
pub struct InitializeMember<'info> {

    /// Fee payer is the Bank's defined payer (not the user)
    #[account(
        mut,
        constraint = payer.to_account_info().key() == bank.fee_payer.key()
    )]
    pub payer: Signer<'info>,

    /// Member PDA - 1 member per person per bank
    #[account(
        init,
        payer = payer,
        space = Member::get_space(),
        seeds = [
            MEMBER_SEED.as_ref(), 
            bank.to_account_info().key().as_ref(), 
            user_id.key().as_ref()
        ],
        bump
    )]
    pub member_pda: Account<'info, Member>,

    /// User ID is the Public Key the user recieved when enrolling via Web3 auth (local device wallet for signing)
    pub user_id: SystemAccount<'info>,

    /// The bank the member is enrolling to (for now, just 1 Bank)
    #[account(owner = crate::ID)]
    pub bank: Account<'info, Bank>,

    /// Standard system program, for creating accounts
    pub system_program: Program<'info, System>,
    
    /// Standard rent sysvar, for determining rent for created accounts
    pub rent: Sysvar<'info, Rent>
}

/// Initializes a new member of a Bank.
///
/// This function creates a new member state account and sets its initial state to include the member version, bank key, user ID, bump value, and number of accounts. 
/// This function should only be called once per member.
pub fn initialize_member(
    ctx: Context<InitializeMember>
) -> Result<()> { 
    let new_member = &mut ctx.accounts.member_pda;

    // Create a new member state account 
    new_member.set_inner(Member {
        version: MEMBER_VERSION,
        bank: ctx.accounts.bank.key(),
        user_id: ctx.accounts.user_id.key(),
        bump: *ctx.bumps.get("member_pda").unwrap(),
        num_accounts: 0
    });
    new_member.log_init();
    Ok(()) 
}