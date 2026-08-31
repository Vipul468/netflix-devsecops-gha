# DevSecOps — Netflix Clone on GitHub Actions (EKS)

A full DevSecOps CI/CD pipeline built with **GitHub Actions instead of Jenkins**,
following the reference architecture:

**Pipeline 1 — Build & Secure** (`.github/workflows/ci.yml`)
`Git Push → Checkout → SonarQube (quality gate) → OWASP Dependency-Check → Trivy FS scan → Docker Build → Trivy Image scan → Docker Hub`

**Pipeline 2 — Deploy & Monitor** (GitOps)
`Update manifests → GitHub (config) → Argo CD sync → Kubernetes (EKS) → Prometheus → Grafana`

The only structural change from the Jenkins diagram: **GitHub Actions runners**
run every stage, and **Jenkins credentials → GitHub Actions Secrets**. Kubernetes
deployment is done the GitOps way — the pipeline commits a new image tag and
**Argo CD** reconciles the cluster, so no cluster credentials ever touch the runner.

```
devsecops-netflix-gha/
├── .github/workflows/
│   ├── ci.yml          # Pipeline 1: build + all security gates + push
│   └── cd.yml          # Pipeline 2 (GitHub half): GitOps image-tag bump
├── Dockerfile          # multi-stage React build → nginx runtime
├── .dockerignore
├── app/README.md       # how to drop the Netflix-clone source in
├── k8s/                # GitOps source of truth (Argo CD watches this)
│   ├── namespace.yaml
│   ├── deployment.yaml # image line auto-updated by cd.yml
│   └── service.yaml
├── argocd/application.yaml
├── monitoring/         # kube-prometheus-stack (Prometheus + Grafana)
├── infra/              # EKS, SonarQube, Argo CD setup guides
└── docs/secrets.md     # the GitHub Actions secrets to configure
```

---

## Step-by-step

### 0. Fork/create the repo
Push this project to a new GitHub repo (e.g. `devsecops-netflix-gha`). Then copy
the **Netflix-clone React source** into the repo root — see `app/README.md`.

### 1. Provision infrastructure
- **EKS cluster** → `infra/01-eks-cluster.md`
- **SonarQube** (EC2 or SonarCloud) → `infra/02-sonarqube.md`
- **Argo CD** on the cluster → `infra/03-argocd.md`
- **Prometheus + Grafana** → `monitoring/04-prometheus-grafana.md`

### 2. Configure secrets
Add every secret in `docs/secrets.md` to the repo.

### 3. Wire GitOps
- Edit `argocd/application.yaml` → set `repoURL` to your repo, then
  `kubectl apply -f argocd/application.yaml`.
- Edit `k8s/deployment.yaml` → set the image to `YOUR_DOCKERHUB_USERNAME/netflix-clone:latest`
  (the CD workflow keeps the tag current after that).

### 4. Run the pipeline
Push a commit to `main`. Watch **Actions**:
1. `CI - Build & Secure` runs. Any red Sonar gate, HIGH/CRITICAL OWASP CVE, or
   HIGH/CRITICAL Trivy finding **fails the run and no image is pushed**.
2. On success it pushes the image to Docker Hub and calls
   `CD - Update Manifests`, which commits the new tag into `k8s/deployment.yaml`.
3. **Argo CD** notices the commit and syncs the new image onto EKS.
4. **Prometheus** scrapes it; view dashboards in **Grafana**.

### 5. See the app
```bash
kubectl -n netflix get svc netflix-clone   # grab the EXTERNAL-IP (ELB)
```
Open that address in a browser.

---

## The security gates (what fails a build)
| Stage | Tool | Fail condition |
|-------|------|----------------|
| Code quality | SonarQube Quality Gate | gate is red (coverage, bugs, smells) |
| Dependencies (SCA) | OWASP Dependency-Check | any dependency CVSS ≥ 7 |
| Source scan | Trivy `fs` | HIGH/CRITICAL vuln in repo |
| Image scan | Trivy `image` | HIGH/CRITICAL vuln in built image |

Loosen these while getting started by raising `--failOnCVSS`, or setting Trivy
`exit-code: '0'` (report-only) — then tighten as you fix findings.

## Cost note
EKS + an ELB + a SonarQube EC2 box cost real money. Tear down with
`eksctl delete cluster --name devsecops-eks --region ap-south-1` when done.
