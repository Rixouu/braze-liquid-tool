import { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DISMISS_KEY = 'braze-liquid-tool-pwa-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return nav.standalone === true
}

function isLikelyIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return true
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

export function PwaInstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSHint, setShowIOSHint] = useState(false)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isStandaloneDisplay()) return
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return
    } catch {
      /* private mode */
    }
    setDismissed(false)

    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBip)

    const onInstalled = () => {
      setDeferred(null)
      setShowIOSHint(false)
      setDismissed(true)
    }
    window.addEventListener('appinstalled', onInstalled)

    let iosTimer: ReturnType<typeof setTimeout> | undefined
    if (isLikelyIOS()) {
      iosTimer = setTimeout(() => setShowIOSHint(true), 3500)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBip)
      window.removeEventListener('appinstalled', onInstalled)
      if (iosTimer) clearTimeout(iosTimer)
    }
  }, [])

  const persistDismiss = useCallback(() => {
    setDismissed(true)
    setDeferred(null)
    setShowIOSHint(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
  }, [])

  const onInstallClick = useCallback(async () => {
    if (!deferred) return
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    setDeferred(null)
    if (outcome === 'accepted') persistDismiss()
  }, [deferred, persistDismiss])

  if (dismissed) return null

  const showChromiumInstall = deferred != null
  const showBanner = showChromiumInstall || showIOSHint
  if (!showBanner) return null

  return (
    <div
      role="region"
      aria-label="Install app"
      className={cn(
        'fixed inset-x-0 bottom-0 z-[100]',
        'px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-3',
      )}
    >
      <div
        className={cn('mx-auto w-full max-w-lg', 'animate-in fade-in slide-in-from-bottom-2 duration-200')}
      >
        <div
          className={cn(
            'rounded-2xl p-px',
            'bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-sky-500/30',
            'shadow-[0_18px_60px_rgba(15,23,42,0.18)] dark:shadow-[0_18px_70px_rgba(0,0,0,0.55)]',
          )}
        >
          <div
            className={cn(
              'flex items-center gap-3 rounded-[calc(1rem-1px)] border border-border/60',
              'bg-card/90 px-4 py-3',
              'supports-[backdrop-filter]:backdrop-blur-md',
            )}
          >
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl',
                'bg-background shadow-sm ring-1 ring-border/60',
              )}
              aria-hidden
            >
              <img
                src="/imgs/braze-icon-black.svg"
                alt=""
                className="h-7 w-7 object-contain dark:hidden"
                width={28}
                height={28}
              />
              <img
                src="/imgs/braze-icon-white.svg"
                alt=""
                className="hidden h-7 w-7 object-contain dark:block"
                width={28}
                height={28}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-foreground">
                {showChromiumInstall ? 'Install Braze Liquid Editor' : 'Add to your Home Screen'}
              </p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground sm:text-[13px]">
                {showChromiumInstall
                  ? 'Quick access, focused window, and offline use of cached assets.'
                  : 'Tap Share, then Add to Home Screen to install this app like a native experience.'}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {showChromiumInstall ? (
                <Button
                  type="button"
                  size="sm"
                  className="touch-manipulation rounded-full px-5"
                  onClick={onInstallClick}
                >
                  Install
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="touch-manipulation rounded-full px-5"
                  onClick={persistDismiss}
                >
                  Got it
                </Button>
              )}
              <button
                type="button"
                onClick={persistDismiss}
                aria-label="Dismiss install prompt"
                className={cn(
                  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  'text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                  'touch-manipulation active:scale-[0.98]',
                )}
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
