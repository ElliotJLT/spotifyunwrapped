# 🎧 spotifyunwrapped

Your Spotify data, visualised properly. Privacy-first listening analytics that run entirely in your browser.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## What

Spotify Wrapped gives you a 60-second slideshow once a year. This gives you the full picture — any time, with your complete listening history. Upload your Spotify data export and get deep analytics: forgotten favourites, obsession phases, late-night music taste, session patterns, and more. All processing happens client-side. Your data never leaves your device.

## Quick Start

```bash
git clone https://github.com/ElliotJLT/spotifyunwrapped.git
cd spotifyunwrapped
npm install
npm run dev
```

Then request your data from [Spotify Privacy Settings](https://www.spotify.com/account/privacy/) (select "Extended streaming history"). Upload the JSON files when they arrive.

## Features

- 📈 **Listening Timeline** — daily activity over your entire history
- 🎵 **Music Eras** — how your top artists evolved year by year
- 💔 **Forgotten Favourites** — artists you loved but haven't played in 12+ months
- 🔥 **Obsession Phases** — weeks where one artist dominated 30%+ of your plays
- 🌙 **Late Night Confessions** — what you listen to at 2am vs 2pm
- ⏭️ **Session Insights** — duration, frequency, skip rates, shuffle vs intentional
- 📥 **Export** — download your dashboard as PDF or PNG

## Tech

React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts.

## License

MIT
