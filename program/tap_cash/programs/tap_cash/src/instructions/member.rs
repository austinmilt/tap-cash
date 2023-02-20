use anchor_lang::prelude::*;

use crate::{
    constants::{MEMBER_SEED},
    state::{Member, Bank},
    model::error::{MemberError}
};

#[derive(Accounts)]
pub struct InitializeMember<'info> {
    #[account(
        mut,
        // should be bank.feepayer
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
    pub bank: Account<'info, Bank>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize_member(
    ctx: Context<InitializeMember>
) -> Result<()> { 
    let new_member = &mut ctx.accounts.member_pda;

    require!(!new_member.initialized, MemberError::AlreadyInitialized);
    new_member.set_inner(Member {
        initialized: true, 
        version: 1,
        bank: ctx.accounts.bank.key(),
        user_id: ctx.accounts.user_id.key(),
        bump: *ctx.bumps.get("member_pda").unwrap(),
        num_accounts: 0
    });
    new_member.log_init();
    Ok(()) 
}