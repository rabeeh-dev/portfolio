import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/Card'
import { FadeIn } from '@/components/FadeIn'
import { Loading } from '@/components/Loading'
import { Empty } from '@/components/Empty'
import { getProjects } from '@/lib/api'
import type { Project } from '@/lib/types'

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .finally(() => setLoading(false))
  }, [])

  return (
    <FadeIn>
      <Card id="projects">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-heading-light dark:text-heading-dark tracking-tight mb-8">
          Selected Projects
        </h2>

        {loading ? (
          <Loading />
        ) : projects.length === 0 ? (
          <Empty message="No projects yet." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.slug}`}
                className="group block"
              >
                <div className="rounded-card overflow-hidden mb-4">
                  {project.cover_image_url ? (
                    <img
                      src={project.cover_image_url}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-48 md:h-56 bg-page-light dark:bg-page-dark" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-heading-light dark:text-heading-dark mb-1 group-hover:opacity-70 transition-opacity">
                  {project.title}
                </h3>
                <p className="text-sm text-body-light dark:text-body-dark mb-3 line-clamp-2">
                  {project.short_description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-page-light dark:bg-page-dark text-xs text-body-light dark:text-body-dark"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </FadeIn>
  )
}
