use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::{
    constants::{MEMBER_SEED, CHECKING_SEED}, 
    state::{Member, MemberAccount, Bank}
};


#[derive(Accounts)]
pub struct InitializeMemberAccount<'info> {

    #[account(
        mut,
        constraint = payer.to_account_info().key() == bank.fee_payer.key()
    )]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            MEMBER_SEED.as_ref(), 
            bank.to_account_info().key().as_ref(), 
            user_id.key().as_ref()
        ],
        bump = member.bump
    )]
    
    #[account(has_one = bank)]
    pub member: Account<'info, Member>,
    pub user_id: SystemAccount<'info>,
    pub bank: Account<'info, Bank>,

    #[account(
        init,
        payer = payer,
        space = MemberAccount::get_space(),
        seeds = [
            member.to_account_info().key().as_ref(), 
            CHECKING_SEED.as_ref(), 
            token_mint.key().as_ref(), 
            // Account is initiated at 0. Will be incremented in the function
            // so we want our seed to match the new state (not the old)
            &(member.num_accounts+1).to_le_bytes(),
        ],
        bump
    )]
    pub account_pda: Account<'info,MemberAccount>,

    #[account(
        init,
        associated_token::mint = token_mint,
        payer = payer,
        associated_token::authority = account_pda,
    )]
    pub account_ata: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn init_account(
    ctx: Context<InitializeMemberAccount>
) -> Result<()> { 
    let new_account = &mut ctx.accounts.account_pda;
    let member = &mut ctx.accounts.member;
    let account_number = member.num_accounts + 1;

    // Add checks (member init, etc)

    new_account.set_inner(MemberAccount{
        version: 1,
        member: member.key(),
        token_mint: ctx.accounts.token_mint.key(),
        ata: ctx.accounts.account_ata.key(),
        bump: *ctx.bumps.get("account_pda").unwrap(),
        acct_no: account_number,
        acct_type: 0
    });
    
    member.num_accounts = account_number;

    new_account.log_init();
    Ok(()) 
}