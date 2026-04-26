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
        'fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-card shadow-[0_-8px_30px_rgba(15,23,42,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.45)]',
        'supports-[backdrop-filter]:bg-card/90 supports-[backdrop-filter]:backdrop-blur-md',
      )}
    >
      {/* Single row: no extra column layout so the dismiss control stays vertically centered (no stray bottom gap). */}
      <div
        className={cn(
          'mx-auto flex max-w-3xl items-center gap-3 px-4 py-3',
          'pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-3',
        )}
      >
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-sm"
          aria-hidden
        >
          <img
            src="/imgs/braze-icon-black.svg"
            alt=""
            className="h-8 w-8 object-contain dark:hidden"
            width={32}
            height={32}
          />
          <img
            src="/imgs/braze-icon-white.svg"
            alt=""
            className="hidden h-8 w-8 object-contain dark:block"
            width={32}
            height={32}
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
            <Button type="button" size="sm" className="touch-manipulation px-4" onClick={onInstallClick}>
              Install
            </Button>
          ) : null}
          <button
            type="button"
            onClick={persistDismiss}
            aria-label="Dismiss install prompt"
            className={cn(
              'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              'text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              'touch-manipulation active:scale-[0.98]',
            )}
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
