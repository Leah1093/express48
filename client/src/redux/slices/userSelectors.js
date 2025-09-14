export const selectCurrentUser   = (s) => s.user.user;
export const selectIsLoadingUser = (s) => s.user.loading;
export const selectIsInitialized = (s) => s.user.initialized;
export const selectRole          = (s) => s.user.user?.role ?? "guest";

export const selectIsGuest  = (s) => selectRole(s) === "guest";
export const selectIsUser   = (s) => selectRole(s) === "user";
export const selectIsSeller = (s) => selectRole(s) === "seller";
export const selectIsAdmin  = (s) => selectRole(s) === "admin";
