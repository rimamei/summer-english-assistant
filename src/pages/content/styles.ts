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

// Function to inject keyframes
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
  style.textContent = keyframes + translationKeyframes + modaAppearKeyframes;

  targetRoot.appendChild(style);
};