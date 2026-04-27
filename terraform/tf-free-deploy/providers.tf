# ==============================================================================
# providers.tf
# ------------------------------------------------------------------------------
# Declares which external plugins Terraform needs to download.
# Run "terraform init" once to install them automatically.
#
# Providers used:
#   aws   → creates all AWS resources (EC2, S3, IAM, CloudWatch...)
#   tls   → generates the SSH key pair locally
#   local → saves the private key .pem file to your disk
# ==============================================================================

terraform {
  # Minimum Terraform version required
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"   # use any 5.x version
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }

  # ── Optional: Store Terraform state remotely (for teams) ──────────────────
  # Uncomment this block if you want state stored in S3 instead of locally.
  # Create the bucket manually first, then run: terraform init -migrate-state
  #
  # backend "s3" {
  #   bucket  = "YOUR_PROJECT-terraform-state"
  #   key     = "production/terraform.tfstate"
  #   region  = "us-east-1"
  #   encrypt = true
  # }
}

# ── AWS Provider ──────────────────────────────────────────────────────────────
# Reads credentials from ~/.aws/credentials (set by "aws configure")
# No hardcoded keys here — credentials come from your local AWS CLI config

provider "aws" {
  region = var.aws_region

  # These tags are applied to EVERY resource Terraform creates.
  # Makes it easy to find all project resources in AWS Console.
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      Owner       = var.owner
      ManagedBy   = "terraform"
    }
  }
}
