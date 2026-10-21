CLIPFORGE WEBSITE - SETUP (5 minutes)

1) VIDEO PREVIEW
   Put your video here:  assets/preview.mp4   (vertical 9:16, 10-20 s, under ~8 MB, H.264, no sound needed)
   Optional poster image: assets/preview-poster.jpg
   Until the video exists, the phone shows an animated placeholder.

2) DOWNLOAD BUTTONS (nothing to upload to the website)
   Buttons point to your latest GitHub release automatically:
   https://github.com/tahaonerwp2010/ClipForge/releases/latest/download/<file name>
   Your CI already names the files correctly:
     ClipForge-Setup-windows-x64.exe, ClipForge-windows-x64.exe (portable),
     ClipForge-mac-arm64.dmg, ClipForge-mac-x64.dmg,
     ClipForge-linux-x64.AppImage, ClipForge-android-arm64.apk
   If you rename the repo or files, edit the REPO / FILES lines at the top of app.js.
   The repo must be PUBLIC and the release must be published (not a draft).

3) LIVE COUNTER
   It sums the GitHub download counts of those files and refreshes every 90 s;
   every click also adds +1 instantly. Starting/fallback number: data-fallback in index.html.

4) INSTAGRAM
   Footer button links to https://www.instagram.com/taha.ai  (change in index.html if your handle differs).

5) PUBLISH (free)
   GitHub Pages: new repo (e.g. clipforge-site) -> upload these files -> Settings > Pages > Deploy from branch (main, /root).
   Or drag the folder onto Netlify / Cloudflare Pages.
