import { Card } from '@/components/Card'
import { FadeIn } from '@/components/FadeIn'
import type { Settings } from '@/lib/types'

interface AboutProps {
  settings: Settings
}

export function About({ settings }: AboutProps) {
  if (!settings.about && !settings.years_experience && !settings.projects_done) {
    return null
  }

  return (
    <FadeIn>
      <Card id="about">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-heading-light dark:text-heading-dark tracking-tight mb-6">
          About
        </h2>
        <p className="text-body-light dark:text-body-dark text-base leading-[1.7] max-w-3xl mb-8">
          {settings.about}
        </p>

        {(settings.years_experience || settings.projects_done) && (
          <div className="flex gap-12">
            {settings.years_experience && (
              <div>
                <p className="text-3xl md:text-4xl font-light text-heading-light dark:text-heading-dark tracking-tight">
                  {settings.years_experience}+
                </p>
                <p className="text-sm text-body-light dark:text-body-dark mt-1">Years Experience</p>
              </div>
            )}
            {settings.projects_done && (
              <div>
                <p className="text-3xl md:text-4xl font-light text-heading-light dark:text-heading-dark tracking-tight">
                  {settings.projects_done}+
                </p>
                <p className="text-sm text-body-light dark:text-body-dark mt-1">Projects Done</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </FadeIn>
  )
}
