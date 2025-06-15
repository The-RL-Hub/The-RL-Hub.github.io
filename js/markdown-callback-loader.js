/**
 * MarkdownCallbackLoader.js
 * A modern, callback-based Markdown loader and renderer for The RL Hub
 * 
 * This module handles:
 * - Loading Markdown content via XHR (more compatible than fetch)
 * - Parsing Markdown to HTML using marked.js
 * - Rendering special content boxes (questions, tips, warnings)
 * - Generating a sidebar navigation from content headings
 * - Managing content caching
 * - Properly formatting math equations (block and inline)
 */

const MarkdownCallbackLoader = (function() {
    // Private variables
    const VERSION = '1.1.0';
    let contentCache = {};
    let markedInitialized = false;
    
    /**
     * Initialize marked.js with custom renderers and options
     */
    function initMarked() {
        if (!window.marked) {
            console.error('Marked.js library not loaded');
            return false;
        }
        
        if (markedInitialized) {
            return true;
        }
        
        console.log(`Initializing MarkdownCallbackLoader v${VERSION}`);
        
        // Configure marked options
        marked.setOptions({
            gfm: true,              // GitHub Flavored Markdown
            breaks: true,           // Convert line breaks to <br>
            pedantic: false,
            sanitize: false,        // Allow HTML in source
            smartLists: true,
            smartypants: true,      // Pretty quotes, ellipses, etc.
            langPrefix: 'language-',
            highlight: function(code, lang) {
                // Use highlight.js for code syntax highlighting if available
                if (window.hljs && lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(lang, code).value;
                    } catch (e) {
                        console.error('Error highlighting code:', e);
                    }
                }
                return code;
            }
        });
        
        // Set up custom renderers
        const renderer = configureCustomRenderers();
        
        // Use our custom renderer
        marked.use({ renderer });
        
        markedInitialized = true;
        return true;
    }
    
    /**
     * Configure custom renderers for marked.js
     */
    function configureCustomRenderers() {
        const renderer = new marked.Renderer();
        
        // Custom image renderer to add the image-container class
        const originalImageRenderer = renderer.image;
        renderer.image = function(href, title, text) {
            const img = originalImageRenderer.call(this, href, title, text);
            // Return just the image without adding a caption - captions are handled in the Markdown directly
            return `<div class="image-container">${img}</div>`;
        };
        
        // Custom blockquote renderer to support special boxes
        const originalBlockquoteRenderer = renderer.blockquote;
        renderer.blockquote = function(quote) {
            // Ensure quote is a string and handle safely
            if (typeof quote !== 'string') {
                console.warn('Blockquote received non-string input:', quote);
                return originalBlockquoteRenderer.call(this, quote);
            }
            
            try {
                // Process the quote content
                // Check for special box types using indexOf instead of startsWith
                if (quote.indexOf('<strong>سؤال') !== -1 || 
                    quote.indexOf('<strong>یه سؤال') !== -1 || 
                    quote.indexOf('<strong>فکر کن') !== -1 || 
                    quote.indexOf('<strong>تفکر کنید') !== -1) {
                    return `<div class="box box-question">${quote}</div>`;
                } 
                else if (quote.indexOf('<strong>نکته') !== -1 || 
                         quote.indexOf('<strong>توجه') !== -1 || 
                         quote.indexOf('<strong>شهود') !== -1 || 
                         quote.indexOf('<strong>کاوش بیشتر') !== -1) {
                    return `<div class="box box-tip">${quote}</div>`;
                }
                else if (quote.indexOf('<strong>هشدار') !== -1 || 
                         quote.indexOf('<strong>خطر') !== -1) {
                    return `<div class="box box-warning">${quote}</div>`;
                }
                else {
                    // Default blockquote
                    return originalBlockquoteRenderer.call(this, quote);
                }
            } catch (error) {
                console.error('Error in blockquote renderer:', error);
                return originalBlockquoteRenderer.call(this, quote);
            }
        };
        
        // Custom paragraph renderer to prevent $ and $$ from being processed incorrectly
        const originalParagraphRenderer = renderer.paragraph;
        renderer.paragraph = function(text) {
            return originalParagraphRenderer.call(this, text);
        };
        
        return renderer;
    }
    
    /**
     * Pre-process the markdown content before parsing
     * This handles math expressions that shouldn't be processed by marked
     */
    function preprocessMarkdown(markdown) {
        // Create temporary placeholders for math expressions
        let blockMathPlaceholders = [];
        let inlineMathPlaceholders = [];
        
        // Replace block math expressions ($$...$$) with placeholders
        markdown = markdown.replace(/\$\$([\s\S]*?)\$\$/g, function(match, content) {
            const placeholder = `BLOCK_MATH_PLACEHOLDER_${blockMathPlaceholders.length}`;
            blockMathPlaceholders.push(content);
            return placeholder;
        });
        
        // Replace inline math expressions ($...$) with placeholders
        // This regex avoids matching currency symbols by checking for space after the first $
        markdown = markdown.replace(/\$([^\$\n]+?)\$/g, function(match, content) {
            // Skip if it looks like a currency amount (e.g., $50)
            if (/^\s*\d+([,.]\d+)?\s*$/.test(content)) {
                return match;
            }
            const placeholder = `INLINE_MATH_PLACEHOLDER_${inlineMathPlaceholders.length}`;
            inlineMathPlaceholders.push(content);
            return placeholder;
        });
        
        return {
            processedMarkdown: markdown,
            blockMathPlaceholders,
            inlineMathPlaceholders
        };
    }
    
    /**
     * Post-process the HTML content after parsing
     * This replaces math placeholders with proper math tags
     */
    function postprocessHTML(html, blockMathPlaceholders, inlineMathPlaceholders) {
        // Replace block math placeholders with actual math
        blockMathPlaceholders.forEach((content, index) => {
            const placeholder = `BLOCK_MATH_PLACEHOLDER_${index}`;
            html = html.replace(placeholder, `<div class="math-block">$$${content}$$</div>`);
        });
        
        // Replace inline math placeholders with actual math
        inlineMathPlaceholders.forEach((content, index) => {
            const placeholder = `INLINE_MATH_PLACEHOLDER_${index}`;
            html = html.replace(placeholder, `\\(${content}\\)`);
        });
        
        return html;
    }
    
    /**
     * Generate an ID from a heading text for use in navigation
     */
    function generateIdFromHeading(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\u0600-\u06FF\s]/g, '') // Keep Persian characters
            .replace(/\s+/g, '-');
    }
    
    /**
     * Show loading indicator in the content element
     */
    function showLoading(contentElement) {
        if (contentElement) {
            contentElement.innerHTML = '<div class="loading">در حال بارگذاری محتوا...</div>';
        }
    }
    
    /**
     * Show error message in the content element
     */
    function showError(contentElement, message) {
        if (contentElement) {
            contentElement.innerHTML = `
                <div class="error">
                    <h3>خطا در بارگذاری محتوا</h3>
                    <p>${message}</p>
                </div>`;
        }
    }
    
    /**
     * Load a markdown file with XMLHttpRequest
     * More compatible than fetch API across browsers
     */
    function loadMarkdownWithXHR(markdownPath, contentElement, sidebarElement, callback) {
        console.log(`Loading markdown from: ${markdownPath}`);
        showLoading(contentElement);
        
        // Check if we have this content cached
        if (contentCache[markdownPath]) {
            console.log('Using cached content');
            renderContent(contentCache[markdownPath], contentElement);
            if (sidebarElement) {
                generateSidebar(contentCache[markdownPath], sidebarElement);
            }
            if (callback) callback(null, contentCache[markdownPath]);
            return;
        }
        
        // Try to load the markdown file
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const markdown = xhr.responseText;
                    console.log(`Content loaded successfully, length: ${markdown.length} characters`);
                    
                    // Cache the content
                    contentCache[markdownPath] = markdown;
                    
                    // Render the content
                    renderContent(markdown, contentElement);
                    
                    // Generate sidebar if element provided
                    if (sidebarElement) {
                        generateSidebar(markdown, sidebarElement);
                    }
                    
                    // Call the callback if provided
                    if (callback) callback(null, markdown);
                } else {
                    const errorMsg = `Failed to load Markdown file: ${xhr.status} ${xhr.statusText}`;
                    console.error(errorMsg);
                    showError(contentElement, errorMsg);
                    if (callback) callback(new Error(errorMsg), null);
                }
            }
        };
        
        xhr.open('GET', markdownPath, true);
        xhr.send();
    }
    
    /**
     * Render the markdown content as HTML
     */
    function renderContent(markdown, contentElement) {
        if (!contentElement) {
            console.error('Content element not provided');
            return;
        }
        
        if (!initMarked()) {
            showError(contentElement, 'Marked.js library not loaded');
            return;
        }
        
        try {
            // Pre-process markdown to handle math expressions
            const {
                processedMarkdown,
                blockMathPlaceholders,
                inlineMathPlaceholders
            } = preprocessMarkdown(markdown);
            
            // Convert processed Markdown to HTML
            let html = marked.parse(processedMarkdown);
            
            // Post-process to replace math placeholders
            html = postprocessHTML(html, blockMathPlaceholders, inlineMathPlaceholders);
            
            // Insert the HTML into the content area
            contentElement.innerHTML = html;
            
            // Apply post-processing
            applyPostProcessing(contentElement);
            
        } catch (error) {
            showError(contentElement, 'Error rendering Markdown: ' + error.message);
            console.error('Error rendering Markdown:', error);
        }
    }
    
    /**
     * Apply post-processing to the rendered content
     */
    function applyPostProcessing(contentElement) {
        // Apply syntax highlighting to code blocks
        if (window.hljs) {
            contentElement.querySelectorAll('pre code').forEach(block => {
                hljs.highlightBlock(block);
            });
        }
        
        // Ensure math is always typeset once content is ready. We rely on
        // MathJax.typesetPromise (non-blocking, returns a promise). If MathJax
        // hasn't finished loading yet, wait for the custom 'mathjax-ready'
        // event emitted in mathjax-config.js.

        const typeset = () => {
            if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
                MathJax.typesetPromise([contentElement]).catch(err => console.error('MathJax typeset error:', err));
            }
        };

        if (window.MathJax && window.MathJax.startup && window.MathJax.startup.typesetPromise) {
            // MathJax already initialised
            typeset();
        } else {
            // Wait until MathJax signals it is ready
            document.addEventListener('mathjax-ready', typeset, { once: true });
        }
        
        // Add IDs to headings for navigation (if they don't already have one)
        contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
            if (!heading.id) {
                heading.id = generateIdFromHeading(heading.textContent);
            }
        });
        
        // Handle images - ensure they have loading="lazy"
        contentElement.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    }
    
    /**
     * Generate sidebar from markdown content
     */
    function generateSidebar(markdown, sidebarElement) {
        if (!sidebarElement) {
            console.error('Sidebar element not provided');
            return;
        }
        
        const headingRegex = /^(#{1,4})\s+(.+?)(?:\n|\r|$)/gm;
        const headings = [];
        let match;
        
        while ((match = headingRegex.exec(markdown)) !== null) {
            const level = match[1].length; // Number of # characters
            const text = match[2].trim();
            const id = generateIdFromHeading(text);
            
            headings.push({ level, text, id });
        }
        
        if (headings.length === 0) {
            sidebarElement.innerHTML = '<div>فهرست محتوا موجود نیست</div>';
            return;
        }
        
        // Create the sidebar list
        const ul = document.createElement('ul');
        
        headings.forEach(heading => {
            if (heading.level <= 3) { // Only include h1, h2, h3
                const li = document.createElement('li');
                li.classList.add(`level-${heading.level}`);
                
                const a = document.createElement('a');
                a.href = `#${heading.id}`;
                a.textContent = heading.text;
                
                li.appendChild(a);
                ul.appendChild(li);
            }
        });
        
        sidebarElement.innerHTML = '';
        sidebarElement.appendChild(ul);
        
        // Add click handlers for navigation
        sidebarElement.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) {
                // Smooth scroll to the target
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    
                    // Update URL without refreshing page
                    history.pushState(null, null, `#${targetId}`);
                }
            });
        });
    }
    
    /**
     * Clear the content cache
     */
    function clearCache() {
        contentCache = {};
        console.log('Content cache cleared');
    }
    
    // Public API
    return {
        version: VERSION,
        loadMarkdown: function(markdownPath, contentElement, sidebarElement, callback) {
            loadMarkdownWithXHR(markdownPath, contentElement, sidebarElement, callback);
        },
        renderContent: function(markdown, contentElement) {
            renderContent(markdown, contentElement);
        },
        generateSidebar: function(markdown, sidebarElement) {
            generateSidebar(markdown, sidebarElement);
        },
        clearCache: clearCache
    };
})();

// Auto-initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, Markdown Callback Loader ready');
}); 
