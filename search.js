const searchResults = document.getElementById("searchResults");

function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("q") ? params.get("q").toLowerCase().trim() : "";
}

function highlight(text, term) {
  if (!term) return text;
  const regex = new RegExp(`(${term})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

// Automatically gather site content
function getSiteContent() {
  const sections = document.querySelectorAll("section");
  const contentArray = [];

  sections.forEach(sec => {
    const title = sec.querySelector("h2") ? sec.querySelector("h2").innerText : sec.id;
    let text = "";
    sec.querySelectorAll("*").forEach(el => {
      if (el.children.length === 0 && el.innerText.trim() !== "") {
        text += el.innerText + " ";
      }
    });
    contentArray.push({ title, text: text.trim(), url: `#${sec.id}` });
  });

  return contentArray;
}

// Create snippet around search term
function createSnippets(text, term, snippetLength = 100) {
  const regex = new RegExp(`.{0,${snippetLength/2}}${term}.{0,${snippetLength/2}}`, "gi");
  const matches = text.match(regex);
  if (!matches) return [];
  return matches.map(snippet => highlight(snippet.trim(), term));
}

// Generate HTML for results with show more/less
function generateResultHTML(title, url, snippets, maxVisible = 3) {
  const visibleSnippets = snippets.slice(0, maxVisible);
  const hiddenSnippets = snippets.slice(maxVisible);

  let html = `<p><a href="${url}"><strong>${title}</strong></a></p>`;
  visibleSnippets.forEach(s => html += `<p>${s}</p>`);

  if (hiddenSnippets.length > 0) {
    html += `<div class="more-snippets" style="display:none;">`;
    hiddenSnippets.forEach(s => html += `<p>${s}</p>`);
    html += `</div>`;
    html += `<button class="toggle-snippets">Show More</button>`;
  }

  return html;
}

// Display search results
function displayResults() {
  const query = getQuery();
  if (!query) {
    searchResults.innerHTML = "<p>No search term entered.</p>";
    return;
  }

  const siteContent = getSiteContent();

  const results = siteContent
    .map(item => {
      const snippets = createSnippets(item.text, query);
      if (snippets.length === 0) return null;
      return { title: item.title, url: item.url, snippets };
    })
    .filter(Boolean);

  searchResults.innerHTML = results.length
    ? results.map(r => generateResultHTML(highlight(r.title, query), r.url, r.snippets)).join("")
    : `<p>No results found for "<strong>${query}</strong>".</p>`;

  // Attach toggle functionality
  document.querySelectorAll(".toggle-snippets").forEach(btn => {
    btn.addEventListener("click", () => {
      const more = btn.previousElementSibling;
      if (more.style.display === "none") {
        more.style.display = "block";
        btn.textContent = "Show Less";
      } else {
        more.style.display = "none";
        btn.textContent = "Show More";
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", displayResults);
