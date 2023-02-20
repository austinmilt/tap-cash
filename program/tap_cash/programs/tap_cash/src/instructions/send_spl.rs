use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount, Transfer as SplTransfer},
};

use crate::{
    constants::{MEMBER_SEED, CHECKING_SEED}, 
    state::{Member, MemberAccount, Bank}
};


#[derive(Accounts)]
pub struct SendSpl<'info> {

    #[account(
        mut
        // TO DO constraint that this is bank.feepayer
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
    // TO DO constraint member.bank = bank
    pub member: Account<'info,Member>,
    pub user_id: Signer<'info>,

    pub bank: Account<'info, Bank>,

    #[account(
        seeds = [
            member.to_account_info().key().as_ref(), 
            CHECKING_SEED.as_ref(), 
            token_mint.key().as_ref(), 
            &(member.num_accounts).to_le_bytes(),
        ],
        bump = account_pda.bump
    )]
    pub account_pda: Account<'info,MemberAccount>,

    #[account(mut)]
    pub account_ata: Account<'info, TokenAccount>,
    #[account(mut)]
    pub destination_ata: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn send_spl(ctx: Context<SendSpl>, withdraw_amount: u64) -> Result<()> {
    let destination = &mut ctx.accounts.destination_ata;
    let source = &mut ctx.accounts.account_ata;
    let account = &mut ctx.accounts.account_pda;
    let member = &mut ctx.accounts.member;
    let token_program = &mut ctx.accounts.token_program;
    let mint = &mut ctx.accounts.token_mint;

    // Transfer tokens from taker to defined destination
    let cpi_accounts = SplTransfer {
        from: source.to_account_info().clone(),
        to: destination.to_account_info().clone(),
        authority: account.to_account_info().clone(),
    };

    let num_accts_bytes = &(member.num_accounts).to_le_bytes();
    let member_key = member.to_account_info().key();

    let seeds = &[
        member_key.as_ref(),
        b"checking",
        mint.to_account_info().key.as_ref(),
        num_accts_bytes,
        &[account.bump]
    ];
    let signer = &[&seeds[..]];
    let cpi = CpiContext::new_with_signer(
        token_program.to_account_info(),
        cpi_accounts,
        signer,
    );
    anchor_spl::token::transfer(cpi, withdraw_amount)?;

    Ok(())
}