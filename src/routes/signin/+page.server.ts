import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async () => {
	const isDevelopment = process.env.NODE_ENV === "development";
	return { isDevelopment };
};
