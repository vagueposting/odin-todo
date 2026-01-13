import { assembleParts } from "../utils.js";

export const Clear = () => {
    const clearConfirm = new Map([
        ['shell', () => {
            const shell = document.createElement('div');
            shell.classList.add('generic');
            return shell;
        }],
        ['message', () => {
            const text = document.createElement('p');
            text.textContent = 'This will REMOVE ALL TASKS. Are you sure?';
            return text;
        }],
        ['buttons', () => {
            const shell = document.createElement('div');
            const buttons = {
                yes: () => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.textContent = 'Yes';
                    button.addEventListener('click', (event) => {
                        event.preventDefault;
                        document.dispatchEvent(new CustomEvent('clear-list'));
                    })
                    return button;
                },
                no: () => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.textContent = 'No';
                    button.setAttribute('popovertarget', 'confirmClear');
                    button.setAttribute('popovertargetaction', 'hide');
                    return button;
                }
            }
            shell.appendChild(buttons.yes());
            shell.appendChild(buttons.no());
            return shell;
        }]
    ])

    return assembleParts(clearConfirm, 'shell');
}