import ControlledField from '@/components/base/ControlledField';
import Select from '@/components/base/Select';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { ArrowRight, CheckCircle, InfoIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { validation } from './validation';
import { zodResolver } from '@hookform/resolvers/zod';
import type z from 'zod';
import { getDefaultSelectorValue, getEnabledOptions } from '../utils';
import RadioGroup from '@/components/base/RadioGroup';
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
import type { IConfiguration, SelectorOption } from '@/type';
import { useStorage } from '@/hooks/useStorage';
import Form from '@/components/base/Form';
import { initialValues } from './constant';
import { generateStream } from '@/services/gemini';
import { setLocalStorageMultiple } from '@/utils/storage';

const Configuration = () => {
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

  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const [selectedMode, setSelectedMode] = useState(initialValues.mode);

  const form = useForm<z.infer<typeof validation>>({
    resolver: zodResolver(validation),
    defaultValues: initialValues,
  });

  // Load settings from Chrome storage on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Check if chrome.storage is available
        if (!chrome?.storage?.local) {
          setIsLoading(false);
          return;
        }

        const result: IConfiguration | undefined = settingsData;

        if (result) {
          // Create new data object with loaded values and defaults
          const loadedData: IConfiguration = {
            source_lang: result?.source_lang || 'en',
            target_lang: result?.target_lang || 'in',
            mode: result?.mode || 'pronunciation',
            selector: result?.selector || 'word',
            accent: (result?.accent || 'american'),
            summarizer_type: (result?.summarizer_type || 'key-points'),
            summarizer_length: (result?.summarizer_length || 'short') as
              | 'short'
              | 'medium'
              | 'long',
          };

          form.reset(loadedData);

          // Update selectedMode state
          setSelectedMode(
            loadedData?.mode as
              | 'pronunciation'
              | 'grammar'
              | 'summarizer'
              | 'translation'
          );
        }
      } catch {
        // Silently handle storage errors
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [form, settingsData]);

  const handleSubmit = async (data: z.infer<typeof validation>) => {
    setIsLoading(true);

    const agent = preferences?.agent || 'chrome';

    try {
      if (agent === 'chrome') {
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

        await saveToStorage(data);
      } else {
        if (!preferences?.apiKey) {
          throw new Error(
            'Gemini API key not found. Please add your API key to Chrome storage or .env file.'
          );
        }

        // Test the connection with the model
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

        if (testResult.includes('OK')) {
          await saveToStorage(data);
        }
        
      }
    } catch (e) {
      setError(e instanceof Error ? e?.message : String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const saveToStorage = async (data: z.infer<typeof validation>) => {
    setError('');
    try {
      // Check if chrome.storage is available
      if (!chrome?.storage?.local) {
        form.reset(data);
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 2000);
        return;
      }

      // Save to Chrome local storage
      const storageData = {
        source_lang: data.source_lang,
        target_lang: data.target_lang,
        mode: data.mode,
        accent: data.accent,
        ...(data.selector && { selector: data.selector }),
        ...(data.summarizer_type && { summarizer_type: data.summarizer_type }),
        ...(data.summarizer_length && {
          summarizer_length: data.summarizer_length,
        }),
      };

      await setLocalStorageMultiple({
        settings: storageData,
        ext_status: true,
      });

      // Reset form dirty state after successful save
      form.reset(data);

      // Show success feedback
      setSaveSuccess(true);

      // Clear success message after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

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

      {/* Notification Card */}
      {showNotification && (
        <div
          className={`w-full flex items-center gap-3 min-h-12 px-4 py-3 mb-6 rounded-lg shadow-sm border
            ${
              getStatus().status === 'error'
                ? 'border-red-200 bg-red-50 dark:bg-red-900 dark:border-red-700'
                : getStatus().status === 'downloading'
                ? 'border-blue-200 bg-blue-50 dark:bg-blue-900 dark:border-blue-700'
                : getStatus().status === 'ready'
                ? 'border-green-200 bg-green-50 dark:bg-green-900 dark:border-green-700'
                : 'border-zinc-200 from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 dark:border-zinc-700'
            }`}
          style={{ fontWeight: 500 }}
        >
          {getStatus().status === 'error' || error ? (
            <>
              <InfoIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-100">
                {getStatus().error ? getStatus().error : error}
              </span>
            </>
          ) : getStatus().status === 'downloading' ? (
            <>
              <InfoIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 animate-spin" />
              <span className="text-blue-800 dark:text-blue-100">
                {t('api_downloading')}
                {typeof getStatus().progress === 'number' && (
                  <span className="ml-2">
                    {Math.round(getStatus().progress)}%
                  </span>
                )}
              </span>
            </>
          ) : (
            getStatus().status === 'ready' && (
              <>
                <InfoIcon className="w-5 h-5 text-green-500 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-100">
                  {t('api_ready')}
                </span>
              </>
            )
          )}
        </div>
      )}

      <Form form={form} initialValues={initialValues} onSubmit={handleSubmit}>
        {({ formState: { isDirty, isValid }, setValue, getValues }) => {
          return (
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
          );
        }}
      </Form>
    </div>
  );
};

export default Configuration;
