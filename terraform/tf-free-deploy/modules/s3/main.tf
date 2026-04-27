# ==============================================================================
# modules/s3/main.tf — S3 Asset Storage
# ------------------------------------------------------------------------------
# Creates a private S3 bucket for storing files your app uploads/reads.
# Common uses: user profile images, product photos, file uploads, exports.
#
# Features:
#   ✓ Private (not publicly accessible — files served via your app)
#   ✓ Encrypted at rest (AES-256, free)
#   ✓ Versioning (keeps file history, protects against accidental deletes)
#   ✓ CORS configured (allows your domain to upload directly from browser)
#   ✓ Lifecycle rules (auto-deletes old versions to save storage)
#
# Free tier: 5GB storage + 20,000 GET + 2,000 PUT requests/month
# ==============================================================================

# ── Input Variables ───────────────────────────────────────────────────────────

variable "bucket_name"      { description = "Globally unique S3 bucket name" }
variable "project"          { description = "Project name for tagging" }
variable "environment"      { description = "Environment for tagging" }
variable "versioning"       { default = true }
variable "lifecycle_days"   { default = 30 }
variable "allowed_origins" {
  type    = list(string)
  default = ["*"]
}


# ── S3 Bucket ─────────────────────────────────────────────────────────────────

resource "aws_s3_bucket" "main" {
  bucket = var.bucket_name

  # Prevents accidental deletion when running terraform destroy
  # Remove this if you want terraform destroy to delete the bucket
  lifecycle {
    prevent_destroy = false   # set to true in production after you have real data
  }

  tags = {
    Name        = var.bucket_name
    Project     = var.project
    Environment = var.environment
  }
}


# ── Block All Public Access ───────────────────────────────────────────────────
# Files are only accessible via your app (using the IAM role), not directly.
# This prevents accidental exposure of sensitive uploaded files.

resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}


# ── Versioning ────────────────────────────────────────────────────────────────
# Keeps previous versions of every file.
# If a user uploads a new file with the same name, old version is preserved.
# Lifecycle rule below auto-deletes old versions after N days.

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = var.versioning ? "Enabled" : "Disabled"
  }
}


# ── Encryption at Rest ────────────────────────────────────────────────────────
# All files encrypted using AES-256. Free, no performance impact.

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}


# ── Lifecycle Rules ───────────────────────────────────────────────────────────
# Automatically delete old file versions after N days to save storage costs.
# Also cleans up incomplete multipart uploads (can accumulate and waste space).

resource "aws_s3_bucket_lifecycle_configuration" "main" {
  count  = var.versioning ? 1 : 0
  bucket = aws_s3_bucket.main.id

  rule {
    id     = "cleanup-noncurrent-versions"
    status = "Enabled"

    filter {}

    # Delete old file versions after N days
    noncurrent_version_expiration {
      noncurrent_days = var.lifecycle_days
    }

    # Clean up failed multipart uploads after 7 days
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  depends_on = [aws_s3_bucket_versioning.main]
}


# ── CORS Configuration ────────────────────────────────────────────────────────
# Allows your frontend to upload files directly to S3 from the browser.
# Without this, browser uploads are blocked by CORS policy.

resource "aws_s3_bucket_cors_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag", "Content-Length", "Content-Type"]
    max_age_seconds = 3600
  }
}


# ── Outputs ───────────────────────────────────────────────────────────────────

output "bucket_name" {
  description = "S3 bucket name to use in your app's AWS_S3_BUCKET env var"
  value       = aws_s3_bucket.main.id
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.main.arn
}

output "bucket_region" {
  description = "AWS region where the bucket lives"
  value       = aws_s3_bucket.main.region
}
