# ==============================================================================
# modules/cloudwatch/main.tf — Monitoring, Logs, Alerts, Dashboard
# ------------------------------------------------------------------------------
# Gives you full visibility into your running server:
#
#   Logs shipped:
#     /PROJECT/ENV          → app container logs
#     /PROJECT/ENV/nginx    → Nginx access + error logs
#
#   Metrics tracked (via CloudWatch agent on EC2):
#     CPU usage %
#     Memory usage %
#     Disk usage %
#
#   Alarms (email you when):
#     CPU    > threshold (default 80%) for 5 minutes
#     Memory > threshold (default 85%)
#     Disk   > threshold (default 80%)
#     Server status check fails (instance is down)
#
#   Dashboard:
#     Live graphs of all metrics + recent logs in one view
#
# Free tier: 10 custom metrics, 10 alarms, 5GB logs/month
# ==============================================================================

# ── Input Variables ───────────────────────────────────────────────────────────

variable "project"          {}
variable "environment"      {}
variable "instance_id"      { description = "EC2 instance ID to monitor" }
variable "alarm_email"      { description = "Email for alert notifications" }
variable "log_group"        { description = "CloudWatch log group path" }
variable "log_retention"    { default = 14 }
variable "cpu_threshold"    { default = 80 }
variable "memory_threshold" { default = 85 }
variable "disk_threshold"   { default = 80 }
variable "aws_region"       {}


# ── Log Groups ────────────────────────────────────────────────────────────────

# App container logs (Docker stdout/stderr)
resource "aws_cloudwatch_log_group" "app" {
  name              = var.log_group
  retention_in_days = var.log_retention  # auto-delete after N days (saves cost)

  tags = {
    Project     = var.project
    Environment = var.environment
    Type        = "application-logs"
  }
}

# Nginx logs (separate group for easier filtering)
resource "aws_cloudwatch_log_group" "nginx" {
  name              = "${var.log_group}/nginx"
  retention_in_days = var.log_retention
}


# ── SNS Topic + Email Subscription ───────────────────────────────────────────
# SNS = Simple Notification Service
# All alarms publish to this topic → topic emails you

resource "aws_sns_topic" "alerts" {
  name = "${var.project}-${var.environment}-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alarm_email
  # ⚠️  After terraform apply: check your inbox and click "Confirm subscription"
  #      You will NOT receive alerts until you confirm!
}


# ── Alarm 1: High CPU ─────────────────────────────────────────────────────────
# Triggers if CPU stays above threshold for 5 consecutive minutes.
# Usually means: traffic spike, infinite loop, memory swap, heavy processing.

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "${var.project}-${var.environment}-high-cpu"
  alarm_description   = "CPU usage above ${var.cpu_threshold}% — possible traffic spike or runaway process"
  namespace           = "AWS/EC2"
  metric_name         = "CPUUtilization"
  dimensions          = { InstanceId = var.instance_id }
  statistic           = "Average"
  period              = 300   # evaluate over 5-minute windows
  threshold           = var.cpu_threshold
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]   # also email when it recovers
}


# ── Alarm 2: Instance Down ────────────────────────────────────────────────────
# Triggers if EC2 fails its own status checks.
# Usually means: OS crash, kernel panic, hardware failure.

resource "aws_cloudwatch_metric_alarm" "instance_down" {
  alarm_name          = "${var.project}-${var.environment}-instance-down"
  alarm_description   = "EC2 status check failed — server may be unresponsive or crashed"
  namespace           = "AWS/EC2"
  metric_name         = "StatusCheckFailed"
  dimensions          = { InstanceId = var.instance_id }
  statistic           = "Maximum"
  period              = 60
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2   # must fail 2 checks in a row before alerting
  treat_missing_data  = "breaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
}


# ── Alarm 3: High Memory ──────────────────────────────────────────────────────
# Uses custom metric from CloudWatch agent installed on the server.
# t2.micro has only 1GB RAM — this is important to watch.

resource "aws_cloudwatch_metric_alarm" "memory_high" {
  alarm_name          = "${var.project}-${var.environment}-high-memory"
  alarm_description   = "Memory usage above ${var.memory_threshold}% — risk of OOM kill (app crash)"
  namespace           = var.project   # custom namespace from CloudWatch agent
  metric_name         = "mem_used_percent"
  statistic           = "Average"
  period              = 300
  threshold           = var.memory_threshold
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
}


# ── Alarm 4: High Disk ────────────────────────────────────────────────────────
# Docker images and logs accumulate over time.
# At 100% disk, your server will crash and the app will stop working.

resource "aws_cloudwatch_metric_alarm" "disk_high" {
  alarm_name          = "${var.project}-${var.environment}-high-disk"
  alarm_description   = "Disk usage above ${var.disk_threshold}% — clean Docker images or expand volume"
  namespace           = var.project
  metric_name         = "disk_used_percent"
  statistic           = "Average"
  period              = 300
  threshold           = var.disk_threshold
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
}


# ── CloudWatch Dashboard ──────────────────────────────────────────────────────
# Visual dashboard in AWS Console showing all metrics at a glance.
# Access at: https://console.aws.amazon.com/cloudwatch → Dashboards

/*
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project}-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      # CPU graph
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "CPU Utilization %"
          metrics = [["AWS/EC2", "CPUUtilization", "InstanceId", var.instance_id]]
          period  = 300
          stat    = "Average"
          view    = "timeSeries"
          yAxis   = { left = { min = 0, max = 100 } }
        }
      },
      # Memory graph
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "Memory Usage %"
          metrics = [[var.project, "mem_used_percent"]]
          period  = 300
          stat    = "Average"
          view    = "timeSeries"
          yAxis   = { left = { min = 0, max = 100 } }
        }
      },
      # Disk graph
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "Disk Usage %"
          metrics = [[var.project, "disk_used_percent"]]
          period  = 300
          stat    = "Average"
          view    = "timeSeries"
          yAxis   = { left = { min = 0, max = 100 } }
        }
      },
      # Live app logs
      {
        type   = "log"
        width  = 24
        height = 8
        properties = {
          title  = "App Logs (last 100 lines)"
          query  = "SOURCE '${var.log_group}' | fields @timestamp, @message | sort @timestamp desc | limit 100"
          region = var.aws_region
          view   = "table"
        }
      }
    ]
  })
}
*/


# ── Outputs ───────────────────────────────────────────────────────────────────

output "sns_topic_arn"    { value = aws_sns_topic.alerts.arn }
output "log_group_name"   { value = aws_cloudwatch_log_group.app.name }
// output "dashboard_name"   { value = aws_cloudwatch_dashboard.main.dashboard_name }
