/**
 * MCT Service - Stubbed service for interacting with MCT API
 * This is a placeholder service that will eventually make real API calls
 */

/**
 * Get the price per dose for a drug
 * @param drugName - The name of the drug
 * @param dosage - The dosage information
 * @returns The price per dose as a number
 */
async function getDrugPricePerDose(drugName: string, dosage: string): Promise<number> {
	// For now, return a random price between $0.50 and $10.00
	// In the future, this will make a real API call to MCT
	console.log('[DEBUG] Getting drug price per dose for:', drugName, dosage);
	const minPrice = 0.5;
	const maxPrice = 10.0;
	return Number((Math.random() * (maxPrice - minPrice) + minPrice).toFixed(2));
}

export default { getDrugPricePerDose };
