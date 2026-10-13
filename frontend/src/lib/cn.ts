import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge does not know our custom font sizes (text-body, text-small...). Without this
// it takes them for text colors and `cn('text-ink', 'text-body')` would drop the color.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'caption',
            'small',
            'body',
            'lead',
            'title',
            'headline',
            'display',
            'metric',
            'hero',
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
