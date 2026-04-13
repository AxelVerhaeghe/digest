import { useMutation, useQuery } from "@tanstack/react-query";

import { logout } from "@/lib/logout";
import { getCredentials, saveCredentials } from "@/lib/credentials";
import { queryClient } from "@/lib/query-client";

type CredentialsInput = {
  baseUrl: string;
  token: string;
};

const CREDENTIALS_QUERYKEY = ["auth", "credentials"];

export function useSaveCredentialsMutation() {
  return useMutation({
    mutationFn: async ({ baseUrl, token }: CredentialsInput) => {
      await saveCredentials(baseUrl, token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CREDENTIALS_QUERYKEY,
      });
    },
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });
}

export function useCredentials() {
  return useQuery({
    queryKey: CREDENTIALS_QUERYKEY,
    queryFn: getCredentials,
  });
}
