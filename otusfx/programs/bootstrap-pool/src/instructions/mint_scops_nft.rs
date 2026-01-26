use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, MintTo};
use anchor_spl::associated_token::AssociatedToken;
use mpl_token_metadata::instructions::{
    CreateV1CpiBuilder, CreateV1InstructionArgs,
};
use mpl_token_metadata::types::{PrintSupply, TokenStandard};
use crate::error::BootstrapError;
use crate::state::{BootstrapConfig, UserDeposit, ScopsTier};

#[derive(Accounts)]
pub struct MintScopsNft<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
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

    /// NFT mint (unique per user)
    #[account(
        init,
        payer = user,
        mint::decimals = 0,
        mint::authority = bootstrap_config,
        mint::freeze_authority = bootstrap_config
    )]
    pub scops_nft_mint: Account<'info, Mint>,

    /// User's NFT token account
    #[account(
        init,
        payer = user,
        associated_token::mint = scops_nft_mint,
        associated_token::authority = user
    )]
    pub user_nft_account: Account<'info, TokenAccount>,

    /// Metaplex metadata account
    /// CHECK: Validated by Metaplex program
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,

    /// Metaplex master edition account
    /// CHECK: Validated by Metaplex program
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,

    /// Metaplex Token Metadata program
    /// CHECK: This is the Metaplex program ID
    pub token_metadata_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<MintScopsNft>) -> Result<()> {
    let config = &ctx.accounts.bootstrap_config;
    let user_deposit = &mut ctx.accounts.user_deposit;

    // Verify user has a tier (Bronze or higher)
    require!(
        user_deposit.scops_tier != ScopsTier::None,
        BootstrapError::InsufficientTierForNft
    );

    // Verify user hasn't already minted
    require!(
        !user_deposit.has_minted_scops,
        BootstrapError::AlreadyMintedScops
    );

    // Mint 1 NFT to user
    let seeds = &[BootstrapConfig::SEEDS_PREFIX, &[config.bump]];
    let signer_seeds = &[&seeds[..]];

    let mint_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.scops_nft_mint.to_account_info(),
            to: ctx.accounts.user_nft_account.to_account_info(),
            authority: config.to_account_info(),
        },
        signer_seeds,
    );
    token::mint_to(mint_ctx, 1)?;

    // Create metadata (copy tier name to avoid borrow conflict)
    let tier_name = user_deposit.scops_tier.name().to_string();
    let nft_name = format!("OtusFX Scops - {}", tier_name);
    let nft_symbol = "SCOPS".to_string();
    let nft_uri = format!("https://otus.com/scops/{}.json", tier_name.to_lowercase());

    CreateV1CpiBuilder::new(&ctx.accounts.token_metadata_program.to_account_info())
        .metadata(&ctx.accounts.metadata_account.to_account_info())
        .master_edition(Some(&ctx.accounts.master_edition.to_account_info()))
        .mint(&ctx.accounts.scops_nft_mint.to_account_info(), true)
        .authority(&config.to_account_info())
        .payer(&ctx.accounts.user.to_account_info())
        .update_authority(&config.to_account_info(), true)
        .system_program(&ctx.accounts.system_program.to_account_info())
        .sysvar_instructions(&ctx.accounts.rent.to_account_info())
        .spl_token_program(&ctx.accounts.token_program.to_account_info())
        .name(nft_name)
        .symbol(nft_symbol)
        .uri(nft_uri)
        .seller_fee_basis_points(0)
        .token_standard(TokenStandard::NonFungible)
        .print_supply(PrintSupply::Zero)
        .invoke_signed(signer_seeds)?;

    // Mark as minted
    user_deposit.has_minted_scops = true;

    msg!("Scops NFT minted");
    msg!("User: {}", ctx.accounts.user.key());
    msg!("Tier: {}", tier_name);
    msg!("Mint: {}", ctx.accounts.scops_nft_mint.key());

    Ok(())
}
