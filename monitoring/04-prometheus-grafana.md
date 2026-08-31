# Step D — Prometheus + Grafana (kube-prometheus-stack)

The easiest, production-shaped path is the community **kube-prometheus-stack**
Helm chart, which installs Prometheus, Grafana, Alertmanager and the exporters
in one go.

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

kubectl create namespace monitoring

helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  -f monitoring/kube-prometheus-stack-values.yaml
```

## Access Grafana

```bash
# default admin password set in the values file below (change it!)
kubectl -n monitoring port-forward svc/monitoring-grafana 3000:80
# open http://localhost:3000  (user: admin)
```

Prometheus is auto-wired as Grafana's datasource. Import a Kubernetes dashboard
(Grafana.com IDs **315** or **6417**) to see cluster + pod metrics for the
`netflix` namespace immediately.

## Access Prometheus directly (optional)

```bash
kubectl -n monitoring port-forward svc/monitoring-kube-prometheus-prometheus 9090:9090
# open http://localhost:9090
```
