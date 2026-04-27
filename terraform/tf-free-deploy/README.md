# 🚀 AWS Free Tier Terraform Deployment
### Generic · Modular · Any Docker Image · Fully Commented

---

## 🧠 For the IDE — Read This First

This is a **generic Terraform project** that deploys any Dockerized app to AWS Free Tier.
To adapt it for a specific project, the IDE must:

| File | What to do |
|---|---|
| `terraform.tfvars.example` | Copy → `terraform.tfvars`, fill ALL `<PLACEHOLDER>` values |
| `variables.tf` | Read all descriptions to understand what each variable does |
| `app_env_vars` | Add ALL environment variables the app needs to run |
| `docker_image` | Set to the project's Docker Hub image (`user/image:tag`) |
| `app_port` | Set to the container's listening port |
| `domain_name` | Set to the project's domain |

**Stack detection guide:**

| Stack | `app_port` | `app_health_check_path` | Key env vars |
|---|---|---|---|
| Next.js | 3000 | `/` | `NODE_ENV`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` |
| Express / NestJS | 3000 | `/` or `/health` | `NODE_ENV`, `PORT` |
| Django | 8000 | `/health/` | `DJANGO_SECRET_KEY`, `DATABASE_URL`, `ALLOWED_HOSTS` |
| FastAPI | 8000 | `/health` | `DATABASE_URL` |
| Flask | 5000 | `/` | `FLASK_ENV`, `SECRET_KEY` |
| Laravel | 80 | `/` | `APP_KEY`, `DB_*`, `APP_URL` |
| Spring Boot | 8080 | `/actuator/health` | `SPRING_DATASOURCE_URL` |

---

## 📁 Project Structure

```
tf-free-deploy/
│
├── 📄 main.tf                    Core infra: EC2, IAM, Security Group, EIP, SSM
├── 📄 variables.tf               All inputs — read this to understand the config
├── 📄 outputs.tf                 Printed after deploy: IP, SSH, DNS steps, URLs
├── 📄 providers.tf               AWS + TLS + Local provider setup
│
├── 📄 terraform.tfvars.example   ← COPY → terraform.tfvars and fill in
│
├── 📁 templates/
│   └── userdata.sh.tpl           EC2 bootstrap: installs Docker, Nginx, your app
│
├── 📁 modules/
│   ├── 📁 s3/                    S3 bucket: private storage, versioning, CORS
│   ├── 📁 cloudwatch/            Logs, metrics, 4 alarms, email alerts, dashboard
│   └── 📁 ecr/                   Private container registry (optional)
│
└── 📁 keys/                      SSH private key saved here after terraform apply
    └── (auto-generated .pem)
```

---

## ⚡ Quickstart

```powershell
# ── Prerequisites (do once) ──────────────────────────────────────────────────
# AWS CLI must be configured: run "aws configure" first
# Terraform must be installed

# ── Setup ────────────────────────────────────────────────────────────────────
# 1. Copy and fill in your config
copy terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars   # fill in your values

# ── Deploy ───────────────────────────────────────────────────────────────────
# 2. Download providers (~30 seconds, run once)
terraform init

# 3. Preview what will be created (no changes made)
terraform plan

# 4. Deploy everything (type 'yes' when prompted)
terraform apply
```

---

## 📋 What Gets Created

After `terraform apply`, you'll have:

| Resource | What it is | Free? |
|---|---|---|
| EC2 t2.micro | Your server | ✅ 750hrs/month |
| Elastic IP | Permanent public IP | ✅ While running |
| Security Group | Firewall (ports 22/80/443) | ✅ Always |
| SSH Key Pair | Terminal access key | ✅ Always |
| IAM Role | Server AWS permissions | ✅ Always |
| SSM Parameters | Encrypted env vars | ✅ Up to 10k |
| S3 Bucket | File storage | ✅ 5GB |
| CloudWatch Logs | App + Nginx logs | ✅ 5GB/mo |
| CloudWatch Alarms | 4 email alerts | ✅ 10 alarms |
| CloudWatch Dashboard | Live metrics view | ✅ 3 dashboards |

---

## 📋 Post-Deploy Steps

After `terraform apply` prints your IP address:

### Step 1 — Test your app (before DNS)
```
Open in browser: http://YOUR_EC2_IP
```

### Step 2 — Configure Namecheap DNS
```
Namecheap → Domain List → yourdomain.com → Advanced DNS

Add:
  A Record | @   | YOUR_EC2_IP | Automatic
  A Record | www | YOUR_EC2_IP | Automatic

Wait 5–30 minutes → check at dnschecker.org
```

### Step 3 — Enable HTTPS
```powershell
# Copy the exact command from terraform output next_step_3_ssl
terraform output next_step_3_ssl
# Then paste and run it
```

### Step 4 — Confirm CloudWatch email
```
Check your inbox for "AWS Notification — Subscription Confirmation"
Click "Confirm subscription"
```

### Step 5 — Setup Cloudflare CDN
```
cloudflare.com → Add site → Free plan
Set A records to Proxied (orange cloud)
Copy nameservers → paste in Namecheap → Custom DNS
SSL/TLS → Full mode
```

---

## 🔧 Useful Commands

```powershell
# View all output values
terraform output

# SSH into your server
$(terraform output -raw ssh_command)

# Check your app status (run after SSH)
docker ps
docker logs YOUR_PROJECT-app --tail 50

# Deploy a new image version
docker pull YOUR_IMAGE && docker restart YOUR_PROJECT-app

# View bootstrap log
cat /var/log/YOUR_PROJECT-bootstrap.log

# Destroy everything (⚠️ deletes all resources)
terraform destroy
```

---

## 💰 Cost Summary

| Period | Monthly Cost |
|---|---|
| Months 1–12 (free tier) | ~$0 |
| After 12 months | ~$13/month |
| Cloudflare CDN | $0 forever |
| Let's Encrypt SSL | $0 forever |

---

## 🔒 Security Notes

- **SSH key** auto-generated → saved to `keys/` folder → never commit to git
- **Env vars** stored encrypted in SSM Parameter Store → not in code
- **S3 bucket** fully private → no public URLs
- **`terraform.tfvars`** is in `.gitignore` → never commit it
- **Disk** encrypted at rest with AES-256
