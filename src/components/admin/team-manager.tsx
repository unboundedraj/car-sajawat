"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2, User } from "lucide-react";
import { deleteTeamMember, saveTeamMember } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { TeamInput } from "@/lib/schemas";
import type { TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Drawer, IconButton, MediaField, NumberInput, TextArea, TextInput, Toggle } from "./fields";
import { confirmDelete, useAdminAction } from "./use-action";

export function TeamManager({ team }: { team: TeamMember[] }) {
  const [editing, setEditing] = useState<TeamInput | null>(null);
  const { pending, run } = useAdminAction();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing({ name: "", role: "", bio: "", photo_url: "", is_active: true, sort_order: team.length })}>
          <Plus className="size-4" /> Add member
        </Button>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {team.map((m) => (
          <li key={m.id} className={cn("card flex items-center gap-4 p-3", !m.is_active && "opacity-60")}>
            <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-2 text-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {m.photo_url ? <img src={m.photo_url} alt="" className="absolute inset-0 size-full object-cover" /> : <User className="size-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{m.name}</p>
              <p className="truncate text-xs text-muted">{m.role}</p>
            </div>
            <IconButton label="Edit" onClick={() => setEditing({ ...m, bio: m.bio ?? "", photo_url: m.photo_url ?? "" })}>
              <Pencil className="size-4" />
            </IconButton>
            <IconButton label="Delete" tone="danger" disabled={pending} onClick={() => confirmDelete(m.name) && run(() => deleteTeamMember(m.id), "Removed")}>
              <Trash2 className="size-4" />
            </IconButton>
          </li>
        ))}
        {team.length === 0 && <li className="card col-span-full p-10 text-center text-sm text-muted">No team members yet.</li>}
      </ul>

      <Drawer
        open={!!editing}
        title={editing?.id ? "Edit member" : "New member"}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" disabled={pending} onClick={() => editing && run(() => saveTeamMember(editing), "Saved", () => setEditing(null))}>
              {pending && <Loader2 className="size-4 animate-spin" />} Save
            </Button>
          </>
        }
      >
        {editing && (
          <>
            <TextInput label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            <TextInput label="Role" value={editing.role} onChange={(v) => setEditing({ ...editing, role: v })} placeholder="PPF Specialist" />
            <TextArea label="Short bio" rows={3} value={editing.bio} onChange={(v) => setEditing({ ...editing, bio: v })} />
            <MediaField label="Photo" folder="team" value={editing.photo_url} onChange={(v) => setEditing({ ...editing, photo_url: v })} hint="Portrait (4:5) works best." />
            <Toggle label="Visible on website" checked={editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} />
            <NumberInput label="Display order" value={editing.sort_order} onChange={(v) => setEditing({ ...editing, sort_order: v })} />
          </>
        )}
      </Drawer>
    </div>
  );
}
