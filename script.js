// Debounce function to limit how often a function can be called
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded successfully.");
    
    // Scroll to top functionality
    const scrollTopButton = document.getElementById('scrollTop');
    const header = document.querySelector('header');
    
    // Debounced scroll handler
    const handleScroll = debounce(() => {
        // Toggle visibility of back-to-top button
        if (window.scrollY > 300) {
            scrollTopButton.classList.add('visible');
        } else {
            scrollTopButton.classList.remove('visible');
        }

        // Toggle compact header styling
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, 100);
    
    // Show/hide scroll button based on scroll position
    window.addEventListener('scroll', handleScroll);
    
    // Scroll to top when button is clicked
    scrollTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Add active state to navigation links
    const navLinks = document.querySelectorAll('.nav-left a');
    const currentLocation = window.location.href;
    
    navLinks.forEach(link => {
        if (link.href === currentLocation) {
            link.classList.add('active');
        }
    });
});
