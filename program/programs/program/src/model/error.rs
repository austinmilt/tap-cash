use anchor_lang::prelude::*;

#[error_code]
pub enum BankError {
    #[msg("Bank already initialized")]
    AlreadyInitialized
}