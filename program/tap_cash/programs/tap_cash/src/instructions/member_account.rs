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
//#[instruction(account_no: u8)]
pub struct InitializeMemberAccount<'info> {

    #[account(
        mut
        // constraint that this is bank.feepayer
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
    // constraint member.bank = bank
    pub member: Account<'info,Member>,
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

    // check member init
    // check account not init

    new_account.initialized = true;
    new_account.version = 1;
    new_account.member = member.key();
    new_account.token_mint = ctx.accounts.token_mint.key();
    new_account.ata = ctx.accounts.account_ata.key();
    new_account.bump = *ctx.bumps.get("account_pda").unwrap();
    new_account.acct_no = account_number;
    new_account.acct_type = 0;
    
    member.num_accounts = account_number;

    new_account.log_init();
    Ok(()) 
}