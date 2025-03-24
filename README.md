# The RL Hub - Reinforcement Learning Tutorial Website

A modern, interactive website for learning Reinforcement Learning concepts with a clean architecture that separates content from presentation.

## 📂 Project Structure

```
The-RL-Hub/
├── content/                    # Content files (Markdown)
│   └── tutorials/              # Tutorial Markdown files
│       ├── 1-Introduction/     # Introduction tutorial content
│       │   └── intro.md        # Introduction Markdown file
│       ├── 2-Multi-armed-Bandits/  # MAB tutorial content
│       │   └── mab.md          # Multi-armed Bandits Markdown file
│       ├── chapter03/          # Chapter 3 content
│       │   └── chapter03.md    # Chapter 3 Markdown file
│       ├── chapter04/          # Chapter 4 content
│       │   └── chapter04.md    # Chapter 4 Markdown file
│       │   ...
│       ├── chapter10/          # Chapter 10 content
│       │   └── chapter10.md    # Chapter 10 Markdown file
│       └── README.md           # Guide for content creators
│
├── js/                         # JavaScript files
│   ├── markdown-loader.js      # Original Markdown loader (deprecated)
│   └── markdown-callback-loader.js # Improved Markdown loader
│
├── Pages/                      # HTML templates and styles
│   ├── 1-Introduction/         # Introduction page
│   │   ├── intro.html          # Introduction HTML template
│   │   ├── script.js           # Page-specific JavaScript
│   │   └── styles.css          # Page-specific styles
│   ├── 2-Multi-armed-Bandits/  # MAB page
│   │   ├── mab.html            # MAB HTML template
│   │   ├── script.js           # Page-specific JavaScript
│   │   └── styles.css          # Page-specific styles
│   ├── chapter03/              # Chapter 3 page
│   │   ├── chapter03.html      # Chapter 3 HTML template
│   │   ├── script.js           # Page-specific JavaScript
│   │   └── styles.css          # Page-specific styles
│   │   ...
│   └── chapter10/              # Chapter 10 page
│       ├── chapter10.html      # Chapter 10 HTML template
│       ├── script.js           # Page-specific JavaScript
│       └── styles.css          # Page-specific styles
│
├── index.html                  # Main landing page
└── README.md                   # This file
```

## 🚀 How It Works

This website uses a content-first approach where:

1. **Content is stored as Markdown** in the `content/tutorials/` directory
2. **HTML templates** in the `Pages/` directory define the structure and styling
3. **JavaScript loaders** in the `js/` directory fetch and render Markdown content

When a user visits a tutorial page (e.g., `intro.html` or `chapter03.html`), the following happens:

1. The page loads with empty content areas
2. JavaScript loads the corresponding Markdown file
3. The content is parsed and rendered as HTML
4. A navigation sidebar is automatically generated from the headings

## 🔧 For Developers

### Adding a New Tutorial

1. Create a new directory in `content/tutorials/` (e.g., `3-New-Tutorial/` or `chapter11/`)
2. Add a Markdown file with your content (e.g., `new-tutorial.md` or `chapter11.md`)
3. Create a matching HTML template in `Pages/3-New-Tutorial/` or `Pages/chapter11/`
4. Update navigation links in existing pages and add a card in `index.html`

### JavaScript Files

- `markdown-callback-loader.js`: The main JavaScript module that loads Markdown files and renders them as HTML. It includes:
  - XMLHttpRequest-based loading (more compatible than fetch)
  - Error handling with fallbacks to different paths
  - Custom rendering for special content formats
  - Sidebar generation from headings
  - Support for MathJax and syntax highlighting

## 📝 For Content Creators

If you're adding or modifying tutorial content, please see the [Content Creator's Guide](content/tutorials/README.md) for details on Markdown formatting and special features like:

- Math equations using LaTeX
- Code blocks with syntax highlighting
- Special content boxes (Questions, Tips, Warnings)
- Image formatting and captions

## 🌐 Viewing the Website

To properly view the website locally:

1. Start a local web server in the project root directory:
   ```
   $listener = New-Object System.Net.HttpListener
   $listener.Prefixes.Add('http://localhost:8000/')
   $listener.Start()
   Write-Host "Server started at http://localhost:8000/"
   # ... (rest of the PowerShell server code)
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8000/index.html
   ```
   From there, you can access all tutorial chapters.

3. Do not try to open the Markdown files directly - they must be processed through the HTML templates.

## 💡 Technical Notes

- Markdown is parsed using [marked.js](https://marked.js.org/)
- Math equations use [MathJax](https://www.mathjax.org/)
- Code highlighting uses [highlight.js](https://highlightjs.org/)
- The website is designed to be responsive and work on all devices

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or feedback:
- Email: arshiyagharoony@gmail.com
- Telegram: [RL_Hub](https://t.me/RL_Hub)
- GitHub: [The-RL-Hub](https://github.com/The-RL-Hub) 