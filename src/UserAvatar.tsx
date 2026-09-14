import type { User } from './api'

export function UserAvatar({ user, size = 'medium' }: { user: User; size?: 'small' | 'medium' | 'large' }) {
  const initials = user.name.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'U'
  return <span className={`user-avatar ${size}`} aria-label={`${user.name} avatar`}>
    {user.avatar_url ? <img src={user.avatar_url} alt="" referrerPolicy="no-referrer" /> : initials}
  </span>
}
