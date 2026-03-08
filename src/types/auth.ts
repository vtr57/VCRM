export type MembershipRole = "owner" | "admin" | "manager" | "sales";

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  plan: string;
  timezone: string;
  currency: string;
  is_active: boolean;
}

export interface MembershipSummary {
  id: string;
  role: MembershipRole;
  is_default: boolean;
  is_active: boolean;
  joined_at: string;
  organization: OrganizationSummary;
}

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  date_joined: string;
  memberships: MembershipSummary[];
  current_membership: MembershipSummary | null;
}

export interface AuthSessionResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface AuthMeResponse {
  user: AuthUser;
  organization: OrganizationSummary;
}

export interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: MembershipRole;
}
