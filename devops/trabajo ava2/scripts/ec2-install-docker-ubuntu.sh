
#GRUPOS DE SEGURIDAD 


set -euo pipefail

sudo apt update && sudo apt upgrade -y

sudo apt install -y docker.io docker-compose

sudo usermod -aG docker "${USER}"

sudo systemctl enable docker
sudo systemctl start docker

docker --version
echo "Listo. Reinicia la sesión SSH o ejecuta: newgrp docker"
