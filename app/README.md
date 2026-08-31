# App source

This repo is a **DevSecOps CI/CD template**. The application it builds is the well-known
**Netflix clone** React app used across DevSecOps demos.

## Get the app code into this repo

Copy the Netflix-clone source into the **root** of this repo (next to the `Dockerfile`),
i.e. `package.json`, `src/`, `public/`, etc. should sit at the repo root. A common source:

```bash
git clone https://github.com/N4si/DevSecOps-Project.git tmp-app
# copy its React app files (package.json, src, public, ...) to this repo root
cp -r tmp-app/{package.json,package-lock.json,src,public} .
rm -rf tmp-app
```

> The exact upstream repo may change over time. Any React app that builds with
> `npm run build` into a `build/` folder works with the provided `Dockerfile` —
> only the `TMDB_V3_API_KEY` build-arg is specific to the Netflix clone.

## TMDB API key

The Netflix clone pulls movie data from TMDB. Create a free account at
<https://www.themoviedb.org/>, generate a **v3 API key**, and store it as the
GitHub Actions secret `TMDB_V3_API_KEY` (see `docs/secrets.md`).
