/* eslint-disable @typescript-eslint/no-explicit-any */
import { CircleStop, Mic, Volume2 } from 'lucide-react';
import { useState, useEffect, useRef, type JSX } from 'react';
import * as Tone from 'tone';

export default function MicAudioTest(): JSX.Element {
  // --- State ---
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSoundPlaying, setIsSoundPlaying] = useState<boolean>(false);

  // --- Refs for DOM Elements ---
  const audioVisualizerRef = useRef<HTMLCanvasElement>(null);
  const micVisualizerRef = useRef<HTMLCanvasElement>(null);

  // --- Refs for Audio API objects and animation loops ---
  const audioCanvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const micCanvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const micDrawVisualRef = useRef<number | null>(null); // requestAnimationFrame ID
  const outputWaveformRef = useRef<Tone.Waveform | null>(null);
  const audioDrawVisualRef = useRef<number | null>(null); // requestAnimationFrame ID

  // --- Canvas Utility Functions ---
  const clearMicCanvas = (): void => {
    if (micCanvasCtxRef.current && micVisualizerRef.current) {
      micCanvasCtxRef.current.fillStyle = 'rgb(243, 244, 246)';
      micCanvasCtxRef.current.fillRect(
        0,
        0,
        micVisualizerRef.current.width,
        micVisualizerRef.current.height
      );
    }
  };

  const clearAudioCanvas = (): void => {
    if (audioCanvasCtxRef.current && audioVisualizerRef.current) {
      audioCanvasCtxRef.current.fillStyle = 'rgb(243, 244, 246)';
      audioCanvasCtxRef.current.fillRect(
        0,
        0,
        audioVisualizerRef.current.width,
        audioVisualizerRef.current.height
      );
    }
  };

  // --- 1. Audio Output Logic ---
  const drawAudioWaveform = (): void => {
    audioDrawVisualRef.current = requestAnimationFrame(drawAudioWaveform);

    if (
      outputWaveformRef.current &&
      audioCanvasCtxRef.current &&
      audioVisualizerRef.current
    ) {
      const waveformValues = outputWaveformRef.current.getValue();
      const canvas = audioVisualizerRef.current;
      const ctx = audioCanvasCtxRef.current;

      ctx.fillStyle = 'rgb(243, 244, 246)'; // bg-gray-100
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(0, 0, 0)'; // Black
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / waveformValues.length;
      let x = 0;

      for (let i = 0; i < waveformValues.length; i++) {
        const v = waveformValues[i];
        const y = v * (canvas.height / 2) + canvas.height / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
  };

  const handlePlaySound = async (): Promise<void> => {
    try {
      await Tone.start();
      outputWaveformRef.current = new Tone.Waveform(1024).toDestination();
      const synth = new Tone.Synth().connect(
        outputWaveformRef.current as Tone.ToneAudioNode
      ); // Assert as ToneAudioNode
      synth.triggerAttackRelease('C4', '8n');

      setStatusMessage('');
      setIsSoundPlaying(true);
      drawAudioWaveform();

      setTimeout(() => {
        if (audioDrawVisualRef.current) {
          cancelAnimationFrame(audioDrawVisualRef.current);
        }
        clearAudioCanvas();
        setIsSoundPlaying(false);
      }, 500);
    } catch (error: any) {
      console.error('Error playing sound:', error);
      setStatusMessage('Could not play audio.');
    }
  };

  // --- 2. Microphone Input Logic ---
  const drawMicWaveform = (): void => {
    micDrawVisualRef.current = requestAnimationFrame(drawMicWaveform);

    if (
      analyserRef.current &&
      dataArrayRef.current &&
      micCanvasCtxRef.current &&
      micVisualizerRef.current
    ) {
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current as any);
      const canvas = micVisualizerRef.current;
      const ctx = micCanvasCtxRef.current;
      const dataArray = dataArrayRef.current;

      ctx.fillStyle = 'rgb(243, 244, 246)'; // bg-gray-100
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(0, 0, 0)'; // Black
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v - 1.0) * (canvas.height / 2);
        if (i === 0) ctx.moveTo(x, y + canvas.height / 2);
        else ctx.lineTo(x, y + canvas.height / 2);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
  };

  const handleStartMicTest = async (): Promise<void> => {
    setStatusMessage('Requesting mic permission...');
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setStatusMessage('');
      setIsMicActive(true);

      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;

      const source = audioContextRef.current.createMediaStreamSource(
        streamRef.current
      );
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      drawMicWaveform();
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError'
      ) {
        setStatusMessage('Error: Microphone permission denied.');
      } else {
        setStatusMessage('Error: No microphone found.');
      }
      setIsMicActive(false);
    }
  };

  const handleStopMicTest = (): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (micDrawVisualRef.current) {
      cancelAnimationFrame(micDrawVisualRef.current);
    }
    clearMicCanvas();
    setIsMicActive(false);
    setStatusMessage('');
  };

  // --- Lifecycle (Setup and Teardown) ---
  useEffect(() => {
    // --- Setup Canvas Contexts and Resize Observer ---
    if (audioVisualizerRef.current) {
      audioCanvasCtxRef.current = audioVisualizerRef.current.getContext('2d');
      audioVisualizerRef.current.width = audioVisualizerRef.current.offsetWidth;
      audioVisualizerRef.current.height =
        audioVisualizerRef.current.offsetHeight;
    }
    if (micVisualizerRef.current) {
      micCanvasCtxRef.current = micVisualizerRef.current.getContext('2d');
      micVisualizerRef.current.width = micVisualizerRef.current.offsetWidth;
      micVisualizerRef.current.height = micVisualizerRef.current.offsetHeight;
    }

    clearAudioCanvas();
    clearMicCanvas();

    const handleResize = (): void => {
      if (audioVisualizerRef.current) {
        audioVisualizerRef.current.width =
          audioVisualizerRef.current.offsetWidth;
        audioVisualizerRef.current.height =
          audioVisualizerRef.current.offsetHeight;
      }
      if (micVisualizerRef.current) {
        micVisualizerRef.current.width = micVisualizerRef.current.offsetWidth;
        micVisualizerRef.current.height = micVisualizerRef.current.offsetHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    // --- Cleanup Function ---
    return () => {
      window.removeEventListener('resize', handleResize);
      // Stop mic test if component unmounts
      // Check isMicActive state from state, not a ref
      if (isMicActive) {
        handleStopMicTest();
      }
      // Cancel any leftover animation frames
      if (audioDrawVisualRef.current)
        cancelAnimationFrame(audioDrawVisualRef.current);
      if (micDrawVisualRef.current)
        cancelAnimationFrame(micDrawVisualRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array runs once on mount

  return (
    <div className="w-full max-w-md space-y-4">
      {/* --- 1. Audio Output Test --- */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">
          1. Audio Output Test
        </h3>
        <p className="text-sm text-gray-600">
          Click the button to play a test sound.
        </p>
        <canvas
          ref={audioVisualizerRef}
          className="w-full h-10 bg-gray-100 rounded-lg border border-gray-200"
        ></canvas>
        <button
          id="play-sound-btn"
          onClick={handlePlaySound}
          disabled={isSoundPlaying}
          className="w-full flex items-center justify-center space-x-2 bg-black text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition duration-300 ease-in-out disabled:bg-gray-400"
        >
          {/* <SoundIcon
            className={`h-5 w-5 ${isSoundPlaying ? 'animate-wiggle' : ''}`}
          /> */}

          <Volume2 className={`h-5 w-5 ${isSoundPlaying ? 'animate-wiggle' : ''}`} />
          <span>{isSoundPlaying ? 'Playing...' : 'Play Test Sound'}</span>
        </button>
      </div>

      {/* --- 2. Microphone Input Test --- */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">
          2. Microphone Input Test
        </h3>
        <p className="text-sm text-gray-600">
          Click "Start" and speak into your microphone.
        </p>
        <canvas
          ref={micVisualizerRef}
          className="w-full h-10 bg-gray-100 rounded-lg border border-gray-200"
        ></canvas>
        <div className="flex space-x-4">
          <button
            id="start-mic-btn"
            onClick={handleStartMicTest}
            disabled={isMicActive}
            className="flex-1 flex items-center justify-center space-x-2 bg-black text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition duration-300 ease-in-out disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
          >
            <Mic className="h-5 w-5" />
            <span>Start Mic Test</span>
          </button>
          <button
            id="stop-mic-btn"
            onClick={handleStopMicTest}
            disabled={!isMicActive}
            className="flex-1 flex items-center justify-center space-x-2 bg-white text-black border border-gray-400 font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition duration-300 ease-in-out disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:shadow-none"
          >
            <CircleStop className="h-5 w-5" />
            <span>Stop Mic Test</span>
          </button>
        </div>
      </div>

      {/* --- Status Message Area --- */}
      <div id="status-message" className="text-sm text-center text-red-500 h-4">
        {statusMessage}
      </div>
    </div>
  );
}
