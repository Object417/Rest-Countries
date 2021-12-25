/* TO DO
  1. Разбить на модули
  2. Не дублировать код в запросе данных с сервера, а просто ждать их
  3. Доделать сортировку (Должна сбрасываться при повторном нажатии, не сбрасываеться при смене фильтра)
*/


const storage = {
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  get: key => JSON.parse(localStorage.getItem(key))
}

const btn = $(`#renderCountries`),
      spinner = $(`#renderCountries .spinner-border`),
      inputSelect = $(`#findCountryByRegion`),
      inputText = $(`#findCountryByName`)

spinner.hide()
inputSelect.prop(`disabled`, true)
inputText.prop(`disabled`, true)
$(`#countriesTable`).hide()

setListeners()
function setListeners() {
  btn.click(() => {
    toggleControls(false)
    loadCountries().then(() => {
      renderCountries()
      renderSelect()
      toggleControls(true)
      $(`#countriesTable`).show()
    })
  })
  inputSelect.change(() => {
    findCountries(inputText.val(), inputSelect.val())
    $(`#countriesTable [data-sortable]`).removeAttr(`data-sorted`)
  })
  inputText.keyup(() => {
    findCountries(inputText.val(), inputSelect.val())
    $(`#countriesTable [data-sortable]`).removeAttr(`data-sorted`)
  })
  $(`#countriesTable [data-sortable]`).click(e => {
    sortCountries(e.target.innerText)
    $(`#countriesTable [data-sortable]`).removeAttr(`data-sorted`)
    e.target.setAttribute(`data-sorted`, true)
  })
  $(`#clearStorage`).click(() => {
    if(confirm(`Are you sure? You will have to load data from the server`)) {
      localStorage.clear()
      window.location.reload()
    }
  })
}

function toggleControls(checkbox) {
  console.log(`Toggle controls ${checkbox}`)

  if(checkbox === true) {
    btn.prop(`disabled`, false)
    spinner.hide()
    inputSelect.prop(`disabled`, false)
    inputText.prop(`disabled`, false)
  } else {
    btn.prop(`disabled`, true)
    spinner.show()
    inputSelect.val(``)
    inputSelect.prop(`disabled`, true)
    inputText.val(``)
    inputText.prop(`disabled`, true)
  }
}

async function loadCountries() {
  console.log("loadCountries")

  if(!storage.get(`countries`)) {
    await fetch(`https://restcountries.com/v3.1/all`)
    .then(data => data.json())
    .then(data => globalFilterCountries(data))
  }

}

function globalFilterCountries(countries) {
  let countriesFiltered = countries.map(country => {
    return {
      alpha3Code: country.cca3,
      name: `${country.name.common}, ${country.name.official}`,
      region: country.region,
      capital: (country.capital ? country.capital : []).join(`, `),
      population: country.population,
      borders: getCountryBorders(country.borders ? country.borders : [], countries),
      currencies: Object.values(country.currencies ? country.currencies : {}).map(currency => currency.name).join(`, `),
      languages: Object.values(country.languages ? country.languages : {}).join(`, `)
    }
  })

  console.log(countriesFiltered)

  storage.set(`countries`, countriesFiltered)
}

function getCountryBorders(borders, countries) {
  return borders.map(code => (countries.find(country => country.cca3 === code.toUpperCase())).name.common).join(`, `)
}

function renderCountries(countries = storage.get(`countries`)) {
  console.log(`Render countries`)

  $(`#countriesTable tbody`).html(
    countries.reduce((acc, country, index) => {
      return acc +
      `<tr>
        <td>${index + 1}</td>
        <td>${country.name}</td>
        <td>${country.capital}</td>
        <td>${country.region}</td>
        <td>${country.population}</td>
        <td>${country.borders}</td>
        <td>${country.currencies}</td>
        <td>${country.languages}</td>
      </tr>`
    }, ``)
  )
}

function renderSelect(countries = storage.get(`countries`)) {
  let regions = countries.map(country => country.region),
      uniqueRegions = regions.filter((region, index) => regions.indexOf(region) === index);

  inputSelect.html(
    uniqueRegions.reduce((acc, region) => {
      return acc + `<option value="${region}">${region}</option>`
    }, `<option value="" selected>Not selected</option>`)
  )
}

function findCountries(name, region, countries = storage.get(`countries`)) {
  console.log(name, region)

  name = name.trim().toLowerCase()
  region = region.toLowerCase()

  let countriesFiltered = countries.filter(country => {
    return (country.name.toLowerCase().indexOf(name) > -1 &&
            country.region.toLowerCase().indexOf(region) > -1) ||
           (country.region.toLowerCase().indexOf(name) > -1 &&
            country.region.toLowerCase().indexOf(region) > -1) ||
           (country.capital.toLowerCase().indexOf(name) > -1 &&
            country.region.toLowerCase().indexOf(region) > -1)
  })

  renderCountries(countriesFiltered)
  return countriesFiltered;
}

function sortCountries(sortBy, countries) {
  sortBy = sortBy.toLowerCase();
  countries = countries ? countries : findCountries(inputText.val(), inputSelect.val());
  countries.sort((a, b) => {
    if (typeof a[sortBy] === "number") {
      return b[sortBy] - a[sortBy];
    }
    return a[sortBy] > b[sortBy] ? 1 : a[sortBy] < b[sortBy] ? -1 : 0
  })
  renderCountries(countries)
}