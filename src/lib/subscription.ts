export function isUserActive(
  profile?: { subscription_status?: string; trial_ends_at?: string | null } | null
): boolean {
  if (!profile) return false;
  if (profile.subscription_status === 'active') return true;
  if (profile.subscription_status === 'trialing' && profile.trial_ends_at) {
    return new Date() < new Date(profile.trial_ends_at);
  }
  return false;
}
