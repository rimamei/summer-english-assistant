import { useEffect } from 'react';
import { ContentModal } from './components/Modal';
import { injectStyles } from './styles';

interface MainProps {
  shadowRoot: ShadowRoot | null;
}

const Main = ({ shadowRoot }: MainProps) => {

  // Inject styles (keyframe) when component mounts
  useEffect(() => {
    injectStyles(shadowRoot);
  }, [shadowRoot]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Disable pointer events for the container
      }}
    >
      {/* Re-enable pointer events specifically for our modal */}
      <div style={{ pointerEvents: 'auto' }}>
        <ContentModal />
      </div>
    </div>
  );
};

export default Main;
