const ROOT_URL = `${environment.backendBaseUrl}`;

class Header extends HTMLElement {
    constructor() {
      super();
    }
    async connectedCallback() {
        let token = localStorage.getItem('token');
        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
        }
        const checkUserLoginURL = `/user/role`;
        let loginResult = await fetch(checkUserLoginURL, {
            headers: headers
        });
        let userLoginStatus = await loginResult.json();
        console.log(userLoginStatus);
        if (userLoginStatus.role == 'admin') {
            this.innerHTML = `
            <div class="header-container navbar">
                <div class="header-left">
                    <a target="_parent" href="${ROOT_URL}index.html" class="nav-link"><img id="logo-id" src="../img/LiveTixLogo.png"></a>
                    <a target="_parent" href="${ROOT_URL}index.html?category=concert" class="nav-link slide">Concert</a>
                    <a target="_parent" href="${ROOT_URL}index.html?category=festival" class="nav-link slide">Festival</a>
                    <a target="_parent" id="search-div" class="nav-link slide">Search</a>
                </div>
                <div class="header-right">
                    <a target="_parent" href="${ROOT_URL}ticket-management.html" class="nav-link slide">Ticket Management</a>
                    <div class="nav-link" id="signout-div">Sign Out</div>
                </div>
            </div>`;
        } else if (userLoginStatus.role == 'user') {
            this.innerHTML = `
            <div class="header-container navbar">
                <div class="header-left">
                    <a target="_parent" href="${ROOT_URL}index.html" class="nav-link"><img id="logo-id" src="../img/LiveTixLogo.png"></a>
                    <a target="_parent" href="${ROOT_URL}index.html?category=concert" class="nav-link slide">Concert</a>
                    <a target="_parent" href="${ROOT_URL}index.html?category=festival" class="nav-link slide">Festival</a>
                    <a target="_parent" id="search-div" class="nav-link slide">Search</a>
                </div>
                <div class="header-right">
                    <a target="_parent" href="${ROOT_URL}marketplace.html" class="nav-link slide">Marketplace</a>
                    <a target="_parent" href="${ROOT_URL}ticket-listing.html" class="nav-link slide">Listing</a>
                    <a target="_parent" href="${ROOT_URL}profile.html" class="nav-link slide">Profile</a>
                    <a target="_parent" href="${ROOT_URL}message.html" class="nav-link slide">Messages</a>
                    <div class="nav-link" id="signout-div">Sign Out</div>
                </div>
            </div>`;
        } else {
        this.innerHTML = `
            <div class="header-container navbar">
                <div class="header-left">
                    <a target="_parent" href="${ROOT_URL}index.html" class="nav-link"><img id="logo-id" src="../img/LiveTixLogo.png"></a>
                    <a target="_parent" href="${ROOT_URL}index.html?category=concert" class="nav-link slide">Concert</a>
                    <a target="_parent" href="${ROOT_URL}index.html?category=festival" class="nav-link slide">Festival</a>
                    <a target="_parent" id="search-div" class="nav-link slide">Search</a>
                </div>
                <div class="header-right">
                    <a href="${ROOT_URL}signup.html" class="nav-link slide">Sign Up</a>
                    <a href="${ROOT_URL}login.html" class="nav-link slide">Log In</a>
                </div>
            </div>
        `;
        }
        let search = document.getElementById('search-div');
        search.setAttribute('href', `${ROOT_URL}search.html`);

        let signout_div = document.getElementById('signout-div');
        signout_div.addEventListener('click', signOut);
        function signOut(){
            localStorage.removeItem('token');
            alert('You have signed out.');
            // window.location.reload();
            window.location.href = "/index.html";
        }
    }
}

customElements.define('header-component', Header);
