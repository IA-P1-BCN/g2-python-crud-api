import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from '@/components/ui/atoms/Icon'
import { buttonStyles, type ButtonSize, type ButtonVariant } from './buttonStyles'

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  isLoading?: boolean
  leftIcon?: IconName
  rightIcon?: IconName
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ variant, size, fullWidth, className })}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? (
        'Cargando…'
      ) : (
        <>
          {leftIcon ? <Icon name={leftIcon} size={16} /> : null}
          {children}
          {rightIcon ? <Icon name={rightIcon} size={16} /> : null}
        </>
      )}
    </button>
  )
}
