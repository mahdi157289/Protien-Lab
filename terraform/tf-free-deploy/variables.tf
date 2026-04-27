# ==============================================================================
# variables.tf
# ------------------------------------------------------------------------------
# ALL inputs for this deployment live here.
# Your IDE should read this file first and fill in terraform.tfvars
# based on the project context.
#
# RULES:
#   - Every variable has a description the IDE can read
#   - Sensitive values (passwords, keys) are marked sensitive = true
#   - All variables have safe defaults where possible
#   - Required variables have no default → IDE must provide them
# ==============================================================================


# ╔══════════════════════════════════════════════════════════════════════════════
# ║  SECTION 1 — PROJECT IDENTITY
# ║  These values are used to name and tag every AWS resource.
# ╚══════════════════════════════════════════════════════════════════════════════

variable "project_name" {
  description = <<EOT
Short unique name for this project.
Used as prefix for ALL resource names (e.g. "proteinlab-production-ec2").
Rules: lowercase, no spaces, hyphens allowed.
Examples: "proteinlab", "myshop", "portfolioapp"
EOT
  type = string
}

variable "environment" {
  description = "Deployment stage. Used in resource names and tags."
  type        = string
  default     = "production"
  # Options: "production" | "staging" | "dev"
}

variable "owner" {
  description = "Your name or team. Appears in AWS resource tags for cost tracking."
  type        = string
  # Example: "mahdi" or "backend-team"
}


# ╔══════════════════════════════════════════════════════════════════════════════
# ║  SECTION 2 — AWS SETTINGS
# ╚══════════════════════════════════════════════════════════════════════════════

variable "aws_region" {
  description = <<EOT
AWS region where all resources will be created.
us-east-1 is recommended — has the most free tier coverage and lowest latency.
EOT
  type    = string
  default = "us-east-1"
  # Other options: "us-west-2" | "eu-west-1" | "ap-southeast-1"
}


# ╔══════════════════════════════════════════════════════════════════════════════
# ║  SECTION 3 — YOUR APPLICATION
# ║  Tell Terraform what Docker image to run and how.
# ╚══════════════════════════════════════════════════════════════════════════════

variable "docker_image" {
  description = <<EOT
Full Docker image URI to pull and run on the server.
This can be from Docker Hub, ECR, GHCR, or any public/private registry.

Examples:
  Docker Hub public  → "nginx:latest"
  Docker Hub private → "yourusername/yourapp:v1.2"
  AWS ECR            → "123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:latest"
  GitHub Container   → "ghcr.io/username/repo:latest"

IDE: set this to the project's main application Docker image.
EOT
  type = string
}

variable "app_port" {
  description = <<EOT
The TCP port your Docker container listens on INSIDE the container.
Nginx will forward all web traffic to this port.

Common values:
  3000 → Next.js, Express, NestJS, React dev server
  8000 → Django, FastAPI, Python apps
  8080 → Spring Boot, Go apps
  80   → Apache, plain Nginx inside container
  5000 → Flask

IDE: check the project's Dockerfile for EXPOSE or the app's default port.
EOT
  type    = number
  default = 3000
}

variable "app_health_check_path" {
  description = <<EOT
HTTP path that returns 200 OK when your app is healthy.
Used by Nginx to verify the app is running.

Examples:
  "/"              → homepage (works for most apps)
  "/health"        → dedicated health endpoint
  "/api/health"    → API health check
  "/ping"          → simple ping endpoint

IDE: check if the project has a dedicated health check route.
EOT
  type    = string
  default = "/"
}

variable "docker_registry_auth" {
  description = <<EOT
Set to true if your Docker image is in a PRIVATE registry that requires login.
If true, also fill in docker_registry_server, docker_registry_username, docker_registry_password.
Set to false for public Docker Hub images.
EOT
  type    = bool
  default = false
}

variable "docker_registry_server" {
  description = "Private registry URL. Only needed if docker_registry_auth = true. Example: 'https://index.docker.io/v1/' for Docker Hub private."
  type        = string
  default     = ""
}

variable "docker_registry_username" {
  description = "Registry username. Only needed if docker_registry_auth = true."
  type      = string
  default   = ""
  sensitive = true
}

variable "docker_registry_password" {
  description = "Registry password or token. Only needed if docker_registry_auth = true."
  type      = string
  default   = ""
  sensitive = true
}

variable "app_env_vars" {
  description = <<EOT
Environment variables injected into the Docker container at runtime.
These are stored ENCRYPTED in AWS SSM Parameter Store — not in plain text.

Always include at minimum:
  NODE_ENV = "production"   (for Node.js apps)

IDE: add ALL environment variables the project needs to run.
Common ones:
  DATABASE_URL      → database connection string
  SECRET_KEY        → app secret / JWT secret
  API_KEY           → third-party API key
  REDIS_URL         → cache connection string
  STRIPE_KEY        → payment processor
  SENDGRID_API_KEY  → email service
  S3_BUCKET_NAME    → auto-filled by Terraform if enable_s3 = true

⚠️  Never hardcode secrets here — use terraform.tfvars (which is gitignored)
EOT
  type      = map(string)
  default   = {}
}

variable "container_memory_limit" {
  description = "Docker container memory limit in MB. Prevents one container from using all RAM. For t2.micro (1GB RAM), keep this at 768 or below."
  type        = number
  default     = 768
}

variable "container_cpu_shares" {
  description = "Docker CPU shares (relative weight). 1024 = 1 full CPU core. For t2.micro use 512."
  type        = number
  default     = 512
}


# ╔══════════════════════════════════════════════════════════════════════════════
# ║  SECTION 4 — DOMAIN & SSL
# ╚══════════════════════════════════════════════════════════════════════════════

variable "domain_name" {
  description = <<EOT
Your root domain name (purchased from Namecheap, GoDaddy, etc.).
After deployment, you will manually point this domain to the EC2 IP address.
SSL certificate will be issued for both root domain and www subdomain.

Example: "proteinlab.com" → covers proteinlab.com AND www.proteinlab.com

IDE: set this to the project's primary domain.
EOT
  type = string
}

variable "certbot_email" {
  description = "Email for Let's Encrypt SSL certificate. Used for expiry notifications and renewal alerts."
  type        = string
  # Example: "mahdi@gmail.com"
}

variable "enable_www_redirect" {
  description = "If true, redirects www.yourdomain.com → yourdomain.com. Set to false if you want www as primary."
  type        = bool
  default     = true
}


# ╔══════════════════════════════════════════════════════════════════════════════
# ║  SECTION 5 — EC2 SERVER
# ╚══════════════════════════════════════════════════════════════════════════════

variable "instance_type" {
  description = <<EOT
EC2 instance type. Determines CPU and RAM available to your server.

FREE TIER (12 months):
  t2.micro  → 1 vCPU, 1 GB RAM  ← default, good for most apps

PAID (if you need more power after free tier):
  t3.small  → 2 vCPU, 2 GB RAM  (~$15/mo)
  t3.medium → 2 vCPU, 4 GB RAM  (~$30/mo)
  t3.large  → 2 vCPU, 8 GB RAM  (~$60/mo)
EOT
  type    = string
  default = "t2.micro"
}

variable "ami_id" {
  description = <<EOT
Amazon Machine Image — the OS your EC2 server runs.
Default is Amazon Linux 2 in us-east-1 (lightweight, Docker-ready, free).

⚠️  If you change aws_region, you MUST update this AMI ID!
Find the correct AMI at:
  https://console.aws.amazon.com/ec2/v2/home#AMICatalog

AMI IDs by region (Amazon Linux 2):
  us-east-1  → ami-0c02fb55956c7d316  ← default
  us-west-2  → ami-0ceecbb0f30a902a6
  eu-west-1  → ami-0d71ea30463e0ff49
  ap-southeast-1 → ami-0dc5785603ad4ff54
EOT
  type    = string
  default = "ami-0c02fb55956c7d316"
}

variable "root_volume_size_gb" {
  description = "EC2 root disk size in GB. Free tier includes 30GB. Increase if your Docker images are large."
  type        = number
  default     = 20
  # Free tier limit: 30GB total across all EBS volumes
}

variable "ssh_allowed_cidr" {
  description = <<EOT
IP range allowed to SSH into your server.
"0.0.0.0/0" = any IP can attempt SSH (still requires your private key).
For extra security, replace with your home IP: "YOUR_IP/32"
Find your IP at: https://whatismyip.com
EOT
  type    = string
  default = "0.0.0.0/0"
}

variable "enable_elastic_ip" {
  description = "Assign a permanent public IP (Elastic IP) to your EC2. Strongly recommended — prevents IP from changing on server restart. Free while instance is running."
  type        = bool
  default     = true
}


# ╔══════════════════════════════════════════════════════════════════════════════
# ║  SECTION 6 — S3 STORAGE
# ║  For storing user uploads, media files, backups, etc.
# ╚══════════════════════════════════════════════════════════════════════════════

variable "enable_s3" {
  description = "Create an S3 bucket for file/asset storage. Free tier: 5GB storage + 20k GET + 2k PUT requests/month."
  type        = bool
  default     = true
}

variable "s3_versioning" {
  description = "Keep previous versions of files. Protects against accidental overwrites. Uses more storage."
  type        = bool
  default     = true
}

variable "s3_lifecycle_days" {
  description = "Auto-delete old file versions after this many days. Keeps storage costs low."
  type        = number
  default     = 30
}

variable "s3_cors_allowed_origins" {
  description = <<EOT
Domains allowed to upload/download from S3 directly from the browser.
IDE: set this to your domain name.
Example: ["https://proteinlab.com", "https://www.proteinlab.com"]
EOT
  type    = list(string)
  default = ["*"]
}


# ╔══════════════════════════════════════════════════════════════════════════════
# ║  SECTION 7 — CLOUDWATCH MONITORING
# ║  Logs, metrics, alerts, and dashboard.
# ╚══════════════════════════════════════════════════════════════════════════════

variable "enable_cloudwatch" {
  description = "Enable CloudWatch monitoring. Includes: app logs, Nginx logs, CPU/RAM/disk metrics, 4 alarms, email alerts, live dashboard. Free tier: 10 alarms + 5GB logs/month."
  type        = bool
  default     = true
}

variable "alarm_email" {
  description = "Email address that receives alert notifications when alarms trigger (CPU spike, disk full, server down, etc.)."
  type        = string
  # Example: "mahdi@gmail.com"
}

variable "log_retention_days" {
  description = "How many days to keep logs in CloudWatch before auto-deletion. Free tier friendly: keep at 14."
  type        = number
  default     = 14
}

variable "cpu_alarm_threshold" {
  description = "CPU % that triggers an alert email. Default 80 = alert when CPU is above 80% for 5 minutes."
  type        = number
  default     = 80
}

variable "memory_alarm_threshold" {
  description = "RAM % that triggers an alert email."
  type        = number
  default     = 85
}

variable "disk_alarm_threshold" {
  description = "Disk usage % that triggers an alert email."
  type        = number
  default     = 80
}


# ╔══════════════════════════════════════════════════════════════════════════════
# ║  SECTION 8 — ECR (OPTIONAL)
# ║  Mirror your Docker Hub image into AWS for faster + more reliable pulls.
# ╚══════════════════════════════════════════════════════════════════════════════

variable "enable_ecr" {
  description = <<EOT
Create a private AWS ECR repository and pull images from it instead of Docker Hub.
Benefits: faster pulls (same AWS network), no Docker Hub rate limits, private.
Only enable if you plan to push images to ECR.
EOT
  type    = bool
  default = false
}

variable "ecr_repo_name" {
  description = "ECR repository name. Only used if enable_ecr = true. IDE: use project_name + '-app'."
  type        = string
  default     = ""
}
