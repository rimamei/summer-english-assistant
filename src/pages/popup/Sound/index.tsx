import AudioTest from '@/components/base/MicAudioTest';

const Sound = () => {
  return (
    <div className="min-h-[80vh] my-4 border border-gray-200 dark:border-none dark:shadow-lg rounded-lg p-4 bg-card dark:bg-card transition-colors duration-500">
      <h3 className="text-base text-gray-900 dark:text-gray-100 font-semibold mb-6 transition-colors duration-500">
        Mic & Audio Test
      </h3>

      <AudioTest />
    </div>
  );
};

export default Sound;
