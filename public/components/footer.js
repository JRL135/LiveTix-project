class Footer extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
        this.innerHTML = `
            <footer class="footer">
                <p id="footer-text">2022 LiveTix</p>
            </footer>
        `;
    }
}

customElements.define('footer-component', Footer);