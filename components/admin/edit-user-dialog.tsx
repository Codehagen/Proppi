"use client";

import {
  IconCheck,
  IconEdit,
  IconLoader2,
  IconShieldCheck,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  deleteUserAction,
  toggleSystemAdminAction,
  updateUserNameAction,
  updateUserRoleAction,
} from "@/lib/actions/admin";
import type { AdminUserDetail, UserRole } from "@/lib/types/admin";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUserDetail["user"];
  onSuccess?: () => void;
}

const roleOptions: { value: UserRole; label: string; color: string }[] = [
  { value: "owner", label: "Owner", color: "var(--accent-amber)" },
  { value: "admin", label: "Admin", color: "var(--accent-violet)" },
  { value: "member", label: "Member", color: "var(--accent-teal)" },
];

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditUserDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<UserRole>(user.role);
  const [isSystemAdmin, setIsSystemAdmin] = useState(user.isSystemAdmin);

  // Reset form when user changes
  React.useEffect(() => {
    setName(user.name);
    setRole(user.role);
    setIsSystemAdmin(user.isSystemAdmin);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        // Track what changed
        const nameChanged = name !== user.name;
        const roleChanged = role !== user.role;
        const adminChanged = isSystemAdmin !== user.isSystemAdmin;

        // Update name if changed
        if (nameChanged) {
          const result = await updateUserNameAction(user.id, name);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
        }

        // Update role if changed
        if (roleChanged) {
          const result = await updateUserRoleAction(user.id, role);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
        }

        // Update system admin if changed
        if (adminChanged) {
          const result = await toggleSystemAdminAction(user.id, isSystemAdmin);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
        }

        setSaved(true);
        toast.success("User updated successfully");

        // Close after showing success
        setTimeout(() => {
          setSaved(false);
          onOpenChange(false);
          onSuccess?.();
        }, 1000);
      } catch {
        toast.error("Failed to update user");
      }
    });
  };

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        const result = await deleteUserAction(user.id);
        if (!result.success) {
          toast.error(result.error);
          return;
        }

        toast.success("User deleted successfully");
        setShowDeleteConfirm(false);
        onOpenChange(false);
        router.push("/admin/users");
      } catch {
        toast.error("Failed to delete user");
      }
    });
  };

  const handleClose = () => {
    if (!isPending) {
      // Reset to original values
      setName(user.name);
      setRole(user.role);
      setIsSystemAdmin(user.isSystemAdmin);
      setSaved(false);
      onOpenChange(false);
    }
  };

  const hasChanges =
    name !== user.name ||
    role !== user.role ||
    isSystemAdmin !== user.isSystemAdmin;

  return (
    <>
      <Dialog onOpenChange={handleClose} open={open}>
        <DialogContent className="overflow-hidden p-0" size="default">
          {/* Header */}
          <div className="border-b px-6 py-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor:
                      "color-mix(in oklch, var(--accent-teal) 15%, transparent)",
                  }}
                >
                  <IconEdit
                    className="h-4 w-4"
                    style={{ color: "var(--accent-teal)" }}
                  />
                </div>
                Edit User
              </DialogTitle>
              <DialogDescription>
                Update user role and permissions for {user.name}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Content */}
          <form className="space-y-6 p-6" onSubmit={handleSubmit}>
            {/* Success state */}
            {saved ? (
              <div className="flex animate-fade-in-up flex-col items-center gap-4 py-8 text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{
                    backgroundColor:
                      "color-mix(in oklch, var(--accent-green) 15%, transparent)",
                  }}
                >
                  <IconCheck
                    className="h-8 w-8"
                    style={{ color: "var(--accent-green)" }}
                  />
                </div>
                <div>
                  <p className="font-semibold text-lg">User Updated!</p>
                  <p className="text-muted-foreground text-sm">
                    Changes have been saved successfully
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Profile Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                    Profile
                  </h4>

                  <div className="space-y-2">
                    <Label className="font-medium text-sm">Name</Label>
                    <Input
                      disabled={isPending}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="User name"
                      value={name}
                    />
                  </div>
                </div>

                {/* Role Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                    Workspace Role
                  </h4>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label className="font-medium text-sm">Role</Label>
                    <Select
                      disabled={isPending}
                      onValueChange={(value) => setRole(value as UserRole)}
                      value={role}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: option.color }}
                              />
                              {option.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-xs">
                      The user&apos;s role within their workspace. Owner has
                      full access.
                    </p>
                  </div>
                </div>

                {/* System Admin Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                    System Permissions
                  </h4>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: isSystemAdmin
                            ? "color-mix(in oklch, var(--accent-green) 15%, transparent)"
                            : "color-mix(in oklch, var(--muted-foreground) 10%, transparent)",
                        }}
                      >
                        <IconShieldCheck
                          className="h-5 w-5"
                          style={{
                            color: isSystemAdmin
                              ? "var(--accent-green)"
                              : "var(--muted-foreground)",
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">System Administrator</p>
                        <p className="text-muted-foreground text-sm">
                          Grant access to the admin panel
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isSystemAdmin}
                      disabled={isPending}
                      onCheckedChange={setIsSystemAdmin}
                    />
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="space-y-4">
                  <h4 className="font-medium text-[11px] text-destructive uppercase tracking-wider">
                    Danger Zone
                  </h4>

                  <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <div>
                      <p className="font-medium text-destructive">
                        Delete User
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Permanently remove this user and all their data
                      </p>
                    </div>
                    <Button
                      disabled={isPending}
                      onClick={() => setShowDeleteConfirm(true)}
                      size="sm"
                      type="button"
                      variant="destructive"
                    >
                      <IconTrash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </>
            )}
          </form>

          {/* Footer */}
          {!saved && (
            <div className="flex items-center justify-end gap-3 border-t bg-muted/30 px-6 py-4">
              <Button
                disabled={isPending}
                onClick={handleClose}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="min-w-[120px] gap-2"
                disabled={!hasChanges || isPending}
                onClick={handleSubmit}
                style={{ backgroundColor: "var(--accent-teal)" }}
              >
                {isPending ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <IconCheck className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog onOpenChange={setShowDeleteConfirm} open={showDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{user.name}</strong>? This
              action cannot be undone. All of their data including projects and
              videos will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <IconTrash className="mr-2 h-4 w-4" />
                  Delete User
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
