import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "react-oidc-context";
import useApiClient from "./useApiClient";
import { getErrorStatus } from "../api/apiClient";

/**
 * Generates a new API key for the signed-in user and copies it to the
 * clipboard, confirming (or reporting failure) with a toast.
 */
const useApiKeyCopy = () => {
    const auth = useAuth();
    const api = useApiClient();
    const [isGenerating, setIsGenerating] = useState(false);

    const generateAndCopy = async () => {
        if (!auth.user?.access_token) return;
        setIsGenerating(true);
        try {
            const response = await api.post<{ key: string }>(
                "/auth/generate-api-key/",
            );
            try {
                await navigator.clipboard.writeText(response.data.key);
            } catch {
                toast.error("Failed to copy token. Please try again.");
                return;
            }
            toast.success("API token copied to clipboard");
        } catch (err) {
            toast.error("Failed to generate API key. Please try again.");
            // An invalid token is rejected with 403: sign the user out.
            if (getErrorStatus(err) === 403) {
                await auth.removeUser();
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return { isGenerating, generateAndCopy };
};

export default useApiKeyCopy;
