import { describe, expect, it } from 'vitest'
import { parseAbortMessageArgs } from './liquid-engine'

describe('parseAbortMessageArgs', () => {
  it('returns empty string for undefined/empty input', () => {
    expect(parseAbortMessageArgs(undefined)).toBe('')
    expect(parseAbortMessageArgs('')).toBe('')
    expect(parseAbortMessageArgs('   ')).toBe('')
  })

  it('strips surrounding quotes', () => {
    expect(parseAbortMessageArgs('"Hello"')).toBe('Hello')
    expect(parseAbortMessageArgs("'Hello'")).toBe('Hello')
    expect(parseAbortMessageArgs("  'Hello'  ")).toBe('Hello')
  })

  it('strips surrounding parentheses and quotes', () => {
    expect(parseAbortMessageArgs('("Hello")')).toBe('Hello')
    expect(parseAbortMessageArgs("( 'Hello' )")).toBe('Hello')
    expect(parseAbortMessageArgs('  (  "Hello"  )  ')).toBe('Hello')
  })

  it('falls back to trimmed input for unquoted input', () => {
    expect(parseAbortMessageArgs('Hello')).toBe('Hello')
    expect(parseAbortMessageArgs('  Hello world  ')).toBe('Hello world')
  })
})

