/* Grab from DOM and assign initial event listeners*/
const main = document.querySelector("main");
const artistInput = document.querySelector("#artist-input");
const searchArtistBtn = document.querySelector("#searchArtist");
searchArtistBtn.addEventListener("click", fetchArtists);
artistInput.addEventListener("keypress", (e) => {if(e.key === 'Enter') fetchArtists()})

/* Creating elements for DOM (key sections) */

/*Artist form contains list of artists that match the initial query - users can select an artist */
const artistForm = document.createElement("form");
artistForm.classList.add("artist-form");
const artistTable = document.createElement("table");
const artistSongTable = document.createElement("table");

/*searchKeywordSection lets users search for a keyword for the selected artist */
const searchKeywordSection = document.createElement("div");
searchKeywordSection.classList.add("search-keyword");

/* viewSongSection contains list of songs that match the keyword*/
const viewSongSection = document.createElement("div");
viewSongSection.classList.add("view-song-section");

/*Append key sections to main */
main.appendChild(artistForm);
main.appendChild(searchKeywordSection);
main.appendChild(viewSongSection);

/*Creating event listener for artist form section */
artistForm.addEventListener("submit", submitArtistForm);

/*Declaring list of Artists, selectedArtist, and Song List for use in multiple functions */
let listOfArtists;
let selectedArtist;
let selectedArtistObject;
let artistSongList;

/*Gets artists data from API based on user input. */
async function fetchArtists() {
  const response = await fetch(
    `http://musicbrainz.org/ws/2/artist/?fmt=json&query=artist:"${artistInput.value}"`
  );
  const responseObject = await response.json();
  listOfArtists = responseObject.artists;
  renderArtists();
}

/* Renders the artists fetched from the API. Users must select one.*/
function renderArtists() {
  /*Clear existing values - clearing form so button is not repeatedly created */
  artistForm.innerHTML = "";
  artistTable.innerHTML = "";

  /*Add the table to the form */
  artistForm.appendChild(artistTable);

  /*Create header row and add it to the table */
  const firstRow = document.createElement("tr");
  const nameHeader = document.createElement("th");
  nameHeader.innerHTML = "Name";
  artistTable.appendChild(firstRow);
  firstRow.appendChild(nameHeader);

  /* Render the list of artists in a table*/
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

  /*Create submit button */
  const selectArtistBtn = document.createElement("button");
  selectArtistBtn.type = "submit";
  selectArtistBtn.innerHTML = "Select this Artist";
  artistForm.appendChild(selectArtistBtn);
}

/* Activated when user selects an artist from the table for which they want to search a keyword
 * Gets the selected artist value and calls function to render the section to search for a keyword */
function submitArtistForm(event) {
  event.preventDefault();
  const formData = new FormData(artistForm);

  /*Artist ID */
  selectedArtist = formData.get("selected-artist");

  /*Full Artist Object - retrieved from list of artists where the selected artist ID matches the artist's ID */
  selectedArtistObject = listOfArtists.find(
    (artist) => artist.id === selectedArtist
  );

  renderKeywordInput();
}

/*Activated after an artist is selected. Generates section to allow user to input a keyword - creates button that when clicked searches for that keyword in the API */
function renderKeywordInput() {
  searchKeywordSection.innerHTML = `
  <h1>Now, input a keyword to see how many ${selectedArtistObject.name} song titles contain it!</h1>
  <label for="searchKeyword"> Input a keyword for a song title </label>
  <input type="text" id="searchKeyword" placeholder="Input a keyword">
  `;
  const searchKeywordInput = document.querySelector("#searchKeyword")
  searchKeywordInput.addEventListener("keypress", (e) => {if(e.key === "Enter") findSongsFromApi()})

  const searchKeywordBtn = document.createElement("button");
  searchKeywordBtn.id = "search-keyword-btn";
  searchKeywordBtn.innerHTML = "Search for a Keyword";
  searchKeywordBtn.addEventListener("click", findSongsFromApi);
  searchKeywordSection.appendChild(searchKeywordBtn);
}

/*Activated after entering a keyword. Finds song data from API using the keyword and removes some duplicates, then calls function to render artists */
async function findSongsFromApi() {
  const searchKeyword = document.querySelector("#searchKeyword").value;
  const response = await fetch(
    `http://musicbrainz.org/ws/2/recording/?fmt=json&query=recording:"${searchKeyword}" AND arid:"${selectedArtist}"&limit=100`
  );
  const artistSongListObject = await response.json();
  artistSongList = artistSongListObject.recordings;
  const listOfSongTitles = [];
  const songListDuplicatesRemoved = artistSongList.filter((song) => {
    //Removing quote and case variations
    const title = song.title
      .replace(/^["'](.+(?=["']$))["']$/, "$1")
      .toLowerCase();
    if (!listOfSongTitles.includes(title)) {
      listOfSongTitles.push(title);
      return song;
    }
  });
  artistSongList = songListDuplicatesRemoved;
  renderArtistSongs(searchKeyword);
}

/*Renders the artist's songs & number of songs that match the keyword after they have been fetched from the API */
function renderArtistSongs(searchKeyword) {
  viewSongSection.innerHTML = "";
  const resultHeading = `<h2>An estimated ${artistSongList.length} ${selectedArtistObject.name} songs contain "${searchKeyword}" in the title</h2>`;
  artistSongTable.innerHTML = `
  <table>
    <tr>
      <th>Song Name</th>
    </tr>
  </table>
  `;
  artistSongList.forEach((song) => {
    const row = `<td>${song.title}</td>`;
    artistSongTable.innerHTML += row;
  });

  /*Add heading & table to view song section and add viewSongSection to Main */
  viewSongSection.innerHTML += resultHeading;
  viewSongSection.appendChild(artistSongTable);
}
