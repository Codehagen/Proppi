"use client";

import {
  IconLayoutGrid,
  IconPlus,
  IconSparkles,
  IconTable,
} from "@tabler/icons-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";
import { EmptyProjects } from "@/components/dashboard/empty-projects";
import { ProjectsGrid } from "@/components/dashboard/projects-grid";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { NewProjectDialog } from "@/components/projects/new-project-dialog";
import { DataTable } from "@/components/tables/properties/data-table";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "table";

function ViewToggle({
  view,
  onViewChange,
}: {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}) {
  return (
    <div className="flex items-center rounded-lg bg-muted/50 p-1 ring-1 ring-foreground/5">
      <button
        aria-label="Grid view"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200",
          view === "grid"
            ? "bg-background shadow-sm ring-1 ring-foreground/5"
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => onViewChange("grid")}
      >
        <IconLayoutGrid
          className="h-4 w-4"
          style={{ color: view === "grid" ? "var(--accent-teal)" : undefined }}
        />
      </button>
      <button
        aria-label="Table view"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200",
          view === "table"
            ? "bg-background shadow-sm ring-1 ring-foreground/5"
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => onViewChange("table")}
      >
        <IconTable
          className="h-4 w-4"
          style={{ color: view === "table" ? "var(--accent-teal)" : undefined }}
        />
      </button>
    </div>
  );
}

interface DashboardContentProps {
  projects: Project[];
  stats: {
    totalProjects: number;
    completedProjects: number;
    processingProjects: number;
    totalImages: number;
  };
}

export function DashboardContent({ projects, stats }: DashboardContentProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(["grid", "table"] as const).withDefault("grid")
  );

  const hasProjects = projects.length > 0;

  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      {/* Page header with icon badge */}
      <div className="animate-fade-in-up space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ring-1 ring-white/10"
              style={{ backgroundColor: "var(--accent-teal)" }}
            >
              <IconSparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-2xl tracking-tight">Projects</h1>
              <p className="text-muted-foreground text-sm">
                Transform your real estate photos with AI
              </p>
            </div>
          </div>

          {/* Actions: View Toggle + New Project */}
          {hasProjects && (
            <div className="flex items-center gap-3">
              <ViewToggle onViewChange={setView} view={view} />
              <Button
                className="gap-2 shadow-sm"
                onClick={() => setDialogOpen(true)}
                style={{ backgroundColor: "var(--accent-teal)" }}
              >
                <IconPlus className="h-4 w-4" />
                <span className="hidden sm:inline">New Project</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {hasProjects ? (
        <>
          {/* Stats bar */}
          <StatsBar
            activeProperties={stats.completedProjects}
            totalEdits={stats.totalImages}
            totalProperties={stats.totalProjects}
          />

          {/* Content based on view mode */}
          <div className="stagger-3 animate-fade-in-up">
            {view === "grid" ? (
              <ProjectsGrid projects={projects} />
            ) : (
              <DataTable />
            )}
          </div>
        </>
      ) : (
        /* Empty state */
        <EmptyProjects onCreateClick={() => setDialogOpen(true)} />
      )}

      {/* New Project Dialog */}
      <NewProjectDialog onOpenChange={setDialogOpen} open={dialogOpen} />
    </div>
  );
}
