use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::{
    constants::{MEMBER_SEED, CHECKING_SEED, MEMBER_ACCOUNT_VERSION}, 
    state::{Member, MemberAccount, Bank}
};

/// Accounts and constraints for initializing a new member account.
#[derive(Accounts)]
pub struct InitializeMemberAccount<'info> {

    /// Fee payer is the Bank's defined payer (not the user)
    #[account(
        mut,
        constraint = payer.to_account_info().key() == bank.fee_payer.key()
    )]
    pub payer: Signer<'info>,

    /// The member for which we will create a new Account for
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
    pub user_id: SystemAccount<'info>,

    /// The bank the member is enrolled in
    #[account(owner = crate::ID)]
    pub bank: Account<'info, Bank>,

    /// A Member Account (PDA will have authority over Token Account) (seeded based on account type (e.g., "checking", token mint, member pda, and account no--user can have multiple accounts)) 
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

    /// Token account owned by the MemberAccount (derived off path between token_mint and account_pda)
    #[account(
        init,
        associated_token::mint = token_mint,
        payer = payer,
        associated_token::authority = account_pda,
    )]
    pub account_ata: Account<'info, TokenAccount>,

    /// Mint address of the Token (for now, this will be limited to USDC)
    pub token_mint: Account<'info, Mint>,

    /// Standard Token Program 
    pub token_program: Program<'info, Token>,

    /// Standard Associated Token Program (for init new ATA)
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// Standard system program, for creating accounts
    pub system_program: Program<'info, System>,
}

/// Initializes a new member account.
///
/// This function creates a new member account with an associated token account (ATA).
/// It sets its initial state to include the account version, member key, token mint, ATA key, bump value, account number, and account type. 
/// This function should only be called once per member account.
pub fn init_account(
    ctx: Context<InitializeMemberAccount>
) -> Result<()> { 
    let new_account = &mut ctx.accounts.account_pda;
    let member = &mut ctx.accounts.member;
    let account_number = member.num_accounts + 1;

    // Create user's new account
    new_account.set_inner(MemberAccount{
        version: MEMBER_ACCOUNT_VERSION,
        member: member.key(),
        token_mint: ctx.accounts.token_mint.key(),
        ata: ctx.accounts.account_ata.key(),
        bump: *ctx.bumps.get("account_pda").unwrap(),
        acct_no: account_number,
        acct_type: 0
    });
    
    // Increment number of accounts in the Member state
    member.num_accounts = account_number;

    new_account.log_init();
    Ok(()) 
}