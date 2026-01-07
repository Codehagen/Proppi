"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import {
  IconEdit,
  IconLoader2,
  IconCheck,
  IconShieldCheck,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { UserRole, AdminUserDetail } from "@/lib/types/admin";
import {
  updateUserRoleAction,
  toggleSystemAdminAction,
  deleteUserAction,
} from "@/lib/actions/admin";

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
  const [role, setRole] = useState<UserRole>(user.role);
  const [isSystemAdmin, setIsSystemAdmin] = useState(user.isSystemAdmin);

  // Reset form when user changes
  React.useEffect(() => {
    setRole(user.role);
    setIsSystemAdmin(user.isSystemAdmin);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        // Track what changed
        const roleChanged = role !== user.role;
        const adminChanged = isSystemAdmin !== user.isSystemAdmin;

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
      setRole(user.role);
      setIsSystemAdmin(user.isSystemAdmin);
      setSaved(false);
      onOpenChange(false);
    }
  };

  const hasChanges = role !== user.role || isSystemAdmin !== user.isSystemAdmin;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent size="default" className="overflow-hidden p-0">
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
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Success state */}
            {saved ? (
              <div className="animate-fade-in-up flex flex-col items-center gap-4 py-8 text-center">
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
                  <p className="text-lg font-semibold">User Updated!</p>
                  <p className="text-sm text-muted-foreground">
                    Changes have been saved successfully
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Role Section */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Workspace Role
                  </h4>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Role</Label>
                    <Select
                      value={role}
                      onValueChange={(value) => setRole(value as UserRole)}
                      disabled={isPending}
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
                    <p className="text-xs text-muted-foreground">
                      The user&apos;s role within their workspace. Owner has full access.
                    </p>
                  </div>
                </div>

                {/* System Admin Section */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
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
                        <p className="text-sm text-muted-foreground">
                          Grant access to the admin panel
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isSystemAdmin}
                      onCheckedChange={setIsSystemAdmin}
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-medium uppercase tracking-wider text-destructive">
                    Danger Zone
                  </h4>

                  <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <div>
                      <p className="font-medium text-destructive">Delete User</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently remove this user and all their data
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isPending}
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
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!hasChanges || isPending}
                className="min-w-[120px] gap-2"
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
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
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
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
