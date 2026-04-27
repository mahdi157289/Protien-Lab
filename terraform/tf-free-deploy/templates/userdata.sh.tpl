#!/bin/bash
set -e
exec > /var/log/${project_name}-bootstrap.log 2>&1

echo "--- ${project_name} Bootstrap ---"
echo "Env: ${environment} | Image: ${docker_image} | Port: ${app_port}"

# [1] System update & Swap
yum update -y
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=128M count=16
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# [2] Docker
amazon-linux-extras install docker -y
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

%{ if docker_registry_auth }
echo "${docker_registry_password}" | docker login --username "${docker_registry_username}" --password-stdin "${docker_registry_server}"
%{ endif }

# [3] Nginx
amazon-linux-extras install nginx1 -y
systemctl enable nginx

# [4] Certbot
yum install -y python3 augeas-libs
pip3 install certbot certbot-nginx --quiet

# [5] CloudWatch Agent
yum install -y amazon-cloudwatch-agent
%{ if enable_cloudwatch }
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'CWCONFIG'
{
  "agent": { "metrics_collection_interval": 60, "run_as_user": "root" },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          { "file_path": "/var/log/${project_name}-bootstrap.log", "log_group_name": "${log_group}", "log_stream_name": "bootstrap" },
          { "file_path": "/var/log/nginx/access.log", "log_group_name": "${log_group}", "log_stream_name": "nginx-access" },
          { "file_path": "/var/log/nginx/error.log", "log_group_name": "${log_group}", "log_stream_name": "nginx-error" }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "${project_name}",
    "metrics_collected": {
      "cpu": { "measurement": ["cpu_usage_idle"], "metrics_collection_interval": 60 },
      "mem": { "measurement": ["mem_used_percent"], "metrics_collection_interval": 60 },
      "disk": { "measurement": ["disk_used_percent"], "resources": ["/"], "metrics_collection_interval": 60 }
    }
  }
}
CWCONFIG
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
%{ endif }

#echo "[6/8] Preparing storage and pulling containers..."
mkdir -p /home/ec2-user/uploads
chown -R ec2-user:ec2-user /home/ec2-user/uploads
chmod 775 /home/ec2-user/uploads

BACKEND_ENV_FLAGS=""
%{ for key, value in env_vars ~}
%{ if key != "BACKEND_IMAGE" ~}
BACKEND_ENV_FLAGS="$BACKEND_ENV_FLAGS -e ${key}=${value}"
%{ endif ~}
%{ endfor ~}

%{ if s3_bucket != "" ~}
BACKEND_ENV_FLAGS="$BACKEND_ENV_FLAGS -e AWS_S3_BUCKET=${s3_bucket} -e AWS_S3_REGION=${aws_region}"
%{ endif ~}

BACKEND_IMAGE="${env_vars["BACKEND_IMAGE"]}"
FRONTEND_IMAGE="${docker_image}"

docker pull $BACKEND_IMAGE &
docker pull $FRONTEND_IMAGE &
wait

docker run -d --name ${project_name}-backend --restart unless-stopped -p 5000:5000 --memory="400m" --cpu-shares=${container_cpu} $BACKEND_ENV_FLAGS -v /home/ec2-user/uploads:/app/uploads %{ if enable_cloudwatch }--log-driver=awslogs --log-opt awslogs-region=${aws_region} --log-opt awslogs-group=${log_group} --log-opt awslogs-stream=backend --log-opt awslogs-create-group=true %{ endif } $BACKEND_IMAGE
docker run -d --name ${project_name}-frontend --restart unless-stopped -p 3000:80 --memory="250m" --cpu-shares=${container_cpu} %{ if enable_cloudwatch }--log-driver=awslogs --log-opt awslogs-region=${aws_region} --log-opt awslogs-group=${log_group} --log-opt awslogs-stream=frontend --log-opt awslogs-create-group=true %{ endif } $FRONTEND_IMAGE

# [7] Nginx Configuration
rm -f /etc/nginx/conf.d/default.conf
cat > /etc/nginx/conf.d/${project_name}.conf << 'NGINXCONF'
server {
    listen 80;
    server_name ${domain_name} www.${domain_name};
    gzip on;
    gzip_types text/plain text/css text/javascript application/javascript application/json application/xml image/svg+xml;

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        expires 30d;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|css|js)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
    }

    location /health {
        proxy_pass http://localhost:3000/;
        access_log off;
    }
}
NGINXCONF
nginx -t && systemctl start nginx

# [8] SSL auto-renewal
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/local/bin/certbot renew --quiet && systemctl reload nginx") | crontab -

echo "✅ Bootstrap Complete"
