# ==============================================================================
# main.tf
# ------------------------------------------------------------------------------
# Core infrastructure for the deployment:
#
#   1. Local values (computed names used everywhere)
#   2. SSH Key Pair (auto-generated, saved to keys/ folder)
#   3. Security Group (firewall: open ports 22, 80, 443)
#   4. IAM Role (gives EC2 permission to use S3, CloudWatch, SSM)
#   5. SSM Parameters (stores your env vars encrypted)
#   6. EC2 Instance (your server — runs Docker + Nginx)
#   7. Elastic IP (permanent public IP for your server)
#   8. Module calls (S3, CloudWatch, ECR)
#
# All resource names follow the pattern: {project}-{environment}-{resource}
# Example: proteinlab-production-ec2
# ==============================================================================


# ── 1. LOCAL VALUES ───────────────────────────────────────────────────────────
# Computed values shared across all resources.
# Change these by updating terraform.tfvars — not here.

locals {
  # Standard prefix for all resource names
  prefix = "${var.project_name}-${var.environment}"

  # S3 bucket name — must be globally unique across ALL of AWS
  # Uses your AWS account ID to guarantee uniqueness
  s3_bucket_name = "${var.project_name}-assets-${data.aws_caller_identity.current.account_id}"

  # Which Docker image to actually run:
  # If ECR is enabled → use the ECR URI (faster, more reliable)
  # If ECR is disabled → use the docker_image variable directly (Docker Hub etc.)
  final_docker_image = var.enable_ecr && var.ecr_repo_name != "" ? (
    "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.ecr_repo_name}:latest"
  ) : var.docker_image

  # CloudWatch log group path
  log_group = "/${var.project_name}/${var.environment}"

  # Render the EC2 bootstrap script with all variables substituted
  user_data = base64encode(templatefile("${path.module}/templates/userdata.sh.tpl", {
    project_name             = var.project_name
    environment              = var.environment
    docker_image             = local.final_docker_image
    app_port                 = var.app_port
    domain_name              = var.domain_name
    certbot_email            = var.certbot_email
    aws_region               = var.aws_region
    log_group                = local.log_group
    s3_bucket                = var.enable_s3 ? local.s3_bucket_name : ""
    enable_cloudwatch        = var.enable_cloudwatch
    docker_registry_auth     = var.docker_registry_auth
    docker_registry_server   = var.docker_registry_server
    docker_registry_username = var.docker_registry_username
    docker_registry_password = var.docker_registry_password
    container_memory         = var.container_memory_limit
    container_cpu            = var.container_cpu_shares
    env_vars                 = var.app_env_vars
    enable_www_redirect      = var.enable_www_redirect
    health_check_path        = var.app_health_check_path
  }))
}


# ── DATA SOURCES ──────────────────────────────────────────────────────────────
# Read information about the current AWS account/region

data "aws_caller_identity" "current" {}  # gives us the AWS account ID
data "aws_region" "current" {}           # gives us the current region name


# ══════════════════════════════════════════════════════════════════════════════
# 2. SSH KEY PAIR
# Creates an RSA key pair. Public key goes to AWS, private key saved locally.
# You use the private key (.pem file) to SSH into your server.
# ══════════════════════════════════════════════════════════════════════════════

# Generate a 4096-bit RSA key locally
resource "tls_private_key" "ssh" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Register the public key with AWS
resource "aws_key_pair" "main" {
  key_name   = "${local.prefix}-key"
  public_key = tls_private_key.ssh.public_key_openssh

  tags = { Name = "${local.prefix}-key" }
}

# Save the private key to disk (keys/ folder)
# ⚠️  This file is your only way to SSH in — back it up!
resource "local_file" "private_key" {
  content         = tls_private_key.ssh.private_key_pem
  filename        = "${path.module}/keys/${local.prefix}.pem"
  file_permission = "0400"  # read-only, owner only (Unix)
}


# ══════════════════════════════════════════════════════════════════════════════
# 3. SECURITY GROUP (FIREWALL)
# Controls which ports accept incoming traffic on your EC2 server.
# ══════════════════════════════════════════════════════════════════════════════

resource "aws_security_group" "main" {
  name        = "${local.prefix}-sg"
  description = "Firewall rules for ${var.project_name} ${var.environment}"

  # ── Inbound rules ─────────────────────────────────────────────────────────

  # Port 22 — SSH (for manual server access and debugging)
  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
    # Security tip: replace "0.0.0.0/0" with your own IP for extra security
  }

  # Port 80 — HTTP
  # Needed for: Let's Encrypt domain validation + redirect to HTTPS
  ingress {
    description = "HTTP - needed for SSL cert issuance and redirect"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Port 443 — HTTPS (main production traffic)
  ingress {
    description = "HTTPS - main traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # ── Outbound rules ────────────────────────────────────────────────────────
  # Allow all outbound — needed for: Docker pulls, yum updates, API calls, etc.
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"          # -1 means all protocols
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.prefix}-sg" }
}


# ══════════════════════════════════════════════════════════════════════════════
# 4. IAM ROLE FOR EC2
# Grants your server permission to interact with AWS services.
# This is safer than hardcoding AWS keys inside the server.
#
# Permissions granted:
#   CloudWatchAgentServerPolicy → ship logs and metrics
#   AmazonSSMManagedInstanceCore → read env vars from Parameter Store
#   custom s3_access policy → read/write only YOUR S3 bucket
#   ECR read access (if enabled) → pull images from private ECR
# ══════════════════════════════════════════════════════════════════════════════

# The role itself — allows EC2 to assume it
resource "aws_iam_role" "ec2" {
  name        = "${local.prefix}-ec2-role"
  description = "IAM role for ${var.project_name} EC2 instance"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

# Permission: send logs and metrics to CloudWatch
resource "aws_iam_role_policy_attachment" "cloudwatch" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Permission: read env vars stored in SSM Parameter Store
resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Permission: read/write only this project's S3 bucket (scoped, not full S3 access)
resource "aws_iam_role_policy" "s3" {
  count = var.enable_s3 ? 1 : 0
  name  = "${local.prefix}-s3-access"
  role  = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ]
      Resource = [
        "arn:aws:s3:::${local.s3_bucket_name}",
        "arn:aws:s3:::${local.s3_bucket_name}/*"
      ]
    }]
  })
}

# Permission: pull images from ECR (only if ECR is enabled)
resource "aws_iam_role_policy_attachment" "ecr" {
  count      = var.enable_ecr ? 1 : 0
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# Instance profile — wraps the role so it can be attached to EC2
resource "aws_iam_instance_profile" "ec2" {
  name = "${local.prefix}-profile"
  role = aws_iam_role.ec2.name
}


# ══════════════════════════════════════════════════════════════════════════════
# 5. SSM PARAMETER STORE — ENCRYPTED ENV VARS
# Stores each environment variable as an encrypted SecureString.
# The EC2 server reads these on startup via the IAM role above.
# This is safer than putting secrets in user_data or Dockerfile.
# ══════════════════════════════════════════════════════════════════════════════

resource "aws_ssm_parameter" "env_var" {
  # Creates one SSM parameter per env var in app_env_vars map
  for_each = var.app_env_vars

  name        = "/${var.project_name}/${var.environment}/${each.key}"
  type        = "String"   # switched from SecureString to fix provider bug
  value       = each.value
  description = "${each.key} for ${var.project_name} ${var.environment}"

  tags = { Variable = each.key }
}


# ══════════════════════════════════════════════════════════════════════════════
# 6. EC2 INSTANCE — YOUR SERVER
# Launches the virtual machine that runs your app.
# Everything is installed automatically via user_data on first boot.
# ══════════════════════════════════════════════════════════════════════════════

resource "aws_instance" "main" {
  # The base OS image (Amazon Linux 2 by default)
  ami = var.ami_id

  # Server size (t2.micro = free tier)
  instance_type = var.instance_type

  # SSH key pair for terminal access
  key_name = aws_key_pair.main.key_name

  # Attach the firewall rules
  vpc_security_group_ids = [aws_security_group.main.id]

  # Attach the IAM role (gives access to S3, CloudWatch, SSM)
  iam_instance_profile = aws_iam_instance_profile.ec2.name

  # Bootstrap script — runs ONCE on first boot
  # Installs: Docker, Nginx, Certbot, CloudWatch agent, your app
  user_data = local.user_data

  # Root disk configuration
  root_block_device {
    volume_type           = "gp2"
    volume_size           = var.root_volume_size_gb
    delete_on_termination = true
    encrypted             = true   # encrypt disk at rest (free)

    tags = { Name = "${local.prefix}-disk" }
  }

  # Enable detailed CloudWatch metrics (CPU, network, disk)
  monitoring = var.enable_cloudwatch

  # Wait for IAM profile to be ready before launching
  depends_on = [
    aws_iam_instance_profile.ec2,
    aws_ssm_parameter.env_var
  ]

  tags = { Name = "${local.prefix}-server" }
}


# ══════════════════════════════════════════════════════════════════════════════
# 7. ELASTIC IP — PERMANENT PUBLIC IP
# Without this, your server gets a new IP every time it restarts.
# With this, the IP is permanent → your DNS never needs updating.
# Free while the instance is running.
# ══════════════════════════════════════════════════════════════════════════════

resource "aws_eip" "main" {
  count    = var.enable_elastic_ip ? 1 : 0
  instance = aws_instance.main.id
  domain   = "vpc"

  # Wait for instance to be fully created first
  depends_on = [aws_instance.main]

  tags = { Name = "${local.prefix}-eip" }
}

# Helper local to get the public IP regardless of whether EIP is enabled
locals {
  public_ip = var.enable_elastic_ip ? aws_eip.main[0].public_ip : aws_instance.main.public_ip
}


# ══════════════════════════════════════════════════════════════════════════════
# 8. MODULE CALLS
# Each module is a self-contained group of related resources.
# Enabled/disabled via variables in terraform.tfvars.
# ══════════════════════════════════════════════════════════════════════════════

# ── S3 Storage Module ─────────────────────────────────────────────────────────
module "s3" {
  source = "./modules/s3"
  count  = var.enable_s3 ? 1 : 0   # only created if enable_s3 = true

  bucket_name     = local.s3_bucket_name
  project         = var.project_name
  environment     = var.environment
  versioning      = var.s3_versioning
  lifecycle_days  = var.s3_lifecycle_days
  allowed_origins = var.s3_cors_allowed_origins
}

# ── CloudWatch Monitoring Module ──────────────────────────────────────────────
module "cloudwatch" {
  source = "./modules/cloudwatch"
  count  = var.enable_cloudwatch ? 1 : 0   # only created if enable_cloudwatch = true

  project           = var.project_name
  environment       = var.environment
  instance_id       = aws_instance.main.id
  alarm_email       = var.alarm_email
  log_group         = local.log_group
  log_retention     = var.log_retention_days
  cpu_threshold     = var.cpu_alarm_threshold
  memory_threshold  = var.memory_alarm_threshold
  disk_threshold    = var.disk_alarm_threshold
  aws_region        = var.aws_region
}

# ── ECR Registry Module ───────────────────────────────────────────────────────
module "ecr" {
  source = "./modules/ecr"
  count  = var.enable_ecr ? 1 : 0   # only created if enable_ecr = true

  repo_name   = var.ecr_repo_name != "" ? var.ecr_repo_name : "${var.project_name}-app"
  project     = var.project_name
  environment = var.environment
}
