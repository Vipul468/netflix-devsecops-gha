# Step B — Stand up SonarQube

GitHub Actions runners are ephemeral, so SonarQube must live somewhere the
runner can reach over HTTPS. Two common options:

## Option 1 — SonarQube on an EC2 instance (matches the reference project)

```bash
# On an Ubuntu EC2 instance (t3.medium, port 9000 open in the security group):
sudo apt update && sudo apt install -y docker.io
sudo systemctl enable --now docker
sudo docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
```

Then open `http://<EC2_PUBLIC_IP>:9000` (default login `admin` / `admin`, change it).

## Option 2 — SonarCloud (SaaS, no server to run)

Use <https://sonarcloud.io>, create an organization + project, and use its host
URL `https://sonarcloud.io`. The workflow action is the same.

## Generate the token the pipeline uses

In SonarQube: **My Account → Security → Generate Token**.
Save it — it becomes the GitHub secret `SONAR_TOKEN`.
The server URL becomes `SONAR_HOST_URL` (e.g. `http://<EC2_PUBLIC_IP>:9000`).

## Define the Quality Gate

**Quality Gates → create/assign** a gate to project `netflix-clone`. The
`sonarqube-quality-gate-action` step in `ci.yml` will fail the build when this
gate is red.
