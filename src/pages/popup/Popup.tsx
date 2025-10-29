import { HelpCircle, Home, Mic, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import Configuration from './ConfigurationForm';
import PreferencesForm from './PreferencesForm';
import { applyTheme } from './utils';
import { useStorage } from '@/hooks/useStorage';
import Sound from './Sound';

function Popup() {
  const [menu, setMenu] = useState('home');
  const { preferences } = useStorage();

  const menuOption = [
    { name: 'home', label: 'Home', icon: Home },
    { name: 'mic', label: 'Mic & Audio Test', icon: Mic },
    { name: 'help', label: 'Help', icon: HelpCircle },
    { name: 'settings', label: 'Settings', icon: Settings },
  ];

  // Apply theme as soon as preferences.theme is available
  useEffect(() => {
    if (preferences?.theme) {
      applyTheme(preferences.theme);
    }
  }, [preferences?.theme]);

  const view = {
    home: <Configuration />,
    mic: <Sound />,
    help: <div>Help Section - Coming Soon!</div>,
    settings: <PreferencesForm />,
  };

  return (
    <div className="flex shadow-lg dark:shadow-2xl dark:shadow-black/50 min-w-[500px] max-w-[500px] max-auto min-h-[500px] h-full bg-background text-foreground font-display transition-all duration-700 ease-in-out transform hover:shadow-2xl dark:hover:shadow-black/70 relative overflow-hidden dark:border dark:border-white/10">
      <div className="relative z-10 w-full p-4 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-start space-x-2">
            <img
              alt="icon"
              className="w-8 h-auto -mb-4 transition-all duration-500 hover:scale-110 drop-shadow-lg"
              src="/icons/icon128.png"
            />
            <div>
              <h1 className="text-xl font-bold transition-all duration-500 text-logo">
                Summer
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium transition-colors duration-500">
                Learn English Effortlessly
              </p>
            </div>
          </div>
        </div>

        {view[menu as keyof typeof view]}
      </div>

      <div className="w-16 relative flex items-center justify-center">
        {/* <ToggleTheme /> */}
        <div className="min-h-[20vh] min-w-8 bg-white dark:bg-card rounded-4xl fixed right-3 shadow-lg flex flex-col items-center justify-center">
          {menuOption.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.name}
                className={`p-3 my-2 rounded-3xl cursor-pointer transition-all duration-300 flex items-center justify-center ${
                  menu === option.name
                    ? 'bg-logo text-white shadow-lg'
                    : 'text-gray-500 hover:text-logo hover:scale-110'
                }`}
                onClick={() => setMenu(option.name)}
                title={option.label}
              >
                <Icon size={20} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Popup;
