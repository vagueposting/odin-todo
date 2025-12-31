import { format } from 'date-fns';

export const DisplayHandler = (data) => {
    const documentBody = document.querySelector('body');
    
    const sections = new Map([
        ['container', () => {
            const shell = document.createElement('div');
            shell.classList.add('container');
            return shell;
        }],

        ['appName', () => {
            const shell = document.createElement('div');
            shell.classList.add('appName')

            const title = document.createElement('span');
            title.textContent = '「Calm List」';
            shell.appendChild(title);

            return shell;
        }],

        ['controls', () => {
            const shell = document.createElement('div');
            const controlList = ['new', 'stats', 'clear', 'return']
            shell.classList.add('controls');

            controlList.forEach((control) => {
                const buttonShell = document.createElement('button');
                buttonShell.textContent = control;

                shell.appendChild(buttonShell);
            })

            return shell;
        }],

        ['todos', () => {
            const shell = document.createElement('div');
            shell.classList.add('todoGroup');

            const TDL = data.viewList();

            TDL.forEach((task) => {
                shell.appendChild(components.todo(task));
            })

            return shell;
        }]

    ])

    documentBody.appendChild(assembleParts(sections, 'container'));
}

const components = {
    todo: (task) => {
        const parts = new Map([
            ['base', () => {
                const shell = document.createElement('div');
                shell.classList.add('todo');
                shell.id = task.id;
                return shell;
            }],
            ['title', () => {
                const wrapper = document.createElement('div');
                wrapper.classList.add('checkbox-wrapper-19');
                
                const checkbox = document.createElement('input');
                checkbox.setAttribute('type', 'checkbox');
                checkbox.id = `checkbox-${task.id}`;
                checkbox.checked = task.status;
                
                const checkBoxLabel = document.createElement('label');
                checkBoxLabel.classList.add('check-box');
                checkBoxLabel.setAttribute('for', `checkbox-${task.id}`);
                
                const title = document.createElement('span');
                title.textContent = task.title;
                
                wrapper.appendChild(checkbox);
                wrapper.appendChild(checkBoxLabel);
                wrapper.appendChild(title);
                
                return wrapper;
            }],

            ['description', () => {
                const shell = document.createElement('p');
                shell.textContent = task.description;
                shell.classList.add('description');

                return shell;
            }],

            ['due-date', () => {
                const shell = document.createElement('span');
                shell.textContent = format(task.dueDate, 'dd MMMM, yyyy');
                shell.classList.add('due-date')

                return shell;
            }],

            ['subtasks', () => {
                const shell = document.createElement('span');
                shell.classList.add('subtasks')
                shell.textContent = `${task.subtasks.length} subtasks`

                return shell;
            }],

            ['tags', () => {
                const { tags } = task;
                const shell = document.createElement('div');
                shell.classList.add('tagList');

                tags.forEach((t) => {
                    const tagElement = document.createElement('span');
                    tagElement.textContent = t;
                    shell.appendChild(tagElement);
                })

                return shell;
            }],

            ['more', () => {
                const shell = document.createElement('span');
                const link = document.createElement('a');
                link.textContent = 'more info...';

                shell.classList.add('more-details');

                shell.appendChild(link);
                
                return shell;
            }]
        ]);

        return assembleParts(parts, 'base');
    }
}

const assembleParts = (parts, baseName) => {
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