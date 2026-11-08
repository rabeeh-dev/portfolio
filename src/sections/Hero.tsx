import { Card } from '@/components/Card'
import { FadeIn } from '@/components/FadeIn'
import type { Settings } from '@/lib/types'

interface HeroProps {
  settings: Settings
}

export function Hero({ settings }: HeroProps) {
  const hasProfile = Boolean(settings.name || settings.role || settings.avatar_url)
  const hasHeading = Boolean(settings.name || settings.role)

  return (
    <div className="space-y-3">
      <FadeIn>
        <Card>
          {hasProfile && (
            <div className="flex items-center gap-4 mb-6">
              {settings.avatar_url ? (
                <img
                  src={settings.avatar_url}
                  alt={settings.name || 'Avatar'}
                  loading="eager"
                  decoding="async"
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : settings.name ? (
                <div className="w-12 h-12 rounded-full bg-page-light dark:bg-page-dark flex items-center justify-center">
                  <span className="text-heading-light dark:text-heading-dark font-semibold">
                    {settings.name.charAt(0)}
                  </span>
                </div>
              ) : null}
              {(settings.name || settings.role) && (
                <div>
                  {settings.name && (
                    <h2 className="text-heading-light dark:text-heading-dark font-medium text-sm">
                      {settings.name}
                    </h2>
                  )}
                  {settings.role && (
                    <p className="text-body-light dark:text-body-dark text-sm">{settings.role}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {hasHeading && (
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-light text-heading-light dark:text-heading-dark tracking-tight leading-[1.1] mb-6 break-words">
              {settings.name && <>Hi, I'm {settings.name}:</>}
              {settings.role && (
                <>
                  {settings.name && <br />}
                  <span>{settings.role}</span>
                </>
              )}
            </h1>
          )}

          {settings.intro && (
            <p className="text-body-light dark:text-body-dark text-base leading-relaxed max-w-2xl">
              {settings.intro}
            </p>
          )}
        </Card>
      </FadeIn>

      {settings.hero_image_url && (
        <FadeIn>
          <div className="relative rounded-card overflow-hidden bg-card-light dark:bg-card-dark">
            <img
              src={settings.hero_image_url}
              alt={settings.name || 'Hero'}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="w-full h-[380px] sm:h-[480px] md:h-[600px] lg:h-[660px] object-cover"
            />
            {settings.name && <div className="notch-tag">{settings.name}</div>}
          </div>
        </FadeIn>
      )}
    </div>
  )
}
