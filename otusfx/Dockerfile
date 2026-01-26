# Multi-stage Docker build for OtusFX Solana program
FROM --platform=linux/amd64 ubuntu:22.04 AS builder

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    build-essential \
    pkg-config \
    libudev-dev \
    libssl-dev \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Rust nightly (edition2024 still required by Anchor ecosystem dependencies)
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain nightly
RUN rustup component add rustfmt clippy

# Install Solana CLI manually (installer script has SSL issues in Docker)
RUN mkdir -p /opt/solana && \
    wget https://github.com/solana-labs/solana/releases/download/v1.18.18/solana-release-x86_64-unknown-linux-gnu.tar.bz2 && \
    tar -xjf solana-release-x86_64-unknown-linux-gnu.tar.bz2 && \
    cp -r solana-release/bin/* /usr/local/bin/ && \
    rm -rf solana-release solana-release-x86_64-unknown-linux-gnu.tar.bz2

# Verify Solana installation
RUN solana --version

# Install Anchor CLI 0.31.0
RUN cargo install --git https://github.com/coral-xyz/anchor --tag v0.31.0 anchor-cli --locked --force

# Set working directory
WORKDIR /workspace

# Copy workspace files
COPY Anchor.toml Cargo.toml ./
COPY programs ./programs

# Build the program
# Delete any existing Cargo.lock files and use -Znext-lockfile-bump for version 4 compatibility
RUN find . -name "Cargo.lock" -type f -delete && \
    cargo -Znext-lockfile-bump build || \
    (cd programs/otusfx && cargo -Znext-lockfile-bump build-sbf) || \
    anchor build

# Output stage - copy built artifacts
FROM scratch AS artifacts
COPY --from=builder /workspace/target/deploy/*.so /
COPY --from=builder /workspace/target/idl/*.json /
