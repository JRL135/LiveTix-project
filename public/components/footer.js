class Footer extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
        this.innerHTML = `
            <footer class="footer w3-container w3-center w3-light-grey">
                <p id="footer-text">2022 LiveTix</p>
            </footer>
        `;
    }
}

customElements.define('footer-component', Footer);