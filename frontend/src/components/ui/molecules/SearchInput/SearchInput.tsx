import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/atoms/Input'
import { IconButton } from '@/components/ui/atoms/IconButton'

const DEBOUNCE_MS = 300

export type SearchInputProps = {
  /** Called 300ms after the user stops typing, with the trimmed value. */
  onSearch: (value: string) => void
  name?: string
  placeholder?: string
  className?: string
}

export function SearchInput({
  onSearch,
  name = 'search',
  placeholder = 'Buscar…',
  className,
}: SearchInputProps) {
  const [value, setValue] = useState('')
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    const id = setTimeout(() => onSearch(value.trim()), DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [value, onSearch])

  return (
    <Input
      type="text"
      name={name}
      value={value}
      placeholder={placeholder}
      leftIcon="search"
      onChange={(event) => setValue(event.target.value)}
      rightSlot={
        value ? (
          <IconButton
            icon="x"
            label="Limpiar búsqueda"
            variant="ghost"
            size="sm"
            onClick={() => setValue('')}
          />
        ) : undefined
      }
      className={className}
    />
  )
}
