// import ToggleTheme from '@/components/base/ToggleTheme';
import ToggleTheme from '@/components/base/ToggleTheme';
import SettingForm from './SettingForm';
import { HelpCircle, Mic, Settings2 } from 'lucide-react';
import { useState } from 'react';

function Popup() {
  const [menu, setMenu] = useState('configuration');

  const menuOption = [
    { name: 'configuration', label: 'Configuration', icon: Settings2 },
    { name: 'mic', label: 'Mic & Audio Test', icon: Mic },
    { name: 'help', label: 'Help', icon: HelpCircle },
  ];

  const view = {
    configuration: <SettingForm />,
    mic: <div>Mic & Audio Test - Coming Soon!</div>,
    help: <div>Help Section - Coming Soon!</div>,
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

          <ToggleTheme />
        </div>

        {view[menu as keyof typeof view]}

        {/* <div className="flex justify-center">
          <div className="shadow-md dark:shadow-lg dark:shadow-black/30 rounded-full mt-4 p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 flex items-center justify-around min-w-[120px] transition-all duration-500">
            <div className="bg-logo text-white rounded-md p-2 hover:scale-110 transition-transform duration-300">
              <Settings />
            </div>
            <div className="bg-blue-500 dark:bg-blue-600 text-white rounded-md p-2 hover:scale-110 transition-transform duration-300">
              <HelpCircleIcon />
            </div>
          </div>
        </div> */}
      </div>

      <div className="w-16 relative flex items-center justify-center">
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
