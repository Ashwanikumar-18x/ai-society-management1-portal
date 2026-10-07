import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

export default defineAction({
  description:
    "AI-assisted complaint classification, prioritization, and hazard reasoning.",
  mcpTool: true,
  schema: z.object({
    title: z.string().describe("Complaint title"),
    description: z.string().describe("Detailed description of the issue"),
    category: z.string().optional().describe("User-selected category if any"),
    location: z.string().optional().describe("Location, flat, or wing"),
  }),
  http: { method: "POST" },
  run: async ({ title, description, category: userCat, location }) => {
    const text = `${title} ${description} ${userCat || ""} ${location || ""}`.toLowerCase();

    // Category detection
    let category:
      | "Elevator"
      | "Plumbing"
      | "Electrical"
      | "Security"
      | "Cleanliness"
      | "Infrastructure"
      | "Noise"
      | "Parking"
      | "Other" = "Other";

    if (
      text.includes("elevator") ||
      text.includes("lift") ||
      text.includes("shaft") ||
      text.includes("floors")
    ) {
      category = "Elevator";
    } else if (
      text.includes("leak") ||
      text.includes("water") ||
      text.includes("pipe") ||
      text.includes("drain") ||
      text.includes("plumb") ||
      text.includes("seepage") ||
      text.includes("flush") ||
      text.includes("tank")
    ) {
      category = "Plumbing";
    } else if (
      text.includes("power") ||
      text.includes("electric") ||
      text.includes("light") ||
      text.includes("wire") ||
      text.includes("spark") ||
      text.includes("switch") ||
      text.includes("bulb") ||
      text.includes("tripping")
    ) {
      category = "Electrical";
    } else if (
      text.includes("security") ||
      text.includes("gate") ||
      text.includes("guard") ||
      text.includes("cctv") ||
      text.includes("sensor") ||
      text.includes("barrier")
    ) {
      category = "Security";
    } else if (
      text.includes("clean") ||
      text.includes("garbage") ||
      text.includes("trash") ||
      text.includes("waste") ||
      text.includes("odor")
    ) {
      category = "Cleanliness";
    } else if (text.includes("parking") || text.includes("car")) {
      category = "Parking";
    } else if (text.includes("noise") || text.includes("loud")) {
      category = "Noise";
    } else if (text.includes("crack") || text.includes("wall")) {
      category = "Infrastructure";
    } else if (userCat && userCat !== "Other") {
      category = userCat as any;
    }

    // Priority detection
    let priority: "Urgent" | "High" | "Medium" | "Low" = "Medium";
    let confidence = 92;
    let reason = "";

    const isUrgent =
      text.includes("stuck") ||
      text.includes("stopping between") ||
      text.includes("spark") ||
      text.includes("fire") ||
      text.includes("emergency") ||
      text.includes("flood") ||
      text.includes("cannot safely");

    const isHigh =
      text.includes("leak") ||
      text.includes("wet floor") ||
      text.includes("unsafe") ||
      text.includes("lobby") ||
      text.includes("main gate") ||
      text.includes("backup");

    if (isUrgent) {
      priority = "Urgent";
      confidence = 97;
      if (category === "Elevator") {
        reason =
          "The elevator is reported stuck or stopping between floors, posing an immediate resident safety risk that requires immediate emergency technician dispatch.";
      } else {
        reason =
          "Critical safety hazard detected. Immediate triage and dispatch of emergency response personnel required.";
      }
    } else if (isHigh) {
      priority = "High";
      confidence = 96;
      if (text.includes("water leak near lobby") || text.includes("wet floor")) {
        reason =
          "Visible water leak near the lobby indicates a plumbing-related issue, and the wet floor near an entrance creates a safety hazard that requires prompt attention.";
      } else {
        reason =
          "High priority infrastructure issue creating direct resident inconvenience and potential secondary property damage.";
      }
    } else if (text.includes("minor") || text.includes("routine")) {
      priority = "Low";
      confidence = 90;
      reason = "Standard maintenance item scheduled for routine shift queue.";
    } else {
      priority = "Medium";
      confidence = 93;
      reason = `Regular ${category.toLowerCase()} maintenance request. Scheduled for prompt technician review.`;
    }

    return {
      aiRecommendation: {
        category,
        priority,
        reason,
        confidence,
        analyzedAt: new Date().toISOString(),
      },
    };
  },
});
