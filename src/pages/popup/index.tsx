// import ToggleTheme from '@/components/base/ToggleTheme';
import ToggleTheme from '@/components/base/ToggleTheme';
import SettingForm from './SettingForm';

function Popup() {
  return (
    <div className="shadow-lg dark:shadow-2xl dark:shadow-black/50 p-6 min-w-[500px] max-w-[500px] max-auto min-h-[500px] h-full bg-background text-foreground font-display transition-all duration-700 ease-in-out transform hover:shadow-2xl dark:hover:shadow-black/70 relative overflow-hidden rounded-xl dark:border dark:border-white/10">
      <div className="relative z-10">
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
                Master English with AI-powered insights
              </p>
            </div>
          </div>

          <ToggleTheme />
        </div>

        <SettingForm />

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
    </div>
  );
}

export default Popup;
