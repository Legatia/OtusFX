use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::error::BootstrapError;
use crate::state::{BootstrapConfig, UserDeposit, StablecoinType};

#[derive(Accounts)]
#[instruction(stablecoin_type: StablecoinType)]
pub struct WithdrawUsdc<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [BootstrapConfig::SEEDS_PREFIX],
        bump = bootstrap_config.bump
    )]
    pub bootstrap_config: Account<'info, BootstrapConfig>,

    #[account(
        mut,
        seeds = [UserDeposit::SEEDS_PREFIX, user.key().as_ref()],
        bump = user_deposit.bump,
        constraint = user_deposit.user == user.key() @ BootstrapError::Unauthorized
    )]
    pub user_deposit: Account<'info, UserDeposit>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"usdc_vault"],
        bump
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"usd1_vault"],
        bump
    )]
    pub usd1_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<WithdrawUsdc>, stablecoin_type: StablecoinType, amount: u64) -> Result<()> {
    let config = &mut ctx.accounts.bootstrap_config;
    let user_deposit = &mut ctx.accounts.user_deposit;
    let clock = Clock::get()?;

    // Can only withdraw before bootstrap_end
    require!(
        clock.unix_timestamp < config.bootstrap_end,
        BootstrapError::WithdrawalNotAllowed
    );

    // Verify user has sufficient balance for the specific stablecoin
    let user_balance = match stablecoin_type {
        StablecoinType::USDC => user_deposit.usdc_deposited,
        StablecoinType::USD1 => user_deposit.usd1_deposited,
    };
    require!(user_balance >= amount, BootstrapError::InsufficientBalance);

    // Determine which vault to use based on stablecoin type
    let vault_account = match stablecoin_type {
        StablecoinType::USDC => ctx.accounts.usdc_vault.to_account_info(),
        StablecoinType::USD1 => ctx.accounts.usd1_vault.to_account_info(),
    };

    // Transfer stablecoin from vault to user
    let seeds = &[BootstrapConfig::SEEDS_PREFIX, &[config.bump]];
    let signer_seeds = &[&seeds[..]];

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: vault_account,
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: config.to_account_info(),
        },
        signer_seeds,
    );
    token::transfer(transfer_ctx, amount)?;

    // Update withdrawal amounts based on stablecoin type
    let (usdc_amount, usd1_amount) = match stablecoin_type {
        StablecoinType::USDC => (amount, 0u64),
        StablecoinType::USD1 => (0u64, amount),
    };

    user_deposit.update_from_withdrawal(usdc_amount, usd1_amount, config.otus_distribution_rate);

    // Update global stats
    match stablecoin_type {
        StablecoinType::USDC => {
            config.total_deposited_usdc = config
                .total_deposited_usdc
                .checked_sub(amount)
                .ok_or(BootstrapError::ArithmeticOverflow)?;
        }
        StablecoinType::USD1 => {
            config.total_deposited_usd1 = config
                .total_deposited_usd1
                .checked_sub(amount)
                .ok_or(BootstrapError::ArithmeticOverflow)?;
        }
    }

    let token_name = match stablecoin_type {
        StablecoinType::USDC => "USDC",
        StablecoinType::USD1 => "USD1",
    };

    msg!("Withdrawal successful");
    msg!("User: {}", ctx.accounts.user.key());
    msg!("Amount: {} {}", amount / 1_000_000, token_name);
    msg!("Remaining USD value: {} USD", user_deposit.total_usd_value / 1_000_000);

    Ok(())
}
