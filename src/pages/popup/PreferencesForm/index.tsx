import ControlledField from '@/components/base/ControlledField';
import Select from '@/components/base/Select';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { CheckCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { validation } from './validation';
import { zodResolver } from '@hookform/resolvers/zod';
import type z from 'zod';
import Switch from '@/components/base/Switch';
import { useI18n } from '@/hooks/useI18n';
import { useTranslatedOptions } from '@/hooks/useTranslatedOptions';
import type { TTheme } from '@/type/theme';
import { applyTheme } from '../utils';
import { useStorage } from '@/hooks/useStorage';
import { agentOptions, modelOptions } from '@/constants/agent';
import Form from '@/components/base/Form';
import { initialValues } from './constant';
import { setLocalStorage } from '@/utils/storage';
import Input from '@/components/base/Input';
import type { IPreferences } from '@/type';

const PreferencesForm = () => {
  const { t, changeLanguage } = useI18n();
  const { preferences, enableExtension } = useStorage();

  const {
    themeOptions: translatedThemeOptions,
    languageExtensionOptions: translatedLanguageOptions,
  } = useTranslatedOptions();
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const form = useForm<z.infer<typeof validation>>({
    resolver: zodResolver(validation),
    defaultValues: initialValues,
  });

  const loadSettings = useCallback(async () => {
    try {
      // Check if we have actual saved values (not just empty object)
      const hasValidData =
        preferences &&
        preferences.lang &&
        preferences.theme &&
        preferences.agent;

      if (hasValidData) {
        // Create new data object with loaded values and defaults
        const loadedData = {
          lang: preferences.lang || 'en',
          theme: preferences.theme || 'light',
          agent: preferences.agent || 'chrome',
          ...(preferences.agent === 'gemini' && {
            model: preferences.model,
            apiKey: preferences.apiKey,
          }),
        };

        // Reset form with loaded data (this updates both values and default values)
        form.reset(loadedData);
        // setValues(loadedData);
      }
    } catch {
      // Silently handle storage errors
    } finally {
      setIsLoading(false);
    }
  }, [preferences, form]);

  // Load settings from Chrome storage on component mount
  useEffect(() => {
    if (preferences) {
      loadSettings();
    }
  }, [preferences, form, loadSettings]);

  const onSubmit = async (data: z.infer<typeof validation>) => {
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
      const storageData: IPreferences = {
        theme: data.theme,
        lang: data.lang,
        agent: data.agent,
        ...(data.agent === 'gemini' && {
          model: data.model,
          apiKey: data.apiKey,
        }),
      };

      await setLocalStorage('preferences', storageData);
      applyTheme(data.theme as TTheme);

      // Immediately change the language for real-time UI updates
      changeLanguage(storageData.lang);

      // Reset form dirty state after successful save
      form.reset(data);

      // Show success feedback
      setSaveSuccess(true);

      // Clear success message after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch {
      // Silently handle save errors
      // Could add user-facing error notification here in the future
    }
  };

  const handleSaveStatus = async (val: boolean) => {
    await setLocalStorage('ext_status', val);
  };

  return (
    <>
      <div className="my-4 border border-gray-200 dark:border-none dark:shadow-lg rounded-lg p-4 bg-card dark:bg-card transition-colors duration-500">
        <h3 className="text-base text-gray-900 dark:text-gray-100 font-semibold mb-6 transition-colors duration-500">
          {t('extension_status')}
        </h3>
        <Switch
          label={t('enabled')}
          checked={!!enableExtension}
          onCheckedChange={handleSaveStatus}
          isRightLabel
        />
      </div>
      <div className="my-4 border border-gray-200 dark:border-none dark:shadow-lg rounded-lg p-4 bg-card dark:bg-card transition-colors duration-500">
        <h3 className="text-base text-gray-900 dark:text-gray-100 font-semibold mb-6 transition-colors duration-500">
          {t('preferences')}
        </h3>
        <Form
          form={form}
          initialValues={initialValues}
          onSubmit={onSubmit}
        >
          {({ formState: { isValid, isDirty }, getValues }) => (
            <FieldGroup>
              <ControlledField
                name="agent"
                className="col-span-5"
                label="Agent"
                options={agentOptions}
                component={Select}
              />

              {getValues('agent') === 'gemini' && (
                <>
                  <ControlledField
                    name="model"
                    className="col-span-5"
                    label="Model"
                    component={Select}
                    options={modelOptions[getValues('agent') as 'gemini']}
                  />
                  <ControlledField
                    name="apiKey"
                    className="col-span-5"
                    label="API Key"
                    component={Input}
                    placeholder="Enter your API Key"
                    type='password'
                  />
                </>
              )}

              <ControlledField
                label={t('theme')}
                name="theme"
                component={Select}
                options={translatedThemeOptions}
              />

              <ControlledField
                name="lang"
                className="col-span-5"
                label={t('language')}
                options={translatedLanguageOptions}
                component={Select}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
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
                    <>{t('apply')}</>
                  )}
                </Button>
              </div>
            </FieldGroup>
          )}
        </Form>
      </div>
    </>
  );
};

export default PreferencesForm;
