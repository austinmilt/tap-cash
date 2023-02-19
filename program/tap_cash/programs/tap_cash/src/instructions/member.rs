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
    pub member_pda: Account<'info,Member>,
    pub user_id: SystemAccount<'info>,
    pub bank: Account<'info, Bank>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn init_member(
    ctx: Context<InitializeMember>
) -> Result<()> { 
    let new_member = &mut ctx.accounts.member_pda;

    require!(!new_member.initialized, MemberError::AlreadyInitialized);

    new_member.initialized = true;
    new_member.version = 1;
    new_member.bank = ctx.accounts.bank.key();
    new_member.user_id = ctx.accounts.user_id.key();
    new_member.bump = *ctx.bumps.get("member_pda").unwrap();
    new_member.num_accounts = 0;
    new_member.log_init();
    Ok(()) 
}