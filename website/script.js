/**
 * VulnForge Elite — Companion Marketing Controller
 * Implements terminal data generation loops, GUI tab switching interactions, and subtle scroll indicators.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTerminalSimulation();
    initMockupTabs();
    initSmoothScroll();
});

/**
 * Generates autonomous simulated output logs inside the visual hero preview window.
 */
function initTerminalSimulation() {
    const feedContainer = document.getElementById('terminal-feed');
    if (!feedContainer) return;

    const MOCK_OUTPUTS = [
        { type: 'info', text: '[14:02:22] Spawning asynchronous fuzz vectors on host api.internal.cloud...' },
        { type: 'info', text: '[14:02:24] Subdomain pattern matcher detected active staging nodes.' },
        { type: 'alert', text: '[14:02:30] [ALERT] Path traversal accessible at /static/../../etc/passwd' },
        { type: 'success', text: '[14:02:32] Local state synchronization committed. 15 XP awarded to active profile.' },
        { type: 'info', text: '[14:02:35] Testing JSON Web Token signature verification matrices...' },
        { type: 'alert', text: '[14:02:40] [CRITICAL] Unauthenticated Admin account takeover vulnerability detected!' },
        { type: 'success', text: '[14:02:45] Exploitation framework payload verification passed.' }
    ];

    let currentIndex = 0;

    setInterval(() => {
        // Build new node line
        const entry = MOCK_OUTPUTS[currentIndex % MOCK_OUTPUTS.length];
        currentIndex++;

        const line = document.createElement('div');
        line.className = `log-line ${entry.type}`;
        line.textContent = entry.text;

        // Append line and enforce layout boundaries smoothly
        feedContainer.appendChild(line);

        // Keep maximum item counts steady to avoid rendering layout overloads
        if (feedContainer.children.length > 8) {
            feedContainer.removeChild(feedContainer.children[0]);
        }

        // Scroll to the end
        feedContainer.scrollTop = feedContainer.scrollHeight;
    }, 3500);
}

/**
 * Manages tab switching state inside the interactive desktop preview mockup.
 */
function initMockupTabs() {
    const tabs = document.querySelectorAll('.mockup-tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Quick visual response simulation
            const fill = document.querySelector('.progress-fill');
            if (fill) {
                fill.style.width = `${Math.floor(Math.random() * 60) + 40}%`;
            }
        });
    });
}

/**
 * Configures anchor targets to trigger smooth custom navigations.
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}
