# Step C — Install Argo CD on the cluster

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# wait for it to come up
kubectl -n argocd rollout status deploy/argocd-server
```

## Access the Argo CD UI

```bash
# initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d; echo

# port-forward (or expose via LoadBalancer)
kubectl -n argocd port-forward svc/argocd-server 8080:443
# open https://localhost:8080  (user: admin)
```

## Register the app

Edit `argocd/application.yaml` — set `repoURL` to **your** repo — then:

```bash
kubectl apply -f argocd/application.yaml
```

Argo CD now watches `k8s/` on `main`. Every time the CD workflow commits a new
image tag, Argo CD auto-syncs and rolls it out (`selfHeal` + `prune` are on).
