import { HelpCircle, Home, Mic, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import Configuration from './ConfigurationForm';
import PreferencesForm from './PreferencesForm';
import { applyTheme } from './utils';
import { useStorage } from '@/hooks/useStorage';
import { Separator } from '@/components/ui/separator';
import Sound from './Sound';
import { cn } from '@/lib/utils';

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
          <div className="flex space-x-2 items-center">
            <img src="/public/icons/icon48.png" alt="icon" />
            <div>
              <h1 className="text-4xl font-bold transition-all duration-500 text-black dark:text-white font-sans">
                Summer.
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-500">
                AI-Powered English Learning Assistant
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />
        <div key={menu} className="animate-fadeIn">
          {view[menu as keyof typeof view]}
        </div>
      </div>

      <div className="w-16 relative flex items-center justify-center">
        {/* <ToggleTheme /> */}
        <div className="min-h-[20vh] min-w-8 bg-white dark:bg-card rounded-4xl fixed right-3 top-1/2 -translate-y-1/2 shadow-lg flex flex-col items-center justify-center">
          {menuOption.map(option => {
            const Icon = option.icon;
            return (
              <div
                key={option.name}
                className={cn(
                  'p-3 my-2 rounded-3xl cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center',
                  menu === option.name
                    ? 'bg-accent text-white shadow-lg scale-110'
                    : 'text-gray-500 hover:text-accent hover:scale-110'
                )}
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
