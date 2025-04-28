# The RL Hub - Reinforcement Learning Online Book

A modern, interactive website for learning Reinforcement Learning concepts with a clean architecture that separates content from presentation.

## 🚀 How It Works

This website uses a content-first approach where:

1. **Content is stored as Markdown** in the `content/tutorials/` directory
2. **HTML templates** in the `Pages/` directory define the structure and styling
3. **JavaScript loaders** in the `js/` directory fetch and render Markdown content

### Adding a New Tutorial

1. Create a new directory in `content/tutorials/` (e.g., `3-New-Tutorial/` or `chapter11/`)
2. Add a Markdown file with your content (e.g., `new-tutorial.md` or `chapter11.md`)
3. Create a matching HTML template in `Pages/3-New-Tutorial/` or `Pages/chapter11/`
4. Update navigation links in existing pages and add a card in `index.html`


### 💡 Technical Notes

- Markdown is parsed using [marked.js](https://marked.js.org/)
- Math equations use [MathJax](https://www.mathjax.org/)
- Code highlighting uses [highlight.js](https://highlightjs.org/)
- The website is designed to be responsive and work on all devices

## Contact

For questions or feedback:
- Email: arshiyagharoony@gmail.com
- Telegram: [RL_Hub](https://t.me/RL_Hub)
- GitHub: [The-RL-Hub](https://github.com/The-RL-Hub) 
