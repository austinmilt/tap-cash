use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount, Transfer as SplTransfer},
};

use crate::{
    constants::{MEMBER_SEED, CHECKING_SEED}, 
    state::{Member, MemberAccount, Bank}
};

/// Accounts and constraints for sending an SPL token from one account to another.
#[derive(Accounts)]
pub struct SendSpl<'info> {

    /// Fee payer is the Bank's defined payer (not the user)
    #[account(
        mut,
        constraint = payer.to_account_info().key() == bank.fee_payer.key()
    )]
    pub payer: Signer<'info>,

    /// The member for is transferring a token
    #[account(
        mut,
        owner = crate::ID,
        has_one = bank,
        seeds = [
            MEMBER_SEED.as_ref(), 
            bank.to_account_info().key().as_ref(), 
            user_id.key().as_ref()
        ],
        bump = member.bump
    )]
    pub member: Account<'info, Member>,

    /// User ID is the Public Key the user recieved when enrolling via Web3 auth (local device wallet for signing)
    pub user_id: Signer<'info>,

    /// The bank the member is enrolled in
    #[account(owner = crate::ID)]
    pub bank: Account<'info, Bank>,

    /// The Member Account PDA that will authorize the token transfer 
    #[account(
        owner = crate::ID,
        seeds = [
            member.to_account_info().key().as_ref(), 
            CHECKING_SEED.as_ref(), 
            token_mint.key().as_ref(), 
            &(account_pda.acct_no).to_le_bytes(),
        ],
        bump = account_pda.bump
    )]
    pub account_pda: Account<'info,MemberAccount>,

    /// Token account sending SPL tokens; it is owned by the MemberAccount (derived off path between token_mint and account_pda) 
    #[account(
        mut,
        constraint = account_ata.mint == token_mint.key(),
        constraint = account_ata.owner == account_pda.key()
    )]
    pub account_ata: Account<'info, TokenAccount>,

    /// Token account receiving SPL tokens (mint must match the defined mint). Assumes the account exists.
    #[account(
        mut,
        constraint = destination_ata.mint == token_mint.key()
    )]
    pub destination_ata: Account<'info, TokenAccount>,

    /// Mint address of the Token (for now, this will be limited to USDC)
    pub token_mint: Account<'info, Mint>,

    /// Standard Token Program 
    pub token_program: Program<'info, Token>,

    /// Standard Associated Token Program (for init new ATA)
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// Standard system program, for creating accounts
    pub system_program: Program<'info, System>,
}

/// Sends an SPL token from one account to another.
///
/// This function transfers the specified number of SPL tokens from the `account_ata` account to the `destination_ata` account. It uses the `SplTransfer` instruction to execute the transfer. 
/// This function should only be called by an authorized MemberAccount PDA.
///
/// # Arguments
///
/// * `ctx` - The context for the instruction containing the accounts and parameters.
/// * `withdraw_amount` - The number of SPL tokens to transfer.

pub fn send_spl(ctx: Context<SendSpl>, withdraw_amount: u64) -> Result<()> {
    let destination = &mut ctx.accounts.destination_ata;
    let source = &mut ctx.accounts.account_ata;
    let account = &mut ctx.accounts.account_pda;
    let member = &mut ctx.accounts.member;
    let token_program = &mut ctx.accounts.token_program;
    let mint = &mut ctx.accounts.token_mint;

    // Define CPI Accounts for SPL transfer
    let cpi_accounts = SplTransfer {
        from: source.to_account_info().clone(),
        to: destination.to_account_info().clone(),
        authority: account.to_account_info().clone(),
    };

    // Derive bytes needed for our signer based on the account no
    let num_accts_bytes = &(account.acct_no).to_le_bytes();

    let member_key = member.to_account_info().key();

    // Seeds should match the MemberAccount PDA
    let seeds = &[
        member_key.as_ref(),
        b"checking",
        mint.to_account_info().key.as_ref(),
        num_accts_bytes,
        &[account.bump]
    ];

    // Sign and execute transfer
    let signer = &[&seeds[..]];
    let cpi = CpiContext::new_with_signer(
        token_program.to_account_info(),
        cpi_accounts,
        signer,
    );
    anchor_spl::token::transfer(cpi, withdraw_amount)?;

    Ok(())
}