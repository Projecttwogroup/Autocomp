import { toast } from "@/hooks/use-toast";
import { ZodSchema } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormProps } from 'react-hook-form';
import { z } from 'zod';
import { errorService } from '@/services/error-service';
import { useToast } from '@/hooks/use-toast';

interface FormSubmitOptions<T> {
  onSuccess?: (data: T) => void | Promise<void>;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export async function handleFormSubmit<T>(
  schema: ZodSchema<T>,
  data: unknown,
  submitFn: (validData: T) => Promise<void>,
  options: FormSubmitOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    successMessage = "Operation completed successfully",
    errorMessage = "An error occurred. Please try again.",
  } = options;

  try {
    const validData = await schema.parseAsync(data);
    await submitFn(validData);
    
    toast({
      title: "Success",
      description: successMessage,
    });

    if (onSuccess) {
      await onSuccess(validData);
    }
  } catch (error) {
    console.error("Form submission error:", error);
    
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : errorMessage,
      variant: "destructive",
    });

    if (onError && error instanceof Error) {
      onError(error);
    }
  }
}

export function createFormData(data: Record<string, any>) {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        formData.append(`${key}[${index}]`, item);
      });
    } else if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  return formData;
}

export function serializeFormData<T extends Record<string, any>>(formData: FormData): T {
  const entries = Array.from(formData.entries());
  const data: Record<string, any> = {};

  entries.forEach(([key, value]) => {
    // Handle array fields (keys with [] notation)
    if (key.includes('[]')) {
      const arrayKey = key.replace('[]', '');
      if (!data[arrayKey]) {
        data[arrayKey] = [];
      }
      data[arrayKey].push(value);
    } else if (key.includes('[') && key.includes(']')) {
      // Handle nested object fields
      const [baseKey, ...rest] = key.split('[');
      const path = [baseKey, ...rest.map(k => k.replace(']', ''))];
      let current = data;
      path.forEach((k, i) => {
        if (i === path.length - 1) {
          current[k] = value;
        } else {
          current[k] = current[k] || {};
          current = current[k];
        }
      });
    } else {
      data[key] = value;
    }
  });

  return data as T;
}

export interface FormConfig<T extends z.ZodType> {
  schema: T;
  defaultValues?: z.infer<T>;
  onSubmit: (data: z.infer<T>) => Promise<void> | void;
  onError?: (error: unknown) => void;
}

export function useFormWithValidation<T extends z.ZodType>({
  schema,
  defaultValues,
  onSubmit,
  onError,
  ...formConfig
}: FormConfig<T> & Omit<UseFormProps, 'resolver'>) {
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    ...formConfig,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      errorService.captureError(error, {
        formData: data,
      });

      onError?.(error);

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred while submitting the form',
        variant: 'destructive',
      });
    }
  });

  return {
    ...form,
    handleSubmit,
  };
}

// Common validation patterns
export const patterns = {
  email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  phone: /^\+?[1-9]\d{1,14}$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
};

// Validation messages
export const messages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  url: 'Please enter a valid URL',
  min: (min: number) => `Must be at least ${min} characters`,
  max: (max: number) => `Must be at most ${max} characters`,
};

// Common schema builders
export const schemaBuilders = {
  email: () => z.string().email(messages.email),
  phone: () => z.string().regex(patterns.phone, messages.phone),
  url: () => z.string().regex(patterns.url, messages.url),
  password: (options?: { min?: number; max?: number }) =>
    z
      .string()
      .min(options?.min ?? 8, messages.min(options?.min ?? 8))
      .max(options?.max ?? 100, messages.max(options?.max ?? 100)),
};

// Form field types for common inputs
export interface FieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export interface TextFieldProps extends FieldProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  placeholder?: string;
  autoComplete?: string;
}

// Form state helpers
export function getFieldError(fieldName: string, formState: any): string | undefined {
  return formState.errors[fieldName]?.message;
}

export function isFieldValid(fieldName: string, formState: any): boolean {
  return !formState.errors[fieldName] && formState.touchedFields[fieldName];
}

// Form submission helpers
export async function handleApiFormSubmit<T>(
  data: T,
  apiCall: (data: T) => Promise<any>,
  options: {
    onSuccess?: (response: any) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
  } = {}
) {
  const { toast } = useToast();

  try {
    const response = await apiCall(data);
    
    if (options.successMessage) {
      toast({
        title: 'Success',
        description: options.successMessage,
      });
    }

    options.onSuccess?.(response);
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });

    options.onError?.(error as Error);
    throw error;
  }
}