import { ExtensionProvider } from './context/ExtensionContext';
import App from './App';

interface MainProps {
  shadowRoot: ShadowRoot | null;
}

const Main = ({ shadowRoot }: MainProps) => {
  return (
    <ExtensionProvider>
      <App shadowRoot={shadowRoot} />
    </ExtensionProvider>
  );
};

export default Main;
