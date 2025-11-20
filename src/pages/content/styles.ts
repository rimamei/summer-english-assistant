// CSS keyframes for animations (to be injected)
export const keyframes = `
  @keyframes summer-slide-in {
    from {
      opacity: 0;
      transform: translateX(100%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }
`;

export const translationKeyframes = `
  @keyframes summer-translation-appear {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const modaAppearKeyframes = `
  @keyframes summer-modal-appear {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const loadingDotsKeyframes = `
    @keyframes loadingDots {
      0%, 80%, 100% {
        opacity: 0;
      }
      40% {
        opacity: 1;
      }
    }

    .loading-dots {
      font-size: 16px;
    }

    .loading-dots span {
      display: inline-block;
      animation: loadingDots 1.4s infinite;
    }

    .loading-dots span:nth-child(1) {
      animation-delay: 0s;
    }

    .loading-dots span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .loading-dots span:nth-child(3) {
      animation-delay: 0.4s;
    }
  `;

const pulseBorderKeyframes = `
    @keyframes pulse-border {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.005);
      }
    }
  `;

const spinKeyframes = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  `;

// Google Fonts CSS import
const googleFontsCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
`;

// Base font styles using the imported font
const baseFontStyles = `
  * {
    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
  }
`;

const resultModalStyles = `
  .result-sanitized ul {
     margin: 0 !important;
     padding-left: 0 !important;
  }

  .result-sanitized li {
    margin: 0.2em 0 !important;
    padding: 0 !important;
    line-height: 1.3 !important;
  }
`;

// Function to inject Google Fonts preconnect links
export const injectFontPreconnects = () => {
  // Check if preconnects already exist
  if (document.querySelector('link[href="https://fonts.googleapis.com"]')) {
    return;
  }

  // Create preconnect links
  const preconnect1 = document.createElement('link');
  preconnect1.rel = 'preconnect';
  preconnect1.href = 'https://fonts.googleapis.com';

  const preconnect2 = document.createElement('link');
  preconnect2.rel = 'preconnect';
  preconnect2.href = 'https://fonts.gstatic.com';
  preconnect2.crossOrigin = 'anonymous';

  // Inject into document head for better performance
  document.head.appendChild(preconnect1);
  document.head.appendChild(preconnect2);
};

// Function to inject keyframes and fonts
export const injectStyles = (targetRoot: ShadowRoot | null) => {
  if (!targetRoot) return;

  const styleId = 'summer-extension-styles';

  // Remove existing styles
  const existingStyle = targetRoot.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create and inject new styles
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent =
    googleFontsCSS +
    baseFontStyles +
    keyframes +
    translationKeyframes +
    modaAppearKeyframes +
    loadingDotsKeyframes +
    pulseBorderKeyframes +
    spinKeyframes +
    resultModalStyles;

  targetRoot.appendChild(style);
};
