const searchArtistBtn = document.querySelector("#searchArtist");
const main = document.querySelector("main");
const artistForm = document.createElement("form");
const artistTable = document.createElement("table");
const searchKeywordSection = document.createElement("div");
main.appendChild(artistForm);
main.appendChild(searchKeywordSection);
artistForm.appendChild(artistTable);
artistForm.addEventListener("submit", submitArtistForm);

searchArtistBtn.addEventListener("click", fetchArtists);

let listOfArtists;
let selectedArtist;
let selectedArtistObject;

async function fetchArtists() {
  const response = await fetch(
    `http://musicbrainz.org/ws/2/artist/?fmt=json&query=artist:"celine "`
  );
  const responseObject = await response.json();
  listOfArtists = responseObject.artists;
  renderArtists();
}

function renderArtists() {
  /* Create header row */
  artistTable.innerHTML = "";
  const firstRow = document.createElement("tr");
  const nameHeader = document.createElement("th");
  nameHeader.innerHTML = "Name";
  artistTable.appendChild(firstRow);
  firstRow.appendChild(nameHeader);

  /* Render list of artists */
  listOfArtists.map((artist) => {
    const row = document.createElement("tr");

    const nameColumn = document.createElement("td");
    nameColumn.innerHTML = artist.name;

    const checkColumn = document.createElement("td");

    const radioButton = document.createElement("input");
    radioButton.type = "radio";
    radioButton.name = "selected-artist";
    radioButton.value = artist.id;

    checkColumn.appendChild(radioButton);

    row.appendChild(nameColumn);
    row.appendChild(checkColumn);
    artistTable.appendChild(row);
  });

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.innerHTML = "Submit";
  artistForm.appendChild(submitBtn);
}

function submitArtistForm(event) {
  event.preventDefault();
  const formData = new FormData(artistForm);
  selectedArtist = formData.get("selected-artist");
  selectedArtistObject = listOfArtists.find(
    (artist) => artist.id === selectedArtist
  );

  renderKeywordInput();
}

function renderKeywordInput() {
  //searchKeywordSection.innerHTML = `<h1>Input a keyword to see how many ${selectedArtistObject.name} song titles contain it!</h1>`

  searchKeywordSection.innerHTML = `
  <h1>Input a keyword to see how many ${selectedArtistObject.name} song titles contain it!</h1>
  <label for="searchKeyword"> Input a keyword for a song title </label>
  <input type="text" id="searchKeyword" placeholder="Input a keyword">
  `;
  const searchKeywordBtn = document.createElement("button");
  searchKeywordBtn.innerHTML = "Search";
  searchKeywordBtn.addEventListener("click", findSongsFromApi);
  searchKeywordSection.appendChild(searchKeywordBtn);
}

async function findSongsFromApi(event) {
  const searchKeyword = document.querySelector("#searchKeyword").value;
  const response = await fetch(
    `http://musicbrainz.org/ws/2/recording/?fmt=json&query=recording:"love" AND artist:"$celine dion"`
  );
  const responseObject = await response.json();
  listOfArtists = responseObject.artists;
  renderArtists();
  //make this work with ID in query
  //render table with the number of songs and the songs = remove duplicates

}
