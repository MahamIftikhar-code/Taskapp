# Task Board

A three-tier practice application: Nginx frontend, Node.js (Express) API, MongoDB.
Built to practice Linux, Git, Docker, GitHub Actions, Kubernetes (Minikube) and Argo Workflows.

```
Browser -> Ingress -> frontend (Nginx) -> /api/* -> backend (Express) -> mongo (StatefulSet + PVC)
```

## Repository layout

| Path | Purpose |
|---|---|
| `backend/` | Express API, Dockerfile (multi-stage), unit tests |
| `frontend/` | Static board UI, Nginx config, Dockerfile |
| `k8s/` | Namespace, Secret, MongoDB, backend, frontend, Ingress |
| `argo/` | RBAC and the `deploy-taskapp` WorkflowTemplate |
| `.github/workflows/ci.yml` | Test, build and push images to Docker Hub |

## 1. Build the images locally (Minikube, containerd)

The Minikube runtime is containerd, so images built on the host must be loaded into the cluster.

```bash
for s in backend frontend; do docker build -t mahamiftikhar/taskapp-$s:dev ./$s && minikube image load mahamiftikhar/taskapp-$s:dev; done   # build each image and load it into Minikube
```

For a first local run, point the manifests at the `dev` tag:

```bash
sed -i 's#\(taskapp-[a-z]*\):latest#\1:dev#' k8s/03-backend.yaml k8s/04-frontend.yaml   # use the locally loaded images
```

## 2. Deploy to Minikube

```bash
minikube addons enable ingress && kubectl apply -f k8s/ && kubectl -n taskapp get pods -w   # ingress controller, all manifests, then watch pods
```

Open the app (pick one):

```bash
kubectl -n taskapp port-forward svc/frontend 8080:80   # then browse http://localhost:8080
```

Or map `taskapp.local` to `minikube ip` in your hosts file and browse http://taskapp.local.

## 3. GitHub Actions

Add two repository secrets: `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`.
Every push to `main` runs the tests, then builds and pushes both images tagged with the short commit SHA and `latest`.

## 4. Deploy with Argo Workflows

Install Argo Workflows in the `argo` namespace first, then:

```bash
kubectl apply -f argo/ && argo submit -n taskapp --from workflowtemplate/deploy-taskapp -p image-tag=<short-sha> --watch   # RBAC + template, then run a deploy
```

The workflow updates the backend and frontend images in parallel, waits for each rollout, then runs a smoke test against `/api/health`.
Use the commit SHA tag: re-applying `latest` does not change the Deployment, so no rollout happens.

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/live` | Liveness (process is running) |
| GET | `/api/health` | Readiness (database connected) |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create a task `{ "title": "..." }` |
| PATCH | `/api/tasks/:id` | Update `title` and/or `status` (`todo`, `doing`, `done`) |
| DELETE | `/api/tasks/:id` | Delete a task |
