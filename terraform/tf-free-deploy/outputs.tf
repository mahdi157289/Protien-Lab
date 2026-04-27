# ==============================================================================
# outputs.tf
# ------------------------------------------------------------------------------
# Values printed in your terminal after "terraform apply" completes.
# Use these to:
#   - Get your server IP to configure DNS
#   - SSH into your server
#   - Enable HTTPS after DNS propagates
#   - View your CloudWatch dashboard
# ==============================================================================


# ── Server Info ───────────────────────────────────────────────────────────────

output "server_public_ip" {
  description = "Your server's public IP. Point your domain's A records to this."
  value       = local.public_ip
}

output "server_instance_id" {
  description = "EC2 instance ID. Useful in AWS Console."
  value       = aws_instance.main.id
}

output "server_instance_type" {
  description = "EC2 instance type running your app."
  value       = aws_instance.main.instance_type
}


# ── Access ────────────────────────────────────────────────────────────────────

output "ssh_command" {
  description = "Ready-to-run SSH command. Use this to connect to your server."
  value       = "ssh -i keys/${local.prefix}.pem ec2-user@${local.public_ip}"
}

output "app_url_ip" {
  description = "Your app via IP address (before DNS is set up). Test this first."
  value       = "http://${local.public_ip}"
}

output "app_url_domain" {
  description = "Your app's final URL (after DNS and SSL are configured)."
  value       = "https://${var.domain_name}"
}


# ── Step-by-step next actions ─────────────────────────────────────────────────

output "next_step_1_test_app" {
  description = "STEP 1 — Test your app is running (before DNS)"
  value       = "Open in browser: http://${local.public_ip}"
}

output "next_step_2_dns" {
  description = "STEP 2 — Configure DNS in Namecheap"
  value       = <<EOT

Go to: namecheap.com → Domain List → ${var.domain_name} → Manage → Advanced DNS

Add these 2 A records:
  Type: A Record  |  Host: @    |  Value: ${local.public_ip}  |  TTL: Automatic
  Type: A Record  |  Host: www  |  Value: ${local.public_ip}  |  TTL: Automatic

Then wait 5–30 minutes and check: https://dnschecker.org/#A/${var.domain_name}
EOT
}

output "next_step_3_ssl" {
  description = "STEP 3 — Enable free HTTPS (run AFTER DNS has propagated)"
  value       = "ssh -i keys/${local.prefix}.pem ec2-user@${local.public_ip} 'sudo certbot --nginx -d ${var.domain_name} -d www.${var.domain_name} --non-interactive --agree-tos -m ${var.certbot_email} --redirect'"
}

output "next_step_4_cloudflare" {
  description = "STEP 4 — Add Cloudflare CDN (manual, free forever)"
  value       = "Go to cloudflare.com → Add site → ${var.domain_name} → Free plan → set A records as Proxied (orange cloud) → copy nameservers → paste in Namecheap"
}


# ── S3 ────────────────────────────────────────────────────────────────────────

output "s3_bucket_name" {
  description = "S3 bucket name. Use this in your app's file upload code."
  value       = var.enable_s3 ? module.s3[0].bucket_name : "S3 disabled — set enable_s3 = true to enable"
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN."
  value       = var.enable_s3 ? module.s3[0].bucket_arn : "S3 disabled"
}


# ── CloudWatch ────────────────────────────────────────────────────────────────

output "cloudwatch_dashboard" {
  description = "Direct link to your live monitoring dashboard in AWS Console."
  value       = var.enable_cloudwatch ? "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${local.prefix}" : "CloudWatch disabled"
}

output "cloudwatch_logs" {
  description = "Direct link to your app logs in CloudWatch."
  value       = var.enable_cloudwatch ? "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#logsV2:log-groups/log-group/${replace(local.log_group, "/", "%2F")}" : "CloudWatch disabled"
}

output "cloudwatch_alert_note" {
  description = "Important — confirm your email subscription to receive alerts."
  value       = var.enable_cloudwatch ? "⚠️  Check ${var.alarm_email} inbox and click 'Confirm subscription' in the AWS email" : "CloudWatch disabled"
}


# ── ECR ───────────────────────────────────────────────────────────────────────

output "ecr_repository_uri" {
  description = "ECR repository URI. Push your image here for faster pulls."
  value       = var.enable_ecr ? module.ecr[0].repository_uri : "ECR disabled — set enable_ecr = true to enable"
}

output "ecr_push_commands" {
  description = "Commands to push your Docker image to ECR."
  value       = var.enable_ecr ? "ECR is enabled. Repo logic would go here." : "ECR disabled"
}


# ── Full Summary ──────────────────────────────────────────────────────────────

output "deployment_summary" {
  description = "Complete deployment summary."
  value       = <<EOT

╔════════════════════════════════════════════════════════════╗
║  ✅  ${var.project_name} — ${var.environment} — Deployed!
╠════════════════════════════════════════════════════════════╣
║
║  🖥️   Server IP   : ${local.public_ip}
║  🌍  App URL     : https://${var.domain_name}
║  🐳  Image       : ${local.final_docker_image}
║  🔌  Port        : ${var.app_port}
║
║  🔑  SSH         : ssh -i keys/${local.prefix}.pem ec2-user@${local.public_ip}
║
║  🪣  S3 Bucket   : ${var.enable_s3 ? local.s3_bucket_name : "disabled"}
║  📊  CloudWatch  : ${var.enable_cloudwatch ? "enabled" : "disabled"}
║  📦  ECR         : ${var.enable_ecr ? "enabled" : "disabled"}
║
╠════════════════════════════════════════════════════════════╣
║  📋  NEXT STEPS:
║  1.  Open http://${local.public_ip} — verify app works
║  2.  Add A records in Namecheap → ${local.public_ip}
║  3.  Wait for DNS → run ssl command (see next_step_3_ssl)
║  4.  Setup Cloudflare CDN
║  5.  Confirm CloudWatch email subscription
╚════════════════════════════════════════════════════════════╝
EOT
}
