use anchor_lang::prelude::*;

use crate::{
    constants::{MEMBER_SEED},
    state::{Member, Bank},
};

#[derive(Accounts)]
pub struct InitializeMember<'info> {
    #[account(
        mut,
        constraint = payer.to_account_info().key() == bank.fee_payer.key()
    )]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = Member::get_space(),
        seeds = [
            MEMBER_SEED.as_ref(), 
            bank.to_account_info().key().as_ref(), 
            user_id.key().as_ref()
        ], //(1 membership per pax per bank)
        bump
    )]
    pub member_pda: Account<'info, Member>,
    pub user_id: SystemAccount<'info>,
    #[account(owner = crate::ID)]
    pub bank: Account<'info, Bank>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize_member(
    ctx: Context<InitializeMember>
) -> Result<()> { 
    let new_member = &mut ctx.accounts.member_pda;

    new_member.set_inner(Member {
        version: 1,
        bank: ctx.accounts.bank.key(),
        user_id: ctx.accounts.user_id.key(),
        bump: *ctx.bumps.get("member_pda").unwrap(),
        num_accounts: 0
    });
    new_member.log_init();
    Ok(()) 
}