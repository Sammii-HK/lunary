export const stringToCamelCase = (string: string) => {
	return string[0].toLowerCase() + string.substring(1).replace(" ", "");
};

export type CamelCaseMoonPhase =
	| "new"
	| "waxingCrescent"
	| "firstQuarter"
	| "waxingGibbous"
	| "full"
	| "waningGibbous"
	| "lastQuarter";
