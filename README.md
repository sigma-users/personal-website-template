# Academic Website Template

## Optional: automatic researchmap updates

Keep your publication lists up to date without editing CSV files. Disabled by default; monthly updates and manual runs are available. Start with the [step-by-step guide](wiki/researchmap-sync.md).


A responsive academic website template using React, TypeScript, and Tailwind CSS.

## 日本語のREADME

日本語の詳細については、[README_ja.md](README_ja.md)を参照してください。


## Features

- Multi-language (English, Japanese)
- Responsive design
- Dynamic publications filtering
- Markdown support
- Customizable theming
- GitHub Pages deployment

## Getting Started

See [wiki/procedure_for_user.md](wiki/procedure_for_user.md) for details.

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone:
   ```bash
   git clone https://github.com/yourusername/academic-website.git
   cd academic-website
   ```

2. Install:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open `http://localhost:3000`.

## Project Structure

- `/data` - CSV files
- `/public` - Static content
- `/scripts` - Scripts
- `/src` - Source code

## Customization

### Content

1. Update `/public/locales/en/translations.json` and `/public/locales/ja/translations.json`
2. Replace bio in `/public/content/bio/`
3. Add profile picture to `/public/images/profile.jpg`
4. Update publications in `/data/rm_published_papers.csv` and `/data/rm_presentations.csv`
5. Add data in `/public/content/awards/`
6. Update career in `/public/content/career/`

### Styling

1. Customize in `tailwind.config.js`
2. Modify `src/index.css`

## Deployment

Deploy to GitHub Pages with GitHub Actions.

1. Go to "Actions" in your repository.
2. Select "Deploy to GitHub Pages".
3. Verify URL in "Settings" → "Pages".

## License

MIT licensed.

## Acknowledgements

- [Tailwind CSS](https://tailwindcss.com/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [i18next](https://www.i18next.com/)
