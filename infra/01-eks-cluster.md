# Step A — Provision the EKS cluster

> Prereqs on your workstation: `awscli` (configured with `aws configure`),
> `eksctl`, `kubectl`, `helm`.

## 1. Create the cluster (~15–20 min)

```bash
eksctl create cluster \
  --name devsecops-eks \
  --region ap-south-1 \
  --nodegroup-name ng-standard \
  --node-type t3.large \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 3 \
  --managed
```

## 2. Point kubectl at it

```bash
aws eks update-kubeconfig --name devsecops-eks --region ap-south-1
kubectl get nodes            # should list 2 Ready nodes
```

## 3. (For the LoadBalancer Service) install the AWS Load Balancer Controller

The `netflix-clone` Service is `type: LoadBalancer`. On EKS this provisions an
ELB automatically once nodes are healthy — no extra controller needed for a
classic LB. For ALB/Ingress later, install the AWS Load Balancer Controller
per AWS docs.

## Teardown (avoid surprise bills)

```bash
eksctl delete cluster --name devsecops-eks --region ap-south-1
```
