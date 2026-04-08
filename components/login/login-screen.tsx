import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { MinifluxClient } from "@/api/miniflux";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { saveCredentials } from "@/lib/credentials";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedTextInput } from "@/components/ui/themed-text-input";

const loginSchema = z.object({
  baseUrl: z.url("Must be a valid URL").min(1, "Server URL is required"),
  token: z.string().trim().min(1, "API token is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

type LoginScreenProps = {
  onLogin: (baseUrl: string, token: string) => void;
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { baseUrl: "", token: "" },
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);

    const baseUrl = data.baseUrl.replace(/\/+$/, "");
    const { token } = data;

    try {
      const testClient = new MinifluxClient({ baseUrl, token });
      await testClient.getCurrentUser();
      await saveCredentials(baseUrl, token);
      onLogin(baseUrl, token);
    } catch (e) {
      if (e instanceof Error && "status" in e) {
        const status = (e as { status: number }).status;
        if (status === 401) {
          setError("token", { message: "Invalid API token." });
        } else if (status === 0) {
          setError("baseUrl", {
            message: "Could not reach the server. Check the URL.",
          });
        } else {
          setServerError(`Server returned an error (HTTP ${status}).`);
        }
      } else {
        setServerError("Could not connect. Check the URL and try again.");
      }
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.surface }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Digest</ThemedText>
          <ThemedText
            style={[styles.subtitle, { color: theme.onSurfaceVariant }]}
          >
            Connect to your Miniflux instance
          </ThemedText>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="baseUrl"
            render={({ field: { onChange, onBlur, value } }) => (
              <ThemedTextInput
                label="Server URL"
                error={errors.baseUrl?.message}
                placeholder="https://rss.example.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                textContentType="URL"
                returnKeyType="next"
                editable={!isSubmitting}
              />
            )}
          />

          <Controller
            control={control}
            name="token"
            render={({ field: { onChange, onBlur, value } }) => (
              <ThemedTextInput
                label="API Token"
                error={errors.token?.message}
                placeholder="Your Miniflux API token"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                returnKeyType="go"
                onSubmitEditing={handleSubmit(onSubmit)}
                editable={!isSubmitting}
              />
            )}
          />

          {serverError && (
            <ThemedText style={[styles.error, { color: theme.error }]}>
              {serverError}
            </ThemedText>
          )}

          <ThemedButton
            title="Connect"
            loading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
          />
        </View>

        <ThemedText
          type="caption"
          style={[styles.hint, { color: theme.onSurfaceVariant }]}
        >
          You can find your API token in Miniflux under Settings &gt; API Keys.
        </ThemedText>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 40,
  },
  header: {
    gap: 8,
  },
  subtitle: {
    fontSize: 17,
    fontFamily: Fonts.families.manrope,
  },
  form: {
    gap: 20,
  },
  error: {
    fontSize: 14,
    fontFamily: Fonts.families.manrope,
  },
  button: {
    marginTop: 4,
  },
  hint: {
    textAlign: "center",
  },
});
