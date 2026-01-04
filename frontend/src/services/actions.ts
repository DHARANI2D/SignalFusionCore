"use server";

import { revalidatePath } from "next/cache";
import { getApiUrl } from "@/lib/api";

export async function updateAlertStatus(alertId: string, status: string, user: string = "Analyst") {
    const res = await fetch(`${getApiUrl()}/api/alerts/${alertId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, user }),
    });

    if (!res.ok) throw new Error("Failed to update status");

    revalidatePath(`/alerts/${alertId}`);
    revalidatePath("/");
}

export async function addAlertNote(alertId: string, content: string, user: string) {
    const res = await fetch(`${getApiUrl()}/api/alerts/${alertId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, user }),
    });

    if (!res.ok) throw new Error("Failed to add note");

    revalidatePath(`/alerts/${alertId}`);
}
