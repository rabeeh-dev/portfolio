import { Card } from '@/components/Card'
import { FadeIn } from '@/components/FadeIn'
import type { Settings } from '@/lib/types'

interface HeroProps {
  settings: Settings
}

export function Hero({ settings }: HeroProps) {
  return (
    <div className="space-y-3">
      <FadeIn>
        <Card>
          <div className="flex items-center gap-4 mb-6">
            {settings.avatar_url ? (
              <img
                src={settings.avatar_url}
                alt={settings.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-page-light dark:bg-page-dark flex items-center justify-center">
                <span className="text-heading-light dark:text-heading-dark font-semibold">
                  {settings.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-heading-light dark:text-heading-dark font-medium text-sm">
                {settings.name}
              </h2>
              <p className="text-body-light dark:text-body-dark text-sm">{settings.role}</p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-light text-heading-light dark:text-heading-dark tracking-tight leading-[1.1] mb-6 break-words">
            Hi, I'm {settings.name}:
            <br />
            <span>{settings.role}</span>
          </h1>

          <p className="text-body-light dark:text-body-dark text-base leading-relaxed max-w-2xl">
            {settings.intro}
          </p>
        </Card>
      </FadeIn>

      <FadeIn>
        <div className="relative rounded-card overflow-hidden">
          {settings.hero_image_url ? (
            <img
              src={settings.hero_image_url}
              alt="Hero"
              className="w-full h-[300px] md:h-[500px] object-cover"
            />
          ) : (
            <div className="w-full h-[300px] md:h-[500px] bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700" />
          )}
          <div className="notch-tag">{settings.name}</div>
        </div>
      </FadeIn>
    </div>
  )
}
