import { z } from 'zod';

// Newsletter subscription validation
export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
});

// Contact form validation
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^[+\d\s-()]{7,20}$/.test(val), {
      message: 'Please enter a valid phone number',
    }),
  subject: z
    .string()
    .trim()
    .min(1, { message: 'Subject is required' })
    .max(200, { message: 'Subject must be less than 200 characters' }),
  message: z
    .string()
    .trim()
    .min(10, { message: 'Message must be at least 10 characters' })
    .max(2000, { message: 'Message must be less than 2000 characters' }),
});

// Review form validation
export const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, { message: 'Please select a rating' })
    .max(5, { message: 'Rating must be between 1 and 5' }),
  comment: z
    .string()
    .trim()
    .max(1000, { message: 'Comment must be less than 1000 characters' })
    .optional(),
});

// Checkout address validation
export const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: 'Full name is required' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  phone: z
    .string()
    .trim()
    .min(7, { message: 'Phone number is required' })
    .max(20, { message: 'Phone must be less than 20 characters' })
    .refine((val) => /^[+\d\s-()]{7,20}$/.test(val), {
      message: 'Please enter a valid phone number',
    }),
  addressLine1: z
    .string()
    .trim()
    .min(1, { message: 'Address is required' })
    .max(200, { message: 'Address must be less than 200 characters' }),
  addressLine2: z
    .string()
    .trim()
    .max(200, { message: 'Address must be less than 200 characters' })
    .optional(),
  city: z
    .string()
    .trim()
    .min(1, { message: 'City is required' })
    .max(100, { message: 'City must be less than 100 characters' }),
  district: z
    .string()
    .trim()
    .min(1, { message: 'District is required' })
    .max(100, { message: 'District must be less than 100 characters' }),
});

// Sanitize text input (removes potential XSS vectors)
export const sanitizeText = (text: string): string => {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate and sanitize search input
export const sanitizeSearchQuery = (query: string): string => {
  return query
    .trim()
    .slice(0, 100) // Limit length
    .replace(/[<>'"]/g, ''); // Remove potential XSS characters
};

export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
