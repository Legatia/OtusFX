#!/bin/bash

# Build the Solana program using Docker
echo "🐳 Building OtusFX program in Docker..."

# Build the Docker image and program
docker build --target builder -t otusfx-builder .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Build successful! Extracting artifacts..."

# Create output directory
mkdir -p target/deploy
mkdir -p target/idl

# Extract the built .so and IDL files
docker create --name temp-container otusfx-builder
docker cp temp-container:/workspace/target/deploy/. target/deploy/
docker cp temp-container:/workspace/target/idl/. target/idl/
docker rm temp-container

echo "✅ Artifacts extracted to target/deploy and target/idl"
echo ""
echo "📦 Built program:"
ls -lh target/deploy/*.so
echo ""
echo "📄 IDL file:"
ls -lh target/idl/*.json
