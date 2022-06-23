const ROOT_URL = `${environment.backendBaseUrl}`;

class Header extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
        this.innerHTML = `
            <div class="w3-bar w3-light-grey">
                <a target="_parent" href="${ROOT_URL}index.html" class="w3-bar-item w3-button">LiveTix</a>
                <a target="_parent" href="${ROOT_URL}index.html?category=concert" class="w3-bar-item w3-button">Concert</a>
                <a target="_parent" href="${ROOT_URL}index.html?category=festival" class="w3-bar-item w3-button">Festival</a>
                <a href="#" class="w3-bar-item w3-button w3-right">Sign In/Sign Up</a>
                <input type="text" class="w3-bar-item w3-input" placeholder="Search events...">
                <a target="_parent" id="search-btn" class="w3-bar-item w3-button w3-green">Search</a>
            </div>
        `;
        let search = document.getElementById('search-btn');
        search.setAttribute('href', `${ROOT_URL}search.html`);
    }
}

customElements.define('header-component', Header);
