# Content Creator's Guide for The RL Hub

This guide explains how to create and edit tutorial content for The RL Hub website.

## 📂 Directory Structure

```
content/tutorials/
├── 1-Introduction/            # First tutorial
│   └── intro.md               # Markdown content for the Introduction
├── 2-Multi-armed-Bandits/     # Second tutorial
│   └── mab.md                 # Markdown content for Multi-armed Bandits
└── README.md                  # This file
```

## 🔍 How the System Works

1. **Content Storage**: All tutorial content is written in Markdown (`.md` files)
2. **HTML Integration**: Each Markdown file corresponds to an HTML file in the `/Pages/` directory 
3. **Rendering**: When a user visits a tutorial page, JavaScript loads and renders the Markdown content

## ✍️ Creating or Editing a Tutorial

### Creating a New Tutorial

1. Create a new numbered directory in `content/tutorials/` (e.g., `3-Dynamic-Programming/`)
2. Create a Markdown file for your content (e.g., `dp.md`)
3. Add your content in Markdown format, following the guidelines below
4. Work with a developer to create the matching HTML template

### Editing an Existing Tutorial

1. Find the appropriate Markdown file in `content/tutorials/`
2. Edit the content as needed
3. The changes will be reflected on the website when the page is reloaded

## 📝 Markdown Formatting Guidelines

### Basic Formatting

```markdown
# Main Heading (H1) - Use for tutorial title

## Section Heading (H2) - Use for main sections

### Subsection Heading (H3) - Use for subsections

Normal paragraph text with **bold text** and *italic text*.

[Link text](https://example.com)

- Bullet point 1
- Bullet point 2
  - Nested bullet point
```

### Images

Images should be placed in the corresponding `Pages/X-Tutorial-Name/Pictures/` directory.

```markdown
![Image caption text](Pictures/image-name.png)
```

### Math Equations

Use LaTeX syntax for math equations:

```markdown
Inline equation: $v_\pi(s) = \mathbb{E}_\pi[G_t | S_t = s]$

Block equation:
$$
v_\pi(s) = \mathbb{E}_\pi[G_t | S_t = s] = \mathbb{E}_\pi\left[\sum_{k=0}^{\infty} \gamma^k R_{t+k+1} \Big| S_t = s \right]
$$
```

### Code Blocks

```markdown
```python
def example_function():
    return "This is a code example with syntax highlighting"
```
```

### Special Content Boxes

#### Question Box

```markdown
> **سؤال**: Your question text here?
```

#### Tip Box

```markdown
> **توجه**: Your tip or important note here.
```

#### Warning Box

```markdown
> **هشدار**: Your warning message here.
```

## 📊 Best Practices

1. **Structure**: Use a clear, hierarchical heading structure
2. **Progressive Learning**: Present concepts in an order that builds on previous knowledge
3. **Examples**: Include practical examples to illustrate concepts
4. **Questions**: Add thought-provoking questions to engage readers
5. **Visuals**: Use diagrams and images to explain complex concepts
6. **Consistency**: Maintain consistent terminology throughout
7. **References**: Cite sources where appropriate

## 🔍 See Also

For technical details on how the Markdown rendering system works, see the main [README.md](../../README.md) in the project root.

## 📢 Need Help?

If you encounter any issues or have questions about content creation, please contact the development team. 