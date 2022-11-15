import { CSL } from  './citeproc.js';

class WdsConfigClass {};


window.WdsConfig = new WdsConfigClass();

function load_style(style_id) {
    if (style_id == 'abnt') {
        style_id = 'associacao-brasileira-de-normas-tecnicas-note';
    }
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://raw.githubusercontent.com/citation-style-language/styles/master/' + style_id + '.csl', false);
    xhr.send(null);
    return xhr.responseText;
}

function retrieveLocale(lang){
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://raw.githubusercontent.com/citation-style-language/locales/master/locales-' + lang + '.xml', false);
    xhr.send(null);
    return xhr.responseText;
};

function copy_elem_to_clipboard(elem) {
    navigator.clipboard.writeText(elem.innerText);
    navigator.clipboard.write([
        new ClipboardItem({
            'text/plain': new Blob([elem.innerText.trim()], {
                type: 'text/plain',
            }),
            'text/html': new Blob([elem.innerHTML],
            {
                type: 'text/html',
            }
            ),
        }),
    ]);
};

const available_styles = [
    ['ABNT', 'abnt'],
    ['APA', 'apa-6th-edition'],
    ['ABNT (IME-USP)', 'universidade-de-sao-paulo-instituto-de-matematica-e-estatistica'],
    ['Vancouver', 'vancouver']
];

const available_locales = [
    ['Português (Brasil)', 'pt-BR'],
    ['English (US)', 'en-US']
];

const locale_fallback = {
    'en-US': 'en-US',
    'en': 'en-US',
    'pt': 'pt-BR',
    'pt-BR': 'pt-BR'
}

const valid_language_codes = available_locales.map((item) => { return item[1]; });
console.log(valid_language_codes);

function fix_language_code(raw_value) {
    console.log('fix_language_code', raw_value);
    raw_value = raw_value || document.querySelector("html").getAttribute('lang') || 'en-US';
    if (raw_value in valid_language_codes) {
        return raw_value;
    }
    return locale_fallback[raw_value];
}

class WdsCitation extends HTMLElement {
    constructor() {
        super();

        this.shadow = this.attachShadow({mode: 'open'});
        this.style_selector = document.createElement('select');
        this.style_selector.classList.add('wds-citation-selector');
        this.create_style_options();
        this.locale_selector = document.createElement('select');
        this.locale_selector.classList.add('wds-citation-selector');
        this.create_locale_options();
        this.main_span = document.createElement('span');
        this.main_span.innerText = 'Loading...'
        this.style_selector.classList.add('wds-citation-main');
        this.copy_btn = document.createElement('button');
        this.style_selector.classList.add('wds-citation-btn');
        this.copy_btn.innerText = 'Copy'
        this.copy_btn.onclick = () => { copy_elem_to_clipboard(this.main_span); };
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('wds-citation');
        this.wrapper.append(this.style_selector);
        this.wrapper.append(this.locale_selector);
        this.wrapper.append(this.main_span);
        this.wrapper.append(this.copy_btn);
        this.shadow.append(this.wrapper);
    }

    create_style_options() {
        for (const option of available_styles) {
            const opt = document.createElement('option');
            opt.innerText = option[0];
            opt.value = option[1];
            this.style_selector.append(opt);
        }
        this.style_selector.onchange = () => { this.setAttribute('data-style', this.style_selector.value); this.do_work() };
    }

    create_locale_options() {
        for (const option of available_locales) {
            const opt = document.createElement('option');
            opt.innerText = option[0];
            opt.value = option[1];
            this.locale_selector.append(opt);
        }
        this.locale_selector.onchange = () => { this.setAttribute('data-lang', this.locale_selector.value); this.do_work() };
    }

    do_work() {
        this.attr_style = this.getAttribute('data-style') || 'abnt';
        for (const child of this.style_selector.children) {
            if (child.value == this.attr_style) {
                child.setAttribute('selected', '');
            } else {
                child.removeAttribute('selected');
            }
        }

        this.attr_lang = fix_language_code(this.getAttribute('data-lang'));
        for (const child of this.locale_selector.children) {
            if (child.value == this.attr_lang) {
                child.setAttribute('selected', '');
            } else {
                child.removeAttribute('selected');
            }
        }

        // Ensure attributes match out expectations
        this.setAttribute('data-lang', this.attr_lang);
        this.setAttribute('data-style', this.attr_style);
        console.log('this.attr_lang', this.attr_lang);
        console.log('this.attr_style', this.attr_style);

        // Create CSL stuff
        const attr_style = load_style(this.attr_style);
        this.citation_item = JSON.parse(this.getAttribute('data-citation'));
        const citeproc_sys = {
            retrieveLocale: retrieveLocale,
            retrieveItem: () => { return this.citation_item }
        };
        const citeproc = new CSL.Engine(citeproc_sys, attr_style, this.attr_lang);

        // Make citation
        citeproc.updateItems([this.citation_item.id]);
        const ans = citeproc.makeBibliography();
        var html_code = ans[1][0];

        // Make link clickable
        const url = this.citation_item.URL;
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.innerHTML = url;
        html_code = html_code.replace(url, link.outerHTML);

        // Output citation
        this.main_span.innerHTML = html_code;
    }

    attributeChangedCallback() {
        this.do_work();
    }

    connectedCallback() {
        this.do_work();

    }
}

customElements.define("wds-citation", WdsCitation);