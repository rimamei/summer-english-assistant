import ControlledField from '@/components/base/ControlledField';
import Select from '@/components/base/Select';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { validation } from './validation';
import { zodResolver } from '@hookform/resolvers/zod';
import type z from 'zod';
import Switch from '@/components/base/Switch';
import { useI18n } from '@/hooks/useI18n';
import { useTranslatedOptions } from '@/hooks/useTranslatedOptions';

type Theme = 'light' | 'dark';

const PreferencesForm = () => {
  const { t, changeLanguage } = useI18n();
  const { themeOptions: translatedThemeOptions, languageExtensionOptions: translatedLanguageOptions } = useTranslatedOptions();
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [extensionEnabled, setExtensionEnabled] = useState(false);

  const form = useForm<z.infer<typeof validation>>({
    resolver: zodResolver(validation),
    defaultValues: {
      lang: 'en',
      theme: 'light',
    },
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

        const getLocalStorageData = await chrome.storage.local.get([
          'preferences',
          'ext_status',
        ]);

        const result = getLocalStorageData.preferences
          ? JSON.parse(getLocalStorageData.preferences)
          : null;

        // Load extension status
        setExtensionEnabled(getLocalStorageData.ext_status || false);

        // Check if we have actual saved values (not just empty object)
        const hasValidData = result && (result.lang || result.theme);

        if (hasValidData) {
          // Create new data object with loaded values and defaults
          const loadedData = {
            lang: result.lang || 'en',
            theme: result.theme || 'light',
          };

          // Reset form with loaded data (this updates both values and default values)
          form.reset(loadedData);
        }
      } catch {
        // Silently handle storage errors
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [form]);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
  };

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
      const storageData = {
        theme: data.theme,
        lang: data.lang,
      };

      await chrome.storage.local.set({
        preferences: JSON.stringify(storageData),
      });
      applyTheme(data.theme as Theme);

       // Immediately change the language for real-time UI updates
                      changeLanguage(storageData.lang as 'en' | 'id' | 'es' | 'ja');
                      
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
    await chrome.storage.local.set({ ext_status: val });
    setExtensionEnabled(val);
  };

  return (
    <>
      <div className="my-4 border border-gray-200 dark:border-none dark:shadow-lg rounded-lg p-4 bg-card dark:bg-card transition-colors duration-500">
        <h3 className="text-base text-gray-900 dark:text-gray-100 font-semibold mb-6 transition-colors duration-500">
          {t('extension_status')}
        </h3>
        <Switch
          label={t('enabled')}
          checked={extensionEnabled}
          onCheckedChange={(checked) => {
            handleSaveStatus(checked);
          }}
          isRightLabel
        />
      </div>
      <div className="my-4 border border-gray-200 dark:border-none dark:shadow-lg rounded-lg p-4 bg-card dark:bg-card transition-colors duration-500">
        <h3 className="text-base text-gray-900 dark:text-gray-100 font-semibold mb-6 transition-colors duration-500">
          {t('preferences')}
        </h3>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <ControlledField
              form={form}
              label={t('theme')}
              name="theme"
              htmlId="theme"
              component={(field, fieldState) => (
                <Select
                  field={field}
                  fieldState={fieldState}
                  className="w-full"
                  options={translatedThemeOptions}
                  defaultValue="light"
                  onValueChange={(value) => {
                    form.setValue('theme', value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
              )}
            />

            <div className="w-full">
              <ControlledField
                form={form}
                name="lang"
                htmlId="lang"
                className="col-span-5"
                label={t('language')}
                component={(field, fieldState) => (
                  <Select
                    field={field}
                    fieldState={fieldState}
                    options={translatedLanguageOptions}
                    defaultValue="en"
                    className="w-full"
                    onValueChange={(value) => {
                      form.setValue('lang', value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  !form.formState.isDirty ||
                  !form.formState.isValid ||
                  isLoading
                }
                className={saveSuccess ? 'bg-green-600 hover:bg-green-700' : ''}
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
        </form>
      </div>
    </>
  );
};

export default PreferencesForm;
