import { getAdmin, getPermissionDetails } from "./SessionHelper";

export const can = (perm) => {
  const isAdmin = getAdmin() == 1;

  if (isAdmin) return true;

  const permissions = getPermissionDetails() || [];
  console.log("permissions", permissions);

  return permissions.some((p) => p.name === perm);
};
