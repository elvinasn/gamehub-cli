import { Member } from "./member";

export interface Organisation {
  id: string;
  name: string;
  members: Member[];
}
