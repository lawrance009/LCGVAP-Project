import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Teach tailwind-merge about the custom tokens in src/index.css.
 * Without this it would read `text-caption` (a font size) as a colour and
 * drop it when combined with `text-ink`. Keep in sync with @theme.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['caption', 'body', 'lead', 'title', 'heading', 'headline', 'display', 'display-lg'],
      color: [
        'paper', 'tint', 'wash', 'ink', 'muted', 'faint', 'line', 'line-strong',
        'primary', 'primary-hover', 'deep', 'on-primary', 'focus', 'seal',
        'danger', 'danger-hover', 'danger-soft', 'accent', 'accent-hover', 'accent-soft',
        'canton-50', 'canton-100', 'canton-300', 'canton-500', 'canton-700', 'canton-800', 'canton-900',
        'seal-50', 'seal-600', 'seal-700', 'ledger-300', 'ledger-400', 'ledger-500',
      ],
      radius: ['doc', 'panel'],
      shadow: ['overlay'],
      font: ['display'],
      container: ['page', 'measure'],
    },
  },
});

/** Join class names, dropping falsy values and resolving Tailwind conflicts (last wins). */
export function cn(...inputs) {
  return twMerge(inputs.filter(Boolean).join(' '));
}

export default cn;
