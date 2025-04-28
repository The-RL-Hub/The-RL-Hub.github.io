document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll(".content h2");
    const navLinks = document.querySelectorAll(".sidebar ul li a");
    const scrollTopButton = document.getElementById('scrollTop');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const contentSection = document.querySelector('.content');

    // Sidebar toggle for mobile/portrait mode
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('visible');
        });
        
        // Close sidebar when clicking outside of it
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('visible') && 
                !sidebar.contains(e.target) && 
                e.target !== sidebarToggle &&
                !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('visible');
            }
        });
    }

    // Function to add 'active' class to the current section's link
    function activateLink() {
        let index = sections.length;

        while (--index && window.scrollY + 50 < sections[index].offsetTop) {}

        navLinks.forEach((link) => link.classList.remove("active"));
        navLinks[index].classList.add("active");
    }

    // Scroll event listener for activating the correct link
    window.addEventListener("scroll", activateLink);
    
    // Show/hide scroll button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopButton.classList.add('visible');
        } else {
            scrollTopButton.classList.remove('visible');
        }
    });
    
    // Scroll to top when button is clicked
    scrollTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Add active state to navigation links in header
    const headerNavLinks = document.querySelectorAll('header nav a');
    const currentLocation = window.location.href;
    
    headerNavLinks.forEach(link => {
        if (link.href === currentLocation) {
            link.classList.add('active');
        }
    });

    // Initialize MathJax on content load (for dynamically loaded content)
    function initMathJax() {
        if (window.MathJax) {
            console.log('Typesetting math with MathJax');
            window.MathJax.typeset();
        } else {
            console.warn('MathJax not available for typesetting');
        }
    }

    // Setup MathJax observer to detect when content changes
    if (contentSection) {
        // Create a mutation observer to watch for content changes
        const observer = new MutationObserver(function(mutations) {
            let needsTypeset = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    needsTypeset = true;
                }
            });
            
            if (needsTypeset) {
                console.log('Content changed, typesetting math');
                // Small delay to ensure content is fully loaded
                setTimeout(initMathJax, 100);
            }
        });
        
        // Start observing content changes
        observer.observe(contentSection, { childList: true, subtree: true });
    }

    // Initialize Highlight.js for code blocks (for dynamically loaded content)
    if (window.hljs) {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
    }

    // Handle smooth scrolling for anchor links
    document.body.addEventListener('click', function(e) {
        const target = e.target.closest('a[href^="#"]');
        if (target) {
            const id = target.getAttribute('href').slice(1);
            const element = document.getElementById(id);
            
            if (element) {
                e.preventDefault();
                const headerOffset = 60; // Adjust for fixed header
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
    
    // Make sidebar links active based on scroll position
    if (contentSection) {
        // We'll add this after the markdown content is loaded and headings are added
        window.addEventListener('scroll', function() {
            // This will be populated after content loads
            const headings = contentSection.querySelectorAll('h1, h2, h3, h4');
            if (headings.length > 0) {
                let currentActive = null;
                
                headings.forEach(heading => {
                    const rect = heading.getBoundingClientRect();
                    if (rect.top <= 100) { // Adjust as needed
                        currentActive = heading.id;
                    }
                });
                
                if (currentActive) {
                    document.querySelectorAll('.sidebar a').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + currentActive) {
                            link.classList.add('active');
                        }
                    });
                }
            }
        });
    }
});

// Helper function to load markdown content
function loadMarkdownContent(contentElement, sidebarElement, markdownPaths) {
    console.log('Attempting to load Markdown content');
    
    // Try loading paths sequentially until one works
    function tryLoadPath(index) {
        if (index >= markdownPaths.length) {
            contentElement.innerHTML = `
                <div class="error">
                    <h2>Error Loading Content</h2>
                    <p>Unable to load the Markdown content. Please check the console for details.</p>
                    <p>Tried the following paths:</p>
                    <ul>${markdownPaths.map(path => `<li>${path}</li>`).join('')}</ul>
                </div>
            `;
            return;
        }
        
        const path = markdownPaths[index];
        console.log(`Trying path: ${path}`);
        
        // Use our callback loader
        MarkdownCallbackLoader.loadMarkdown(
            path, 
            contentElement, 
            sidebarElement,
            (error, markdown) => {
                if (error) {
                    console.error(`Failed to load from ${path}:`, error);
                    tryLoadPath(index + 1);
                } else {
                    console.log(`Successfully loaded from ${path}`);
                }
            }
        );
    }
    
    // Start trying paths
    tryLoadPath(0);
} 