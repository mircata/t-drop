import type { Access } from "payload";

/* Shared access rules. `users` is the /admin login, `customers` the site login. */

export const isAdmin: Access = ({ req: { user } }) => user?.collection === "users";

export const anyone: Access = () => true;

/** Admins see everything; a customer sees only rows whose `customer` field is them. */
export const adminOrOwnCustomer: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.collection === "users") return true;
  return { customer: { equals: user.id } };
};
