use anchor_lang::prelude::*;

#[error_code]
pub enum BankError {
    #[msg("Authority must be owned by System Program")]
    InvalidAuthority,
    #[msg("Bank already initialized")]
    AlreadyInitialized
}

#[error_code]
pub enum MemberError {
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Member already initialized")]
    AlreadyInitialized
}