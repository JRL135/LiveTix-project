const ROOT_URL = `${environment.backendBaseUrl}`;

class Header extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
        this.innerHTML = `
            <div class="header-container navbar">
                <div class="header-left">
                    <a target="_parent" href="${ROOT_URL}index.html" class="nav-link"><img id="logo-id" src="../img/LiveTixLogo.png"></a>
                    <a target="_parent" href="${ROOT_URL}index.html?category=concert" class="nav-link slide">Concert</a>
                    <a target="_parent" href="${ROOT_URL}index.html?category=festival" class="nav-link slide">Festival</a>
                    <a target="_parent" id="search-btn" class="nav-link slide">Search</a>
                </div>
                <div class="header-right">
                    <a target="_parent" href="${ROOT_URL}profile.html" class="nav-link slide">Profile</a>
                    <a href="${ROOT_URL}signup.html" class="nav-link slide">Sign In/Sign Up</a>
                </div>
            </div>
        `;
        let search = document.getElementById('search-btn');
        search.setAttribute('href', `${ROOT_URL}search.html`);
    }
}

customElements.define('header-component', Header);
