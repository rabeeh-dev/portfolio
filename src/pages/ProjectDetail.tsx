import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card } from '@/components/Card'
import { Loading } from '@/components/Loading'
import { getProjectBySlug } from '@/lib/api'
import type { Project } from '@/lib/types'

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (slug) {
      getProjectBySlug(slug)
        .then(setProject)
        .finally(() => setLoading(false))
    }
  }, [slug])

  if (loading) return <Loading />
  if (!project) {
    return (
      <Card className="text-center">
        <p className="text-body-light dark:text-body-dark mb-4">Project not found.</p>
        <Link to="/" className="text-heading-light dark:text-heading-dark underline text-sm">
          ← Back home
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-3 pb-3">
      <Card>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-body-light dark:text-body-dark hover:text-heading-light dark:hover:text-heading-dark transition-colors mb-6"
        >
          ← Back
        </Link>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-heading-light dark:text-heading-dark tracking-tight mb-4">
          {project.title}
        </h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-page-light dark:bg-page-dark text-xs text-body-light dark:text-body-dark"
            >
              {tag}
            </span>
          ))}
        </div>

        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2.5 rounded-full bg-heading-light dark:bg-heading-dark text-white dark:text-page-dark text-sm font-medium hover:opacity-90 transition-opacity mb-6"
          >
            View Live ↗
          </a>
        )}
      </Card>

      {project.cover_image_url && (
        <div className="rounded-card overflow-hidden bg-card-light dark:bg-card-dark">
          <img
            src={project.cover_image_url}
            alt={project.title}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-[300px] md:h-[500px] object-cover"
          />
        </div>
      )}

      <Card>
        <p className="text-body-light dark:text-body-dark text-base leading-[1.7] max-w-3xl whitespace-pre-line">
          {project.long_description || project.short_description}
        </p>
      </Card>

      {project.gallery_images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {project.gallery_images.map((img, i) => (
            <div key={i} className="rounded-card overflow-hidden bg-card-light dark:bg-card-dark">
              <img
                src={img}
                alt={`${project.title} gallery ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="w-full h-64 object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
