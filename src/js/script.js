// Imports
import { Storage, loadData } from "./loadData.js";
import { globalFilterCountries, getUniqueRegions, findCountries } from "./filterData.js";

// Events
setListeners();
function setListeners() {
  // Render Countries Button
  $("#renderCountries").click(async () => {
    toggleControls(false)

    if(!Storage.get("countries")) {
      await loadData("https://restcountries.com/v3.1/all").then(data => {
        Storage.set("countries", globalFilterCountries(data));
      })
    }
    if(!Storage.get("regions")) {
      Storage.set("regions", getUniqueRegions(Storage.get("countries")))
    }
    if ($("#countriesTable").is(":hidden")) {
      $("#countriesTable").show();
    }

    renderCountries(Storage.get("countries"));
    renderSelect(Storage.get("regions"));
    toggleControls(true);

  });

  // Clear Storage Button
  $("#clearStorage").click(() => {
    if(confirm("Are you sure?")) {
      localStorage.clear()
      location.reload()
    }
  });

  // Form inputs
  $("#findCountryByRegion").change(searchCountries);
  $("#findCountryByName").keyup(searchCountries);
  function searchCountries() {
    let label = $("#findCountryByName").val(),
        region = $("#findCountryByRegion").val(),
        countries = Storage.get("countries"),
        sortBy = $("#countriesTable [data-sorted]").text().toLowerCase() || "",
        countriesFound = findCountries(label, region, countries, sortBy);

    renderCountries(countriesFound);
    return countriesFound;
  }

  // Sort countries
  $("#countriesTable [data-sortable]").click(e => {
    if(e.target.getAttribute("data-sorted")) {
      e.target.removeAttribute("data-sorted");
    } else {
      $(`#countriesTable [data-sortable]`).removeAttr(`data-sorted`);
      e.target.setAttribute("data-sorted", true);
    }
    searchCountries();
    $("#scrollToTop").click();
  })

  // Scroll
  window.onscroll = () => {
    if($("html").scrollTop() > $("body > header").height()) {
      $("#scrollToTop").attr("data-show", true);
    } else {
      $("#scrollToTop").removeAttr("data-show");
    }
  }
  $("#scrollToTop").click(() => {
    window.scrollTo(0, 0);
  })

  /*  ----------------------- NEED TO BE FIXED ----------------------- */
  $("#reverse").click(() => {

    alert("This feature is going to be added!");

    /*
    let countries = searchCountries();
    countries.reverse();
    renderCountries(countries);
    */
  });
}

// Controls
$("#renderCountries .spinner-border").hide();
$("#countriesTable").hide();
$("#findCountryByRegion").prop("disabled", true);
$("#findCountryByName").prop("disabled", true);

function toggleControls(checkbox) {
  if(checkbox === true) {
    $("#renderCountries .spinner-border").hide();
    $("#renderCountries").prop("disabled", false);
    $("#clearStorage").prop("disabled", false)
    $("#findCountryByRegion").prop("disabled", false);
    $("#findCountryByName").prop("disabled", false);
  } else {
    $("#renderCountries .spinner-border").show();
    $("#renderCountries").prop("disabled", true);
    $("#clearStorage").prop("disabled", true)
    $("#findCountryByRegion").prop("disabled", true);
    $("#findCountryByName").prop("disabled", true);
    $("#findCountryByName").val("");
  }
} 

// Render
function renderCountries(countries) {
  $(`#countriesTable tbody`).html(
    countries.reduce((acc, country, index) => {
      return acc +
        `<tr>
        <td>${index + 1}</td>
        <td>${country.name.join(", ")}</td>
        <td>${country.capital.join(", ")}</td>
        <td>${country.region}</td>
        <td>${country.population}</td>
        <td>${country.borders.join(", ")}</td>
        <td>${country.currencies.join(", ")}</td>
        <td>${country.languages.join(", ")}</td>
      </tr>`
    }, "")
  )
}

function renderSelect(uniqueRegions) {
  $("#findCountryByRegion").html(
    uniqueRegions.reduce((acc, region) => {
      return acc + `<option value="${region}">${region}</option>`
    }, `<option value="" selected>Not selected</option>`)
  );
}