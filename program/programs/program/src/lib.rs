pub mod state;
pub mod constants;
pub mod instructions;
pub mod model;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod mo_cash {
    use super::*;

    pub fn initialize_bank(ctx: Context<InitializeBank>) -> Result<()> {
        instructions::init_bank(ctx)
    }
}
