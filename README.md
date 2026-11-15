# Left Behind

**Swinbuzz · Sarawak Space Challenge 2026**

Left Behind is an interactive space exhibition about the equipment NASA missions left behind on the Moon, on Mars, and in deep space. It brings together 17 exhibits, short cartoon animations, hands-on activities, and a digital photo booth. The website is designed for curious visitors and can also be shown on a large screen at an exhibition.

**[Open the live exhibition](https://azaleaa04.github.io/Abandoned-but-not-Forgotten/)**

## Explore the website

| Page | What visitors can do |
| --- | --- |
| [Home](index.html) | Spin the Moon and Mars, then select an equipment pin to open its exhibit. |
| [Exhibits](exhibits.html) | Browse 17 exhibits across the Moon, Mars, and deep space. Each exhibit has an animated timeline, a mission record, and links to sources. |
| [Equipment Lab](workshop.html) | Choose one of five activities from the dropdown. Launch Eagle’s crew cabin, adjust an astronaut’s golf swing, bounce a laser pulse off the Moon, scratch away dust to reveal Viking 1’s first surface photo, or play InSight’s marsquake recording. |
| [Photo Booth](booth.html) | Choose an exhibit to apply its design automatically. Add up to four photos, select a strip, square, or vertical format, and download the result as a PNG. You can also customize the border and add a date, mission fact, or caption. Finish all chapters of any one exhibit to unlock a Space Curator certificate. |
| [Sources & Credits](credits.html) | Find the challenge brief, mission references, and media credits. |

The sphere in the navigation switches between **Light**, **Dark Moon**, and **Red Mars**. The site remembers the selected theme and completed exhibits in the current browser. Photos stay on the visitor’s device.

## Preview and publish

1. To preview on your laptop, choose **Code → Download ZIP** on GitHub, extract the folder, and open `index.html` in a browser. Use the live HTTPS site to test the camera.
2. For team updates, preserve the folder structure when uploading files. Keep `index.html` at the top level alongside `assets/` and `stories/`.
3. GitHub Pages publishes from the root of `main`. After a change reaches `main`, check **Actions → pages build and deployment**. Once it shows a green check, refresh the live website.

| Where to edit | What’s there |
| --- | --- |
| `stories/` | Individual exhibit pages and timeline captions |
| `assets/exhibits.js` | Exhibit names, locations by world, and short facts used in the photo booth |
| `assets/photos.js` and `assets/photos/` | Exhibit image references, alt text, credits, and locally hosted images |
| `assets/cartoon.js` | Exhibit animation artwork and timing |
| `assets/activities.js` | The Viking photo reveal, lunar golf, and marsquake playback |

The site uses HTML, CSS, and JavaScript with Three.js for the interactive globes. It runs on GitHub Pages without a build step.

## Research and credits

The animated scenes illustrate documented mission history. The golf and laser activities use simplified simulations. The InSight activity uses NASA/JPL-Caltech/CNES’s sonification of recorded seismic data. Individual exhibit pages link to their mission sources, and the [credits page](credits.html) lists project and media acknowledgments. ChatGPT assisted with code, illustrations rendered in code, and story drafts.
