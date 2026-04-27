# ==============================================================================
# modules/ecr/main.tf — AWS Elastic Container Registry
# ------------------------------------------------------------------------------
# Creates a private Docker registry inside your AWS account.
# Use this to mirror your Docker Hub image into AWS for:
#   ✓ Faster pulls (EC2 → ECR is internal AWS network, very fast)
#   ✓ No Docker Hub rate limits (100 pulls/6hr on free Docker Hub)
#   ✓ Private (image not publicly accessible)
#   ✓ Security scanning on every push
#
# After creating, push your image with the commands in outputs.tf
# ==============================================================================

variable "repo_name"   {}
variable "project"     {}
variable "environment" {}


resource "aws_ecr_repository" "main" {
  name                 = var.repo_name
  image_tag_mutability = "MUTABLE"  # allows re-tagging :latest

  # Scan for known CVE vulnerabilities every time you push
  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

# Keep only the last 10 images — older ones are auto-deleted
# Prevents unbounded storage cost as you keep deploying new versions
resource "aws_ecr_lifecycle_policy" "main" {
  repository = aws_ecr_repository.main.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep only 10 most recent images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}


output "repository_uri"  { value = aws_ecr_repository.main.repository_url }
output "repository_name" { value = aws_ecr_repository.main.name }
