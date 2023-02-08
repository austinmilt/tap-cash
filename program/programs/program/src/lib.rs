pub mod state;

use anchor_lang::prelude::*;
use state::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod mo_cash {
    use super::*;

    pub fn initialize_bank(_ctx: Context<InitializeBank>) -> Result<()> {
        Ok(())
    }
}
