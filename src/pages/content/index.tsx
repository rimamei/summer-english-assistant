import React from 'react';
import ReactDOM from 'react-dom/client';
import Main from './main';

// Create container for injecting script into an existing page
const createAppContainer = () => {
  // Remove any existing container first
  const existingContainer = document.getElementById('summer-extension-root');
  if (existingContainer) {
    existingContainer.remove();
  }

  const container = document.createElement('div');
  container.id = 'summer-extension-root';
  
  // Make sure it doesn't interfere with the page
  container.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    pointer-events: none !important;
    z-index: 2147483647 !important;
    font-family: system-ui, -apple-system, sans-serif !important;
  `;
  
  document.body.appendChild(container);
  return container;
};

// Initialize the React app
const initializeApp = () => {
  if (!document.body) {
    // Wait for body to be available
    setTimeout(initializeApp, 10);
    return;
  }

  try {
    // host element, which lives on the main page
    const hostContainer = createAppContainer();

    // Create the Shadow DOM
    const shadowRoot = hostContainer.attachShadow({ mode: 'open' });

    // a new element *inside* the shadow DOM for React to attach to
    const reactRootContainer = document.createElement('div');
    reactRootContainer.id = 'summer-extension-react-root';
    shadowRoot.appendChild(reactRootContainer);

    // Create the React root on the element *inside* the shadow DOM
    const root = ReactDOM.createRoot(reactRootContainer);
    
    root.render(
      <React.StrictMode>
        <Main shadowRoot={shadowRoot} />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Summer Extension: Failed to initialize', error);
  }
};

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
