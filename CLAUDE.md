# Working in this repository

## Standing instruction from the owner (2026-11-11)

Push, merge, and deploy without asking. For any change the owner requests:
push the branch, open the pull request, merge it into `main`, and confirm the
site deployed. Do not stop to ask for permission to push, merge, or deploy.

This covers ordinary pushes and merges. It does not cover force pushes, history
rewrites, or deleting branches or files the change does not call for.

## How this site ships

- `main` is the live branch. GitHub Pages serves https://resume.st-dba.com from
  it, so merging into `main` is the deploy.
- The repository's default branch can lag behind `main`. Start every change
  from `origin/main`, not from whatever a fresh clone checks out.
- Pull requests target `main` and are squash-merged.

## Before merging

Run the checks in `README.md` under "Editing the content" for the pages you
touched (phone widths, laptop-height windows, the 3D view, print), and report
anything you could not test.
