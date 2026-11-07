import { useEffect, useState } from 'react'
import { Card } from '@/components/Card'
import { FadeIn } from '@/components/FadeIn'
import { Loading } from '@/components/Loading'
import { Empty } from '@/components/Empty'
import { getServices } from '@/lib/api'
import type { Service } from '@/lib/types'

export function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getServices()
      .then(setServices)
      .finally(() => setLoading(false))
  }, [])

  return (
    <FadeIn>
      <Card id="services">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-heading-light dark:text-heading-dark tracking-tight mb-8">
          Services
        </h2>

        {loading ? (
          <Loading />
        ) : services.length === 0 ? (
          <Empty message="No services listed yet." />
        ) : (
          <div className="space-y-6">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="flex gap-6 items-start pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
              >
                <span className="text-3xl md:text-4xl font-light text-heading-light/20 dark:text-heading-dark/20 tracking-tight min-w-[50px]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-lg font-medium text-heading-light dark:text-heading-dark mb-2">
                    {service.title}
                  </h3>
                  <p className="text-body-light dark:text-body-dark text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </FadeIn>
  )
}
