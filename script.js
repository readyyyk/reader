// Application logic will go here
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    // Initialize the application
    initApp();
});

function initApp() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarNav = document.getElementById('sidebar-nav');
    const contentArea = document.getElementById('content-area');
    mainContentAreaElement = contentArea; // Assign to global-like variable
    const contentTitle = document.getElementById('content-title'); // For dynamic title updates
    const contentBody = document.getElementById('content-body');   // For dynamic content updates

    if (!sidebar || !sidebarToggle || !sidebarClose || !sidebarNav || !contentArea || !contentTitle || !contentBody) {
        console.error("One or more essential elements are missing from the DOM!");
        return;
    }

    // Configure marked.js options globally
    if (typeof marked !== 'undefined') {
        console.log("marked.js is loaded");
        marked.setOptions({
            gfm: true,         // Enable GitHub Flavored Markdown
            breaks: true,      // Treat GFM newlines as <br>
            pedantic: false,   // Don't be too strict (recommended)
            smartypants: false // Use regular quotes and dashes
        });
    }

    // Add scroll listener for saving position
    if (mainContentAreaElement) {
        mainContentAreaElement.addEventListener('scroll', saveScrollPosition);
    }

    // Function to toggle sidebar visibility
    const toggleSidebar = (show) => {
        if (show) {
            sidebar.classList.remove('-translate-x-full');
            sidebar.classList.add('translate-x-0');
            sidebarToggle.setAttribute('aria-expanded', 'true');
            // On mobile, sidebarToggle remains visible
        } else {
            sidebar.classList.add('-translate-x-full');
            sidebar.classList.remove('translate-x-0');
            sidebarToggle.setAttribute('aria-expanded', 'false');
            // On mobile, sidebarToggle remains visible
        }
    };

    sidebarToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from bubbling up if sidebar is an overlay
        const isExpanded = sidebarToggle.getAttribute('aria-expanded') === 'true';
        toggleSidebar(!isExpanded);
    });

    sidebarClose.addEventListener('click', () => {
        toggleSidebar(false);
    });

    // Close sidebar if clicking outside of it on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 768) { // Only on mobile
            if (!sidebar.contains(e.target) && e.target !== sidebarToggle) {
                toggleSidebar(false);
            }
        }
    });
    
    // Prevent clicks inside sidebar from closing it (if it's an overlay)
    sidebar.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Initial sidebar state based on screen size
    if (window.innerWidth >= 768) { // md breakpoint
        toggleSidebar(true); 
        sidebarToggle.classList.add('hidden'); // Still hide with JS for belt-and-suspenders on desktop
        sidebar.classList.remove('fixed', 'inset-y-0', 'left-0', '-translate-x-full', 'w-64');
        sidebar.classList.add('md:relative', 'md:translate-x-0', 'md:w-1/4');
        
        contentArea.classList.remove('w-full', 'md:ml-0'); // Explicitly remove conflicting classes
        contentArea.classList.add('md:w-3/4', 'md:ml-[25%]');
    } else {
        toggleSidebar(false); 
        sidebarToggle.classList.remove('hidden'); // Ensure it's visible on mobile init
        sidebar.classList.add('fixed', 'inset-y-0', 'left-0', '-translate-x-full', 'w-64');
        
        contentArea.classList.remove('md:w-3/4', 'md:ml-[25%]'); // Explicitly remove conflicting classes
        contentArea.classList.add('w-full', 'md:ml-0');
    }

    // Handle window resize to adjust sidebar behavior
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) { // Desktop View
            sidebarToggle.classList.add('hidden'); // Hide toggle on desktop
            sidebar.classList.remove('fixed', 'inset-y-0', 'left-0', '-translate-x-full', 'w-64');
            sidebar.classList.add('md:relative', 'md:translate-x-0', 'md:w-1/4');
            
            contentArea.classList.remove('w-full', 'md:ml-0');
            contentArea.classList.add('md:w-3/4', 'md:ml-[25%]');

            if (sidebar.classList.contains('-translate-x-full')) {
                 toggleSidebar(true); 
            } else {
                 // Ensure sidebar is visible if it was already "open" but classes might have changed
                 toggleSidebar(true); 
            }
        } else { // Mobile View
            sidebarToggle.classList.remove('hidden'); // Always ensure toggle is visible on mobile resize
            sidebar.classList.add('fixed', 'inset-y-0', 'left-0', 'w-64'); 
            sidebar.classList.remove('md:relative', 'md:translate-x-0', 'md:w-1/4');
            
            contentArea.classList.remove('md:w-3/4', 'md:ml-[25%]');
            contentArea.classList.add('w-full', 'md:ml-0');
            
            if (!sidebar.classList.contains('-translate-x-full')) {
                 toggleSidebar(false); 
            }
        }
    });

    // Load content based on URL parameter or show welcome message
    const urlParams = new URLSearchParams(window.location.search);
    const textPath = urlParams.get('text');

    if (textPath) {
        loadContentByPath(textPath, texts, contentTitle, contentBody, sidebarNav, contentArea);
    } else if (texts && texts["Welcome"]) {
        const welcomePathKey = "_internal/welcome"; // Special key for welcome page scroll
        displayContent("Welcome", texts["Welcome"], contentTitle, contentBody, welcomePathKey, contentArea);
    } else {
        contentTitle.textContent = 'Welcome!';
        contentBody.innerHTML = '<p class="mt-2 text-gray-700">Select an item from the sidebar to view its content.</p>';
    }
    
    buildSidebar(texts, sidebarNav, contentTitle, contentBody, [], sidebar, contentArea);
}

function buildSidebar(data, parentElement, contentTitleEl, contentBodyEl, currentPath, sidebarInstance, contentAreaEl) {
    const ul = document.createElement('ul');
    ul.className = 'space-y-1';

    for (const key in data) {
        if (key === "Welcome" && Object.keys(data).length > 1 && currentPath.length === 0) { 
            continue;
        }

        const li = document.createElement('li');
        const item = data[key];
        const itemPathArray = [...currentPath, key];
        const itemPathString = itemPathArray.join('/');
        const itemPathId = itemPathArray.map(p => p.replace(/\s+/g, '-')).join('-'); // Create a more ID-friendly path


        if (typeof item === 'string') {
            const button = document.createElement('button');
            button.textContent = key;
            button.className = 'w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors duration-150'; 
            button.onclick = () => {
                displayContent(key, item, contentTitleEl, contentBodyEl, itemPathString, contentAreaEl);
                window.history.pushState({path: itemPathString}, '', `?text=${encodeURIComponent(itemPathString)}`);
                if (window.innerWidth < 768) {
                    toggleSidebar(false); // Use the main toggle function
                }
            };
            li.appendChild(button);
        } else if (typeof item === 'object' && item !== null) {
            const details = document.createElement('details');
            details.className = 'group';
            details.id = `details-${itemPathId}`;
            
            const summary = document.createElement('summary');
            summary.className = 'cursor-pointer px-3 py-2 font-semibold text-sm text-gray-200 hover:bg-gray-700 rounded transition-colors duration-150 flex justify-between items-center list-none'; 
            
            const summaryText = document.createElement('span');
            summaryText.textContent = key;
            summary.appendChild(summaryText);

            const chevron = document.createElement('span');
            chevron.className = 'transform transition-transform duration-150 group-open:rotate-90 text-xs';
            chevron.innerHTML = '&#9654;'; 
            summary.appendChild(chevron);

            details.appendChild(summary);
            
            const nestedUl = buildSidebar(item, details, contentTitleEl, contentBodyEl, itemPathArray, sidebarInstance, contentAreaEl);
            nestedUl.classList.add('pl-3'); 
            details.appendChild(nestedUl);
            li.appendChild(details);
        }
        ul.appendChild(li);
    }
    parentElement.appendChild(ul);
    return ul;
}

function loadContentByPath(pathString, textsObject, titleEl, bodyEl, sidebarNavElement, contentAreaEl) {
    const keys = pathString.split('/');
    let currentItem = textsObject;
    let currentTitle = '';

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (currentItem && typeof currentItem === 'object' && key in currentItem) {
            currentItem = currentItem[key];
            if (i === keys.length - 1) { // Last key is the title for the content
                currentTitle = key;
            }
        } else {
            currentItem = null; // Path not found
            break;
        }
    }

    if (typeof currentItem === 'string') {
        displayContent(currentTitle, currentItem, titleEl, bodyEl, pathString, contentAreaEl);
        // Expand sidebar sections
        let partialPathId = '';
        for (let i = 0; i < keys.length - 1; i++) { // Iterate up to the parent of the item itself
            partialPathId += (i > 0 ? '-' : '') + keys[i].replace(/\s+/g, '-');
            const detailElement = document.getElementById(`details-${partialPathId}`);
            if (detailElement) {
                detailElement.open = true;
            }
        }
    } else {
        const welcomePathKey = "_internal/welcome";
        const welcomeText = (textsObject && textsObject["Welcome"]) || "Content not found for the given path. Please select from the sidebar.";
        const welcomeTitle = (textsObject && textsObject["Welcome"]) ? "Welcome" : "Error";
        displayContent(welcomeTitle, welcomeText, titleEl, bodyEl, welcomePathKey, contentAreaEl);
        // Clear the invalid URL parameter
        window.history.replaceState({}, '', window.location.pathname);
    }
}

function displayContent(title, markdownText, titleElement, bodyElement, fullPathKey, contentAreaEl) {
    if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
        console.error("marked.js or DOMPurify is not loaded.");
        titleElement.textContent = title;
        bodyElement.innerHTML = escapeHtml(markdownText).replace(/\n/g, '<br>');
        return;
    }
    titleElement.textContent = title;
    const rawHtml = marked.parse(markdownText);
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    bodyElement.innerHTML = cleanHtml;

    // Restore scroll position
    if (fullPathKey && contentAreaEl) {
        requestAnimationFrame(() => { // Use rAF to ensure DOM is updated
            try {
                const savedScrollPos = sessionStorage.getItem(`scrollPos-${fullPathKey}`);
                if (savedScrollPos !== null) {
                    contentAreaEl.scrollTop = parseInt(savedScrollPos, 10);
                } else {
                    contentAreaEl.scrollTop = 0; // Scroll to top if no saved position
                }
            } catch (e) {
                console.warn("Could not restore scroll position from sessionStorage:", e);
                contentAreaEl.scrollTop = 0;
            }
        });
    }
}

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Debounce utility
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Global reference for contentArea, to be set in initApp
// This is a bit of a shortcut; better state management might be preferred in larger apps
let mainContentAreaElement = null;

// Function to save scroll position
const saveScrollPosition = debounce(() => {
    if (!mainContentAreaElement) return;
    const urlParams = new URLSearchParams(window.location.search);
    const currentTextPath = urlParams.get('text');
    if (currentTextPath) {
        try {
            sessionStorage.setItem(`scrollPos-${currentTextPath}`, mainContentAreaElement.scrollTop);
        } catch (e) {
            console.warn("Could not save scroll position to sessionStorage:", e);
        }
    }
}, 250); // Debounce by 250ms

// Remove the redundant DOMContentLoaded listener for firstLevelDetails
// as initApp already covers DOM readiness and sidebar setup. 
