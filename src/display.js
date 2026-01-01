import { format, isBefore } from 'date-fns';
import { TextControls } from './utils.js';

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
            const controlList = ['new', 'stats', 'clear']
            const controlIcons = [
                { // 'new'
                    d: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z',
                    stroke: 'black'
                },
                {
                    // stats
                    d: 'M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z',
                    stroke: 'black'
                },
                {
                    // clear
                    d: 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
                    stroke: 'black'
                }
            ]
            const applyTarget = (button, divID) => {
                button.setAttribute('popovertarget', divID);
                button.setAttribute('popovertargetaction', 'show');
            }
            
            shell.classList.add('controls');

            for (let i = 0; i < controlList.length; i++) {
                const buttonShell = document.createElement('button');
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                const icon = createSVGElement('path', controlIcons[i]);

                svg.setAttribute('viewBox', '0 0 24 24'); 
    
                svg.classList.add('control-icon');

                switch (i) {
                    case 0: // new
                        applyTarget(buttonShell, 'createNewTask');
                        break;
                    default:
                        break;
                }

                svg.appendChild(icon);
                buttonShell.appendChild(svg);
                shell.appendChild(buttonShell);
            }

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
                const { dueDate } = task
                const shell = document.createElement('span');
                shell.textContent = format(dueDate, 'dd MMMM, yyyy');
                shell.classList.add('due-date');

                if (!dueDate) {
                    shell.textContent = 'No date set';
                    return shell;
                }

                const dateObj = new Date(dueDate);

                if (isNaN(dateObj.getTime())) {
                    shell.textContent = 'Invalid Date';
                    return shell;
                }

                shell.textContent = format(dateObj, 'dd MMMM, yyyy');

                if (!isBefore(new Date(), dateObj)) {
                    shell.classList.add('urgent');
                }

                return shell;
            }],

            ['subtasks', () => {
                const shell = document.createElement('span');
                shell.classList.add('subtasks')
                
                const count = Array.isArray(task.subtasks) ? task.subtasks.length : 0;
                
                if (task.__isSubtask) {
                    shell.textContent = ''; 
                } else {
                    shell.textContent = `${count} subtasks`;
                }

                return shell;
            }],

            ['tags', () => {
                const { tags } = task;
                const shell = document.createElement('div');
                shell.classList.add('tagList');

                if (tags) {
                    tags.forEach((t) => {
                        const tagElement = document.createElement('span');
                        tagElement.textContent = t;
                        shell.appendChild(tagElement);
                    })
                };

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
    },
    // popover-related components
    popover: (contents, id) => {
        const shell = document.createElement('div');
        // Assume that contents is a Node/DOM element.
        if (contents) shell.appendChild(contents);
        shell.setAttribute('popover', '');
        shell.id = id;
        return shell;
    },
    newTask: () => {
        const applyLabel = (id, labelText) => {
            const label = document.createElement('label');
            label.textContent = labelText;
            label.setAttribute('for', id);
            return label;
        }

        const inputHelper = (e, type, id, labelText) => {
            const shell = document.createElement('div');
            const divClass = e === 'textarea' ? 'longTextInput' : 'standardInput';
            shell.classList.add(divClass);

            const label = applyLabel(id, labelText)

            const input = document.createElement(e);
            if (e !== 'textarea') input.setAttribute('type', type);
            input.setAttribute('name', id);
            input.id = id;

            shell.appendChild(label); 
            shell.appendChild(input);

            return shell;
        };

        const form = new Map([
            ['shell', () => {
                const shell = document.createElement('form');
                shell.id = 'form-newTask';
                return shell;
            }],
            ['title', () => {
                return inputHelper('input', 'text', 'task-title', 'Title');
            }],
            ['description', () => {
                return inputHelper('textarea', null, 'task-description', 'Description');
            }],
            ['dueDate', () => {
                return inputHelper('input', 'date', 'task-due', 'Due Date');
            }],
            ['priority', () => {
                const priorities = ['low', 'medium', 'high'];
                const form = inputHelper('select', 'select', 
                    'task-priority', 
                    'Priority Level');
                
                const select = form.querySelector('#task-priority');

                priorities.forEach(priority => {
                    const option = document.createElement('option');
                    option.setAttribute('value', priority);
                    option.textContent = TextControls
                        .capitalizeEachWord(priority);
                    select.appendChild(option);
                })

                return form;
            }],
            ['submit', () => {
                const shell = document.createElement('div');
                const submit = document.createElement('button');
                submit.setAttribute('type', 'submit')
                submit.textContent = 'submit';

                shell.appendChild(submit);
                
                setTimeout(() => {
                    const form = submit.closest('form');
                    if (form) {
                        form.addEventListener('submit', (event) => {
                            event.preventDefault();
                            
                            const keys = ['title', 'description', 'due', 'priority', 'notes'];
                            const taskDetails = {};
                            
                            keys.forEach(key => {
                                const element = document.querySelector(`#task-${key}`);
                                if (element) {
                                    if (key === 'due') {
                                        const [year, month, day] = element.value.split('-').map(Number);
                                        taskDetails.dueDate = new Date(year, month - 1, day);
                                    } else {
                                        taskDetails[key] = element.value;
                                    }
                                }
                            });

                            taskDetails.subtasks = [];
                            taskDetails.tags = [];

                            const tasksAdded = new CustomEvent('task-added', {
                                detail: taskDetails
                            });
                            document.dispatchEvent(tasksAdded);

                            form.reset();
                        });
                    }
                }, 0);

                return shell;
            }]
        ])

        return assembleParts(form, 'shell');
    }
}

    const refreshList = () => {
        const container = document.querySelector('.container');
        const oldList = document.querySelector('.todoGroup');
        
        if (oldList) oldList.remove();
        
        const newList = sections.get('todos')();
        container.appendChild(newList);
    };

    documentBody.appendChild(assembleParts(sections, 'container'));
    
    documentBody.appendChild(components.popover(
        components.newTask(), 'createNewTask'));

    document.addEventListener('tasks-updated', () => {
        console.log("Tasks updated! Re-rendering list...");
        refreshList();
    });
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

const createSVGElement = (type, attributes) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', type);

    for (let key in attributes) {
        el.setAttribute(key, attributes[key]);
    };

    return el;
};