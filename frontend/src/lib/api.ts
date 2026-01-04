export const getApiUrl = () => {
    // 1. Server-side fetching (Inside Docker Network)
    if (typeof window === 'undefined') {
        // Use the internal service name 'backend'
        return "http://backend:8001";
    }

    // 2. Client-side fetching (In Browser)
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    return "http://localhost:8001";
};
