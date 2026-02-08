-- Add owner_plan to invitations for branding gate (free = show "Powered by", premium = no branding)
alter table invitations
  add column if not exists owner_plan text default 'free';
