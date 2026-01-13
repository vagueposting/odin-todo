import { radioHelper, assembleParts } from "../utils.js";

export const Sort = (currentVisibleList) => {
    const sortMenu = new Map([
        ['form', () => {
            const shell = document.createElement('form');
            shell.classList.add('sortOptions');
            return shell;
        }],
        ['options', () => {
            const shell = document.createElement('fieldset');
            const info = document.createElement('p');
            info.textContent = 'Sort by...'
            const radio = radioHelper('sortOptions',
                [
                    {
                        dir: 'TITLE',
                        label: 'Title'
                    },
                    {
                        dir: 'CREATE',
                        label: 'Date created'
                    },
                    {
                        dir: 'DUE',
                        label: 'Due date'
                    },
                    {
                        dir: 'SUBTASKS',
                        label: '# of subtasks'
                    },
                    {
                        dir: 'TAGS',
                        label: '# of tags'
                    }
                ]
            );

            shell.appendChild(info);
            shell.appendChild(radio);
            return shell;
        }],
        ['direction', () => {
            const shell = document.createElement('fieldset');
            const radio = radioHelper('sortDirection', 
                [
                    {
                        dir: 'DESC',
                        label: 'Descending'
                    },
                    {
                        dir: 'ASC',
                        label: 'Ascending'
                    }
                ]
            )

            shell.appendChild(radio);
            return shell;
        }],
        ['submit', () => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = 'submit';

            button.addEventListener('click', function(e) {
                e.preventDefault();

            const sortDirection = document.querySelector(
                'input[name="sortDirection-radio"]:checked')?.value;
            const sortOption = document.querySelector(
                'input[name="sortOptions-radio"]:checked')?.value;

            const sortEvent = new CustomEvent('list-sorted', {
                detail: {
                    list: currentVisibleList,
                    sortBy: sortOption,
                    direction: sortDirection
                }
            })

                document.dispatchEvent(sortEvent);
            })

            return button;
        }]
    ])

    return assembleParts(sortMenu, 'form');   
}