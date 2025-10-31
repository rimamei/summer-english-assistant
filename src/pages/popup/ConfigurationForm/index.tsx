import ControlledField from '@/components/base/ControlledField';
import Select from '@/components/base/Select';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { ArrowRight, CheckCircle, InfoIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
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

const Configuration = () => {
  const { t } = useI18n();
  const {
    modeOptions: translatedModeOptions,
    targetLangOptions: translatedTargetLangOptions,
    sourceLangOptions: translatedSourceLangOptions,
    selectorOptions: translatedSelectorOptions,
    accentOptions: translatedAccentOptions,
  } = useTranslatedOptions();

  const { initLanguageTranslator, translatorStatus } = useTranslator();
  const { initSummarizer, summarizerStatus } = useSummarizer();
  const { initPromptSession, promptStatus } = usePrompt();

  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<z.infer<typeof validation>>({
    resolver: zodResolver(validation),
    defaultValues: {
      source_lang: 'en',
      target_lang: 'in',
      mode: 'pronunciation',
      selector: 'word',
      accent: 'american',
    },
  });

  const [selectedMode, setSelectedMode] = useState(form.getValues('mode'));

  const targetLanguageOptions =
    selectedMode === 'translation'
      ? translatedTargetLangOptions.filter((option) => option.value !== 'en')
      : translatedTargetLangOptions;

  // Load settings from Chrome storage on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Check if chrome.storage is available
        if (!chrome?.storage?.local) {
          setIsLoading(false);
          return;
        }

        const getLocalStorageData = await chrome.storage.local.get([
          'settings',
        ]);

        const result = getLocalStorageData.settings
          ? JSON.parse(getLocalStorageData.settings)
          : null;

        // Check if we have actual saved values (not just empty object)
        const hasValidData =
          result &&
          (result?.source_lang ||
            result?.target_lang ||
            result?.mode ||
            result?.selector ||
            result?.accent);

        if (hasValidData) {
          // Create new data object with loaded values and defaults
          const loadedData = {
            source_lang: result?.source_lang || 'en',
            target_lang: result?.target_lang || 'in',
            mode: result?.mode || 'pronunciation',
            selector: result?.selector || 'word',
            accent: result?.accent || 'american',
            enabled_extension: result?.enabled_extension || false,
          };

          // Reset form with loaded data (this updates both values and default values)
          form.reset(loadedData);

          // Update selectedMode state
          setSelectedMode(loadedData.mode);
        }
      } catch {
        // Silently handle storage errors
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [form]);

  const onSubmit = async (data: z.infer<typeof validation>) => {
    setIsLoading(true);

    try {
      if (data.mode === 'translation') {
        await initLanguageTranslator(data.source_lang, data.target_lang);
      } else if (data.mode === 'summarizer') {
        const config: SummarizerConfig = {
          expectedInputLanguages: [data.source_lang || 'en'],
          expectedContextLanguages: [data.target_lang || 'en'],
          format: 'plain-text',
          length: 'medium',
          outputLanguage: data.target_lang || 'en',
          type: 'key-points',
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

      saveToStorage(data);
    } catch (e) {
      console.log('err', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToStorage = async (data: z.infer<typeof validation>) => {
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
      };

      await chrome.storage.local.set({ settings: JSON.stringify(storageData) });

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

  const getStatus = () => {
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
  };

  console.log(getStatus());

  return (
    <div className="my-4 border border-gray-200 dark:border-none dark:shadow-lg rounded-lg p-4 bg-card dark:bg-card transition-colors duration-500">
      <h3 className="text-base text-gray-900 dark:text-gray-100 font-semibold transition-colors duration-500 mb-6">
        {t('configuration')}
      </h3>

      {/* Notification Card */}
      {(error || getStatus()?.status !== 'idle') && (
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
          {(getStatus().status === 'error' || error) && (
            <>
              <InfoIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-100">
                {getStatus().error ? getStatus().error : error}
              </span>
            </>
          )}
          {getStatus().status === 'downloading' && (
            <>
              <InfoIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 animate-spin" />
              <span className="text-blue-800 dark:text-blue-100">
                {t('api_downloading')}
                {typeof getStatus().progress === 'number' && (
                  <span className="ml-2">
                    {Math.round(getStatus().progress * 100)}%
                  </span>
                )}
              </span>
            </>
          )}
          {getStatus().status === 'ready' && (
            <>
              <InfoIcon className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-100">
                {t('api_ready')}
              </span>
            </>
          )}
        </div>
      )}

      <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <ControlledField
            form={form}
            label={t('mode')}
            name="mode"
            htmlId="mode"
            component={(field, fieldState) => (
              <Select
                field={field}
                fieldState={fieldState}
                className="w-full"
                options={translatedModeOptions}
                defaultValue="pronunciation"
                onValueChange={(value) => {
                  setSelectedMode(value as 'pronunciation' | 'grammar');
                  form.setValue('selector', getDefaultSelectorValue(value), {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
            )}
          />

          <div className="w-full">
            <Label>{t('language')}</Label>
            <div className="w-full grid grid-cols-12 place-content-center items-center mt-2">
              <ControlledField
                form={form}
                name="source_lang"
                htmlId="source_lang"
                className="col-span-5"
                component={(field, fieldState) => (
                  <Select
                    field={field}
                    fieldState={fieldState}
                    options={translatedSourceLangOptions}
                    defaultValue="en"
                    className="w-full"
                  />
                )}
              />

              <div className="col-span-2 flex justify-center">
                <ArrowRight className="mx-2" />
              </div>
              <ControlledField
                className="col-span-5"
                form={form}
                name="target_lang"
                htmlId="target_lang"
                component={(field, fieldState) => (
                  <Select
                    field={field}
                    fieldState={fieldState}
                    options={targetLanguageOptions}
                    defaultValue="in"
                    className="w-full"
                    onValueChange={(value) => {
                      form.setValue('target_lang', value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                )}
              />
            </div>
          </div>

          {selectedMode !== 'translation' && (
            <ControlledField
              form={form}
              name="selector"
              htmlId="selector"
              label={t('selector')}
              component={(field, fieldState) => (
                <RadioGroup
                  field={field}
                  fieldState={fieldState}
                  options={translatedSelectorOptions.map((option) => ({
                    ...option,
                    disabled: !getEnabledOptions(selectedMode).includes(
                      option.value
                    ),
                  }))}
                  className="grid-cols-3"
                />
              )}
            />
          )}

          <ControlledField
            form={form}
            name="accent"
            htmlId="accent"
            label={t('accent')}
            component={(field, fieldState) => (
              <RadioGroup
                field={field}
                fieldState={fieldState}
                options={translatedAccentOptions}
                className="grid-cols-3"
              />
            )}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={
                !form.formState.isDirty || !form.formState.isValid || isLoading
              }
              className={saveSuccess ? 'bg-green-600 hover:bg-green-700' : ''}
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
      </form>
    </div>
  );
};

export default Configuration;
