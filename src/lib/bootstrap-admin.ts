import { accountErrors } from "./account-draft";

export function bootstrapAdminErrors(input: { email: string; password: string }) {
  return accountErrors(input);
}
