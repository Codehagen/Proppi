"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { ProjectCard } from "@/components/dashboard/project-card"
import type { Project } from "@/lib/db/schema"

interface ProjectsGridProps {
  projects: Project[]
  className?: string
}

export function ProjectsGrid({ projects, className }: ProjectsGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          className="animate-fade-in-up"
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: "backwards",
          }}
        />
      ))}
    </div>
  )
}
