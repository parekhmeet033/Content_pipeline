import {
  LayoutDashboard,
  Sparkles,
  Library,
  User,
  Settings,
} from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/generate', label: 'Content Generator', icon: Sparkles },
  { to: '/content', label: 'Content Library', icon: Library },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];
