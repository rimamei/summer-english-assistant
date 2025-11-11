import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { CheckCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { validation } from './validation';
import { zodResolver } from '@hookform/resolvers/zod';
import type z from 'zod';
import { useI18n } from '@/hooks/useI18n';
import { useTranslatedOptions } from '@/hooks/useTranslatedOptions';
import type { TTheme } from '@/type/theme';
import { applyTheme } from '../utils';
import { useStorage } from '@/hooks/useStorage';
import { agentOptions, modelOptions } from '@/constants/agent';
import { initialValues } from './constant';
import { setLocalStorage } from '@/utils/storage';
import {
  Input,
  Form,
  ControlledField,
  Select,
  Switch,
} from '@/components/base';
import { buildFormData, buildStorageData, hasValidPreferences } from './utils';

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

  // Helper: Show success message temporarily
  const showSuccessMessage = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Load saved preferences into form
  const loadSettings = useCallback(async () => {
    try {
      if (hasValidPreferences(preferences!)) {
        const formData = buildFormData(preferences!);
        form.reset(formData);
      }
    } catch {
      // Silently handle storage errors
    } finally {
      setIsLoading(false);
    }
  }, [preferences, form]);

  useEffect(() => {
    if (preferences) {
      loadSettings();
    }
  }, [preferences, form, loadSettings]);

  // Save preferences to storage and apply changes
  const onSubmit = async (data: z.infer<typeof validation>) => {
    // Fallback for when chrome.storage is not available
    if (!chrome?.storage?.local) {
      form.reset(data);
      showSuccessMessage();
      return;
    }

    const storageData = buildStorageData(data);

    await setLocalStorage('preferences', storageData);
    applyTheme(data.theme as TTheme);
    changeLanguage(storageData.lang);

    form.reset(data);
    showSuccessMessage();
  };

  const handleToggleExtension = async (enabled: boolean) => {
    await setLocalStorage('ext_status', enabled);
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
          onCheckedChange={handleToggleExtension}
          isRightLabel
        />
      </div>
      <div className="my-4 border border-gray-200 dark:border-none dark:shadow-lg rounded-lg p-4 bg-card dark:bg-card transition-colors duration-500">
        <h3 className="text-base text-gray-900 dark:text-gray-100 font-semibold mb-6 transition-colors duration-500">
          {t('preferences')}
        </h3>
        <Form form={form} initialValues={initialValues} onSubmit={onSubmit}>
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
                    type="password"
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
