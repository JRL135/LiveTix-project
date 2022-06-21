// const headerTemplate = document.createElement('template');

class Header extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
        this.innerHTML = `
            <div class="w3-bar w3-light-grey w3-padding-16">
                <a href="#" class="w3-bar-item w3-button">LiveTix</a>
                <a href="#" class="w3-bar-item w3-button">Browse Events</a>
                <a href="#" class="w3-bar-item w3-button w3-right">Sign In/Sign Up</a>
                <input type="text" class="w3-bar-item w3-input" placeholder="Search events...">
                <a href="#" class="w3-bar-item w3-button w3-green">Search</a>
            </div>
        `;
    }
}

customElements.define('header-component', Header);
