/**
 * Common MathJax configuration for all tutorial pages
 */
window.MathJax = {
    tex: {
        inlineMath: [['\\(', '\\)'], ['$', '$']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
        tags: 'ams'
    },
    options: {
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process',
        renderActions: {
            addMenu: []
        }
    },
    svg: {
        fontCache: 'global'
    },
    chtml: {
        displayAlign: 'center',
        displayIndent: '0'
    },
    startup: {
        ready: function() {
            console.log("MathJax is loaded and configured");
            MathJax.startup.defaultReady();
        }
    }
}; 