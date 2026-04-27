'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TIMEZONE_OPTIONS } from '@/lib/timezone';
import { EVENT_COLOR_PALETTE, cn, slugify } from '@/lib/utils';
import type { Profile } from '@/lib/types';

type Flash = { tone: 'success' | 'error'; text: string } | null;

export function ProfileForm({ profile, flash }: { profile: Profile; flash: Flash }) {
  const router = useRouter();
  const [name, setName] = useState(profile.name ?? '');
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '');
  const [timezone, setTimezone] = useState(profile.timezone);
  const [accentColor, setAccentColor] = useState(profile.accent_color);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<Flash>(flash);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: name.trim() || null,
        username: slugify(username),
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        timezone,
        accent_color: accentColor,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setMessage({ tone: 'error', text: data?.error ?? 'Could not save.' });
      return;
    }
    setMessage({ tone: 'success', text: 'Saved.' });
    router.refresh();
  };

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <h2 className="font-heading text-lg font-semibold text-slate-900">Profile</h2>
          <p className="text-sm text-slate-500">
            Visible on your public booking page at /{username}.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name" className="mb-1.5">
              Display name
            </Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="username" className="mb-1.5">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="ada"
            />
            <p className="mt-1 font-mono text-xs text-slate-400">/{slugify(username) || 'username'}</p>
          </div>
        </div>

        <div>
          <Label htmlFor="bio" className="mb-1.5">
            Bio <span className="font-normal text-slate-400">(optional)</span>
          </Label>
          <Textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Founding engineer at … · she/her"
          />
        </div>

        <div>
          <Label htmlFor="avatar" className="mb-1.5">
            Avatar URL <span className="font-normal text-slate-400">(optional)</span>
          </Label>
          <Input
            id="avatar"
            type="url"
            value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>

        <div>
          <Label htmlFor="timezone" className="mb-1.5">
            Timezone
          </Label>
          <Select id="timezone" value={timezone} onChange={e => setTimezone(e.target.value)}>
            {[timezone, ...TIMEZONE_OPTIONS.filter(t => t !== timezone)].map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label className="mb-1.5">Accent color</Label>
          <div className="flex flex-wrap gap-2">
            {EVENT_COLOR_PALETTE.map(c => (
              <button
                key={c.value}
                type="button"
                aria-label={c.name}
                onClick={() => setAccentColor(c.value)}
                className={cn(
                  'h-8 w-8 rounded-full ring-offset-2 transition',
                  accentColor === c.value
                    ? 'ring-2 ring-slate-900'
                    : 'ring-1 ring-slate-200 hover:scale-110',
                )}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>

        {message ? <Alert tone={message.tone}>{message.text}</Alert> : null}

        <div className="flex justify-end">
          <Button type="submit" isLoading={submitting}>
            Save profile
          </Button>
        </div>
      </form>
    </Card>
  );
}
