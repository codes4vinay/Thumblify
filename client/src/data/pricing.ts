import type { IPricing } from "../types";

export const pricingData: IPricing[] = [
    {
        name: "Basic",
        price: 29,
        period: "month",
        features: [
            "100 AI thumbnails/month",
            "Ready-made templates",
            "Text-based prompts",
            "HD exports",
            "Basic editing tools"
        ],
        mostPopular: false
    },
    {
        name: "Pro",
        price: 79,
        period: "month",
        features: [
            "500 AI thumbnails/month",
            "Advanced prompts",
            "Custom styles & branding",
            "Full HD exports",
            "Fast rendering",
            "Commercial use"
        ],
        mostPopular: true
    },
    {
        name: "Enterprise",
        price: 199,
        period: "month",
        features: [
            "Unlimited thumbnails",
            "Custom AI models",
            "Team access",
            "Ultra HD exports",
            "API integration"
        ],
        mostPopular: false
    }
];
