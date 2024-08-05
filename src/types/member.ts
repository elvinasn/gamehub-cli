import { OrganisationRole } from "./organisation-role";

export interface Member {
  id: string;
  email: string;
  imageUrl: string | null;
  fullName: string;
  roles: OrganisationRole[];
}
