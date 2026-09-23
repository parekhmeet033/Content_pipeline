import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as userService from '../api/userService';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import TextArea from '../components/common/TextArea';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';

export default function ProfilePage() {
  const { user, updateUserLocal, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    jobTitle: user?.jobTitle || '',
    company: user?.company || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [deleteOpen, setDeleteOpen] = useState(false);

  const profileMutation = useMutation({
    mutationFn: () => userService.updateProfile(profile),
    onSuccess: (updated) => {
      updateUserLocal(updated);
      toast.success('Profile updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: () => userService.changePassword(passwordForm),
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not change password'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: async () => {
      toast.success('Account deleted');
      await logout();
      navigate('/');
    },
  });

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Profile</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your personal information.</p>
      </div>

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-4">
          <Avatar src={profile.avatarUrl} firstName={profile.firstName} lastName={profile.lastName} size="lg" />
          <div className="flex-1">
            <Input
              label="Avatar URL"
              placeholder="https://..."
              value={profile.avatarUrl}
              onChange={(e) => setProfile((p) => ({ ...p, avatarUrl: e.target.value }))}
            />
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            profileMutation.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First name" required value={profile.firstName} onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))} />
            <Input label="Last name" required value={profile.lastName} onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))} />
            <Input label="Job title" value={profile.jobTitle} onChange={(e) => setProfile((p) => ({ ...p, jobTitle: e.target.value }))} />
            <Input label="Company" value={profile.company} onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))} />
          </div>
          <TextArea label="Bio" rows={3} value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} />
          <div className="flex justify-end">
            <Button type="submit" loading={profileMutation.isPending}>
              Save profile
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Change password</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            passwordMutation.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Current password"
            type="password"
            required
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
          />
          <Input
            label="New password"
            type="password"
            required
            hint="At least 8 characters"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={passwordMutation.isPending}>
              Update password
            </Button>
          </div>
        </form>
      </Card>

      <Card className="border-rose-200 p-6 dark:border-rose-900/50">
        <h3 className="mb-1 text-sm font-semibold text-rose-700 dark:text-rose-400">Danger zone</h3>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Permanently delete your account and all of your content. This cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          Delete account
        </Button>
      </Card>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete your account?">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This will permanently delete your account, content, and analytics. This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
            Delete my account
          </Button>
        </div>
      </Modal>
    </div>
  );
}
