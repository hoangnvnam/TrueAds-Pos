export const checkRole = (deep = 3, authChild: any) => {
  let b = false;
  try {
    if (!authChild) return false;
    const currentUser: any = authChild;

    const roles3 = ['administrator', 'owner', 'manager'];
    const roles2 = ['administrator', 'owner'];

    if (
      deep === 3 &&
      Array.isArray(currentUser?.roles) &&
      currentUser.roles.some((role: string) => roles3.includes(role))
    ) {
      b = true;
    } else if (
      deep === 2 &&
      Array.isArray(currentUser?.roles) &&
      currentUser.roles.some((role: string) => roles2.includes(role))
    ) {
      b = true;
    } else if (
      deep === 4 &&
      ((Array.isArray(currentUser?.roles) && currentUser.roles.some((role: string) => roles3.includes(role))) ||
        parseInt(currentUser?.lvUser) < 5)
    ) {
      b = true;
    }
  } catch (error) {
    setTimeout(() => {
      checkRole(deep, authChild);
    }, 500);
  }
  return b;
};
