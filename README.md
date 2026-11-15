# Left Behind

An interactive student exhibition for the Sarawak Space Challenge 2026. The static site contains 17 exhibits, an equipment lab with five activities, and a photo booth.

## Preview and publish

Open `index.html` in a modern browser to preview the pages. GitHub Pages serves the root of `main`. To check publishing, use **Settings → Pages** in this repository.

## Add exhibit photos

1. Put an image in `assets/photos/`, for example `apollo-11.jpg`.
2. Add the corresponding entry in `assets/photos.js`. The keys match the names in `stories/` without the `.html` extension.
3. Fill in the file name, descriptive alt text, and credit. The picture will appear on the exhibit page. A missing image keeps the placeholder visible.

The booth processes personal photos locally in the visitor’s browser. It supports uploads and an optional camera on a secure origin.

## Research and disclosure

Each exhibit links to mission evidence and presents a captioned cartoon timeline. The scenes are illustrative and the lunar laser lab uses simulated distances. ChatGPT assisted with the site code, artwork code, and story drafts.
