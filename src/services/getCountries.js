export const getCountries = async () => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }
    
    const data = await response.json();
    
    return data
      .map(country => ({
        name: country.name.common,
        code: country.cca2
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};
