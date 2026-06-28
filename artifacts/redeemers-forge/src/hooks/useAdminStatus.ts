import { useUser } from "@clerk/react";
import { useGetMyProfile, getGetMyProfileQueryKey } from "@workspace/api-client-react";

export function useAdminStatus() {
  const { isSignedIn, isLoaded } = useUser();

  const { data, isLoading } = useGetMyProfile({
    query: {
      queryKey: getGetMyProfileQueryKey(),
      enabled: isLoaded && isSignedIn === true,
    },
  });

  return {
    isAdmin: data?.role === "admin",
    isLoading: !isLoaded || isLoading,
    isSignedIn: isSignedIn ?? false,
  };
}
