import { useCallback, useEffect, useState } from 'react'
import { Download, Share2, X } from 'lucide-react'
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
      className={cn(
        'fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-card/95 px-3 py-3 shadow-lg backdrop-blur-md',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
      )}
      role="region"
      aria-label="Install app"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"
            aria-hidden
          >
            {showChromiumInstall ? (
              <Download className="h-5 w-5" />
            ) : (
              <Share2 className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {showChromiumInstall ? 'Install Braze Liquid Editor' : 'Add to your Home Screen'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              {showChromiumInstall
                ? 'Install this app for quick access, a focused window, and offline use of cached assets.'
                : 'Tap Share, then “Add to Home Screen” to install this PWA like a native app.'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-end">
          {showChromiumInstall ? (
            <Button type="button" size="sm" className="touch-manipulation" onClick={onInstallClick}>
              Install
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 touch-manipulation text-muted-foreground"
            onClick={persistDismiss}
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
