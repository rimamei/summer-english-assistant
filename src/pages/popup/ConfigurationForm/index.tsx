import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { validation } from './validation';
import { zodResolver } from '@hookform/resolvers/zod';
import type z from 'zod';
import { getDefaultSelectorValue, getEnabledOptions } from '../utils';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/hooks/useI18n';
import { useTranslatedOptions } from '@/hooks/useTranslatedOptions';
import { useTranslator } from '@/hooks/useTranslator';
import {
  useSummarizer,
  type SummarizerConfig,
  type SummarizerStatusItem,
} from '@/hooks/useSummarizer';
import { usePrompt } from '@/hooks/usePrompt';
import type { SelectorOption } from '@/type';
import { useStorage } from '@/hooks/useStorage';
import {
  Form,
  ControlledField,
  Select,
  RadioGroup,
} from '@/components/base';
import { initialValues } from './constant';
import { generateStream } from '@/services/gemini';
import { setLocalStorageMultiple } from '@/utils/storage';
import { buildFormData, buildStorageData, hasValidConfiguration } from './utils';
import NotificationCard from './components/NotificationCard';

const ConfigurationForm = () => {
  const { t } = useI18n();
  const {
    modeOptions: translatedModeOptions,
    targetLangOptions: translatedTargetLangOptions,
    sourceLangOptions: translatedSourceLangOptions,
    selectorOptions: translatedSelectorOptions,
    accentOptions: translatedAccentOptions,
    summarizerTypeOptions: translatedSummarizerTypeOptions,
    summarizerLengthOptions: translatedSummarizerLengthOptions,
  } = useTranslatedOptions();
  const { preferences, settingsData } = useStorage();

  const { initLanguageTranslator, translatorStatus } = useTranslator();
  const { initSummarizer, summarizerStatus } = useSummarizer();
  const { initPromptSession, promptStatus } = usePrompt();

  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedMode, setSelectedMode] = useState(initialValues.mode);

  const form = useForm<z.infer<typeof validation>>({
    resolver: zodResolver(validation),
    defaultValues: initialValues,
  });

  // Helper: Show success message temporarily
  const showSuccessMessage = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Helper: Get current status based on selected mode
  const getStatus = useCallback(() => {
    let result: SummarizerStatusItem = {
      status: 'idle',
      error: undefined,
      progress: 0,
    };

    if (selectedMode === 'translation') {
      result = translatorStatus;
    } else if (selectedMode === 'summarizer') {
      result = summarizerStatus;
    } else {
      result = promptStatus;
    }

    return {
      status: result.status,
      error: result?.error,
      progress: result?.progress ?? 0,
    };
  }, [selectedMode, translatorStatus, summarizerStatus, promptStatus]);

  // Load saved configuration into form
  const loadSettings = useCallback(async () => {
    try {
      if (hasValidConfiguration(settingsData!)) {
        const formData = buildFormData(settingsData!);
        form.reset(formData);
        setSelectedMode(formData.mode);
      }
    } catch {
      // Silently handle storage errors
    } finally {
      setIsLoading(false);
    }
  }, [settingsData, form]);

  useEffect(() => {
    if (settingsData) {
      loadSettings();
    }
  }, [settingsData, loadSettings]);

  // Initialize Chrome AI APIs
  const initializeChromeAPI = async (data: z.infer<typeof validation>) => {
    if (data.mode === 'translation') {
      await initLanguageTranslator(data.source_lang, data.target_lang);
    } else if (data.mode === 'summarizer') {
      const config: SummarizerConfig = {
        expectedInputLanguages: [data.source_lang || 'en'],
        expectedContextLanguages: [data.target_lang || 'en'],
        format: 'markdown',
        length: (data.summarizer_length || 'short') as
          | 'short'
          | 'medium'
          | 'long',
        outputLanguage: data.target_lang || 'en',
        type: (data.summarizer_type || 'key-points') as
          | 'headline'
          | 'key-points'
          | 'teaser'
          | 'tldr',
      };

      await initSummarizer(config);
    } else {
      const config: LanguageModelCreateOptions = {
        initialPrompts: [
          {
            role: 'system',
            content: 'You are a helpful and friendly assistant.',
          },
        ],
        temperature: 0.2,
        topK: 1,
        expectedInputs: [
          {
            type: 'text',
            languages: [
              data.source_lang /* system prompt */,
              data.source_lang /* user prompt */,
            ],
          },
        ],
        expectedOutputs: [{ type: 'text', languages: [data.target_lang] }],
      };

      await initPromptSession(config);
    }
  };

  // Test Gemini API connection
  const testGeminiConnection = async () => {
    if (!preferences?.apiKey) {
      throw new Error(
        'Gemini API key not found. Please add your API key to Chrome storage or .env file.'
      );
    }

    const model = preferences?.model ?? '';
    if (!model) {
      throw new Error(
        'No model specified in preferences. Please configure a model.'
      );
    }

    const testResult = await generateStream({
      model,
      contents: [
        {
          text: 'Hello, Gemini! return OK to verify the API connection.',
        },
      ],
    });

    if (!testResult.includes('OK')) {
      throw new Error('Failed to connect to Gemini API');
    }
  };

  // Save configuration to storage and apply changes
  const onSubmit = async (data: z.infer<typeof validation>) => {
    setIsLoading(true);
    setError('');

    const agent = preferences?.agent || 'chrome';

    try {
      // Initialize or test the appropriate API
      if (agent === 'chrome') {
        await initializeChromeAPI(data);
      } else {
        await testGeminiConnection();
      }

      // Fallback for when chrome.storage is not available
      if (!chrome?.storage?.local) {
        form.reset(data);
        showSuccessMessage();
        return;
      }

      const storageData = buildStorageData(data);

      await setLocalStorageMultiple({
        settings: storageData,
        ext_status: true,
      });

      form.reset(data);
      showSuccessMessage();
    } catch (e) {
      setError(e instanceof Error ? e?.message : String(e));
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if notification should be shown
  const showNotification = useMemo(() => {
    return (
      error ||
      getStatus()?.status === 'error' ||
      getStatus()?.status === 'ready' ||
      getStatus()?.status === 'downloading'
    );
  }, [getStatus, error]);

  return (
    <div className="my-4 border border-gray-200 dark:border-none dark:shadow-lg rounded-lg p-4 bg-card dark:bg-card transition-colors duration-500">
      <h3 className="text-base text-gray-900 dark:text-gray-100 font-semibold transition-colors duration-500 mb-6">
        {t('configuration')}
      </h3>

      {showNotification && <NotificationCard status={getStatus()} error={error} />}

      <Form form={form} initialValues={initialValues} onSubmit={onSubmit}>
        {({ formState: { isDirty, isValid }, setValue, getValues }) => (
          <FieldGroup>
              <ControlledField
                label={t('mode')}
                name="mode"
                options={translatedModeOptions}
                component={Select}
                onValueChange={(value) => {
                  setSelectedMode(value as 'pronunciation' | 'grammar');
                  setValue('selector', getDefaultSelectorValue(value), {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />

              <div className="w-full">
                <Label>{t('language')}</Label>
                <div className="w-full grid grid-cols-12 place-content-center items-center mt-2">
                  <div className="col-span-5">
                    <ControlledField
                      name="source_lang"
                      options={translatedSourceLangOptions}
                      component={Select}
                    />
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <ArrowRight className="mx-2" />
                  </div>

                  <div className="col-span-5">
                    <ControlledField
                      name="target_lang"
                      options={translatedTargetLangOptions}
                      defaultValue={getValues('target_lang')}
                      component={Select}
                    />
                  </div>
                </div>
              </div>

              {selectedMode === 'summarizer' && (
                <>
                  <ControlledField
                    name="summarizer_type"
                    label={t('summarizer_type')}
                    component={Select}
                    options={translatedSummarizerTypeOptions}
                    defaultValue="key-points"
                  />
                  <ControlledField
                    name="summarizer_length"
                    label={t('summarizer_length')}
                    component={RadioGroup}
                    options={translatedSummarizerLengthOptions}
                    className="grid-cols-3"
                  />
                </>
              )}

              {selectedMode !== 'translation' &&
                selectedMode !== 'summarizer' && (
                  <ControlledField
                    name="selector"
                    label={t('selector')}
                    component={RadioGroup}
                    options={translatedSelectorOptions.map((option) => ({
                      ...option,
                      disabled: !getEnabledOptions(selectedMode).includes(
                        option.value
                      ),
                    }))}
                    onValueChange={(value) => {
                      form.setValue('selector', value as SelectorOption, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    className="grid-cols-3"
                  />
                )}

              {selectedMode === 'pronunciation' && (
                <ControlledField
                  name="accent"
                  label={t('accent')}
                  component={RadioGroup}
                  options={translatedAccentOptions}
                  className="grid-cols-3"
                />
              )}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={!isDirty || !isValid || isLoading}
                  className={
                    saveSuccess ? 'bg-green-600 hover:bg-green-700' : ''
                  }
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('saved')}
                    </>
                  ) : (
                    <>{t('save_activate')}</>
                  )}
                </Button>
              </div>
            </FieldGroup>
        )}
      </Form>
    </div>
  );
};

export default ConfigurationForm;
