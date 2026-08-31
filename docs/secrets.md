# GitHub Actions Secrets

Add these under **Repo → Settings → Secrets and variables → Actions → New repository secret**.
These replace what would have been "Jenkins Credentials" in the original diagram.

| Secret name          | What it is                                   | Where it comes from                              |
|----------------------|----------------------------------------------|--------------------------------------------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username                      | hub.docker.com                                   |
| `DOCKERHUB_TOKEN`    | Docker Hub access token (not your password)   | Docker Hub → Account → Security → New Access Token|
| `SONAR_TOKEN`        | SonarQube/SonarCloud analysis token           | Sonar → My Account → Security → Generate Token   |
| `SONAR_HOST_URL`     | Sonar server URL (e.g. `http://IP:9000`)      | your SonarQube server / `https://sonarcloud.io`  |
| `TMDB_V3_API_KEY`    | TMDB v3 API key for the Netflix clone build   | themoviedb.org → Settings → API                  |
| `NVD_API_KEY`        | (Optional) speeds up OWASP Dependency-Check   | nvd.nist.gov/developers/request-an-api-key       |

## Notes
- `GITHUB_TOKEN` is provided automatically — the CD workflow uses it (via
  `permissions: contents: write`) to commit the image-tag bump. No secret needed.
- Never commit any of these values into the repo. Trivy/OWASP will not catch a
  leaked secret in Git history — enable **GitHub Secret Scanning** on the repo too.
- The Kubernetes deploy is handled by **Argo CD pulling from Git**, so the runner
  never needs a `kubeconfig` secret. That's the security win of GitOps.
