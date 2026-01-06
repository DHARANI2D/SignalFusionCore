export const getApiUrl = () => {
    // 1. Server-side fetching (Inside Docker Network or Local Dev)
    if (typeof window === 'undefined') {
        // Check if we're in Docker (backend service exists) or local dev
        // In local dev, use localhost; in Docker, use service name
        return process.env.API_URL || "http://localhost:8001";
    }

    // 2. Client-side fetching (In Browser)
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    return "http://localhost:8001";
};
