// Exports
export { globalFilterCountries, getCountryByCode, getUniqueRegions, findCountries }

// Functions
function globalFilterCountries(countries) {
  return countries.map(country => {
    return {
      alpha3Code: country.cca3,
      name: [country.name.common, country.name.official],
      region: country.region,
      capital: country.capital || [],
      population: country.population,
      borders: (country.borders || []).map(code => getCountryByCode(code, countries)),
      currencies: Object.values(country.currencies || {}).map(currency => currency.name),
      languages: Object.values(country.languages || {})
    }
  })
}

function getCountryByCode(code, countries) {
  let countryFound = countries.find(country => country.alpha3Code === code || country.cca3 === code);
  return countryFound.name.common || countryFound.name[0];
}

function getUniqueRegions(countries) {
  return countries.map(country => country.region).filter((region, index, regions) => regions.indexOf(region) === index);
}

function findCountries(label, region, countries, sortBy) {
  label = label.trim().toLowerCase();

  let countriesFiltered = countries.filter(country => {
    return (country.name.join(", ").toLowerCase().includes(label) && country.region.includes(region)) ||
      (country.region.toLowerCase().includes(label) && country.region.includes(region)) ||
      (country.capital.join(", ").toLowerCase().includes(label) && country.region.includes(region))
  })

  countriesFiltered.sort((a, b) => {
    if (typeof a[sortBy] === "number") {
      return b[sortBy] - a[sortBy];
    }
    return a[sortBy] > b[sortBy] ? 1 : a[sortBy] < b[sortBy] ? -1 : 0;
  })

  // Да ладно! Это работает!
  return countriesFiltered;
}