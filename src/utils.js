export const TextControls = {
    capitalizeEachWord: (sentence) => {
        if (typeof sentence !== 'string' || sentence.length === 0) {
            return '';
        }

        const words = sentence.split(' ');

        const capitalizedWords = words.map(word => {
            if (word.length === 0) {
            return '';
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        });

        return capitalizedWords.join(' ');
    }
}

export const assembleParts = (parts, baseName = 'shell') => {
    const base = parts.get(baseName)();

    for (const [part, assemble] of parts) {
        if (part === baseName) {
            continue;
        }
        
        const element = assemble();

        if (element) {
            base.appendChild(element);
        };
    };

    return base;
}

export const createSVGElement = (type, attributes) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', type);

    for (let key in attributes) {
        el.setAttribute(key, attributes[key]);
    };

    return el;
};

export const getLocalDateToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export const applyLabel = (id, labelText) => {
    const label = document.createElement('label');
    label.textContent = labelText;
    label.setAttribute('for', id);
    return label;
}

/**
 * Returns a div with a collecetion of radio input elements
 * @param {string} mainID - ID of specific property being queried  
 * @param {Array<Object>} options 
 *  @property {string} dir
 *  @property {string} label
 */
export const radioHelper = (mainID, options) => {
    const shell = document.createElement('fieldset')
    shell.classList.add('radio');

    options.forEach(o => {
        const opt = document.createElement('div');
        const radio = document.createElement('input');
        const label = document.createElement('label');

        radio.type = 'radio';
        radio.name = `${mainID}-radio`;
        radio.id = `${mainID}-${o.dir}`
        radio.value = o.dir;
        if (o === options[0]) radio.setAttribute('checked', null);

        label.textContent = o.label;
        label.setAttribute('for', radio.id);

        opt.appendChild(radio);
        opt.appendChild(label);

        shell.appendChild(opt);
    });

    return shell;
}

export const inputHelper = (e, inputType, id, labelText) => {
    const shell = document.createElement('fieldset');
    if (id.includes('filter')) shell.setAttribute('disabled', null);
    const divClass = e === 'textarea' ? 'longTextInput' : 'standardInput';
    shell.classList.add(divClass);

    const label = applyLabel(id, labelText)

    const input = document.createElement(e);
    if (e !== 'textarea') input.setAttribute('type', inputType);
    input.name = id;
    input.id = id;

    shell.appendChild(label); 
    shell.appendChild(input);

    return shell;
};

export const propertyToggle = (id, targetFieldset) => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;

    checkbox.addEventListener('change', () => {
        targetFieldset.disabled = !checkbox.checked;
    });

    return checkbox;
}


export class Button {
    constructor(buttonName, targetDiv = null) {
        this.button = document.createElement('button');
        this.button.textContent = buttonName;

        if (targetDiv) {
            this.button.setAttribute('popovertarget', targetDiv);
            this.button.setAttribute('popovertargetaction', 'show');
        }
    }

    onClick(callback) {
        this.button.addEventListener('click', callback);
        return this;
    }

    render() {
        return this.button;
    }
}

export class IconButton extends Button {
    constructor(buttonName, targetDiv, pathData) {
        super(buttonName, targetDiv);
        this.button.textContent = '';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.classList.add('control-icon');
        const icon = createSVGElement('path', pathData);

        svg.appendChild(icon);
        this.button.appendChild(svg);
    }
}