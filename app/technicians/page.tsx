"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { technicians } from "@/lib/solar-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Phone,
  Mail,
  MapPin,
  Star,
  Search,
  Navigation,
  Clock,
  Shield,
} from "lucide-react"

export default function TechniciansPage() {
  const [search, setSearch] = useState("")

  const filteredTechs = technicians.filter((t) => {
    const q = search.toLowerCase()
    return (
      t.name.toLowerCase().includes(q) ||
      t.specialisation.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q)
    )
  })

  return (
    <AppShell>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Nearby Technicians
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Certified solar technicians available for on-site service
          </p>
        </div>

        {/* Info bar */}
        <div className="flex flex-wrap gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>All technicians are <strong className="text-foreground">certified</strong> and insured</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>Average response time: <strong className="text-foreground">45 minutes</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" />
            <span>Emergency hotline: <strong className="text-foreground">+91 1800 123 4567</strong></span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, specialisation, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Technician cards */}
        {filteredTechs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">
              No technicians found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTechs.map((tech) => (
              <div
                key={tech.id}
                className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {tech.photo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {tech.name}
                      </h3>
                      {tech.available ? (
                        <Badge variant="secondary" className="bg-success/15 text-success text-[10px]">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px]">
                          Busy
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-primary font-medium mt-0.5">
                      {tech.specialisation}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{tech.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Navigation className="h-3.5 w-3.5 shrink-0" />
                    <span>{tech.distance} away</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 shrink-0 text-warning" />
                    <span className="text-foreground font-medium">{tech.rating}</span>
                    <span>/ 5.0 rating</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    asChild
                  >
                    <a href={`tel:${tech.phone.replace(/\s/g, "")}`}>
                      <Phone className="mr-1.5 h-3.5 w-3.5" />
                      Call
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-border text-muted-foreground hover:text-foreground"
                    asChild
                  >
                    <a href={`mailto:${tech.email}`}>
                      <Mail className="mr-1.5 h-3.5 w-3.5" />
                      Email
                    </a>
                  </Button>
                </div>

                <div className="mt-3 rounded-lg bg-secondary/50 p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">
                    <Phone className="mr-1 inline h-2.5 w-2.5" />
                    {tech.phone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Emergency */}
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-destructive">
                Emergency? Need Immediate Help?
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                For surge damage, overheating, or fire hazards, call our 24/7 emergency line immediately.
              </p>
            </div>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shrink-0"
              asChild
            >
              <a href="tel:+911800123456">
                <Phone className="mr-1.5 h-4 w-4" />
                Emergency: +91 1800 123 4567
              </a>
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
