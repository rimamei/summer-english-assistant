import ControlledField from '@/components/base/ControlledField';
import Select from '@/components/base/Select';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { validation } from './validation';
import { zodResolver } from '@hookform/resolvers/zod';
import type z from 'zod';
import { getDefaultSelectorValue, getEnabledOptions } from '../utils';
import {
  accentOptions,
  modeOptions,
  selectorOptions,
  sourceLangOptions,
  targetLangOptions,
} from '../constants';
import RadioGroup from '@/components/base/RadioGroup';
import { Label } from '@/components/ui/label';

const Configuration = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const form = useForm<z.infer<typeof validation>>({
    resolver: zodResolver(validation),
    defaultValues: {
      source_lang: 'en',
      target_lang: 'in',
      mode: 'pronunciation',
      selector: 'word',
      accent: 'american'
    },
  });

  const [selectedMode, setSelectedMode] = useState(form.getValues('mode'));

  const targetLanguageOptions =
    selectedMode === 'translation'
      ? targetLangOptions.filter((option) => option.value !== 'en')
      : targetLangOptions;

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
    } catch {
      // Silently handle save errors
      // Could add user-facing error notification here in the future
    }
  };

  return (
    <div className="my-4 border border-gray-200 dark:border-none dark:shadow-lg rounded-lg p-4 bg-card dark:bg-card transition-colors duration-500">
      <h3 className="text-base text-gray-900 dark:text-gray-100 font-semibold transition-colors duration-500 mb-6">
        Configuration
      </h3>

      <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <ControlledField
            form={form}
            label="Mode"
            name="mode"
            htmlId="mode"
            component={(field, fieldState) => (
              <Select
                field={field}
                fieldState={fieldState}
                className="w-full"
                options={modeOptions}
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
            <Label>Language</Label>
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
                    options={sourceLangOptions}
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
              label="Selector"
              component={(field, fieldState) => (
                <RadioGroup
                  field={field}
                  fieldState={fieldState}
                  options={selectorOptions.map((option) => ({
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
            label="Accent"
            component={(field, fieldState) => (
              <RadioGroup
                field={field}
                fieldState={fieldState}
                options={accentOptions}
                className="grid-cols-3"
              />
            )}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                !form.formState.isDirty || !form.formState.isValid || isLoading
              }
              className={saveSuccess ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>Save & Activate</>
              )}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
};

export default Configuration;
