import { format, isBefore } from 'date-fns';
import { TextControls } from './utils.js';

export const DisplayHandler = (data) => {
    const documentBody = document.querySelector('body');

    let currentVisibleList = data.viewList();
    
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
            const controlList = ['new', 'filter', 'sort', 'stats', 'clear']
            const controlIcons = [
                { // 'new'
                    d: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z',
                    stroke: 'black'
                },
                { // filter
                    d: 'M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z',
                    stroke: 'black'
                },
                {
                    // sort
                    d: 'M18 21L14 17H17V7H14L18 3L22 7H19V17H22M2 19V17H12V19M2 13V11H9V13M2 7V5H6V7H2Z',
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
            const applyPopoverTarget = (button, divID) => {
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
                        applyPopoverTarget(buttonShell, 'createNewTask');
                        break;
                    case 1: // filter
                        applyPopoverTarget(buttonShell, 'filterTasks')
                    case 4: // clear
                        // TODO: add a popover here.
                        const clear = new CustomEvent('clear-list')
                        buttonShell.addEventListener('click', () => { 
                            buttonShell.dispatchEvent(clear)
                        });
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

            currentVisibleList.forEach((task) => {
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
    /** Generic form component
     * @property {'new' | 'filter'} type
     */
    form: (type) => {
        const form = new Map([
            ['shell', () => {
                const shell = document.createElement('form');
                shell.id = 'form-newTask';

                return shell;
            }],
            ['title', () => {
                const title = inputHelper('input', 'text', `${type}-title`, 'Title');
                
                if (type === 'filter') {
                    const filterDirection = radioHelper(
                        `${type}-title`,
                        [
                            {
                                dir: 'INCLUDES',
                                label: 'includes'
                            },
                            {
                                dir: 'EXCLUDES',
                                label: 'excludes'
                            }
                        ]
                    )

                    title.appendChild(filterDirection);
                }

                return title;
            }],
            ['description', () => {
                if (type === 'filter') return;
                return inputHelper('textarea', null, `${type}-description`, 'Description');
            }],
            ['createdDate', () => {
                if (type === 'task') return;

                const createdDate = inputHelper('input', 
                    'date', 
                    `${type}-created`, 
                    'Date Created',
                    false);

                const filterDirection = radioHelper(
                    `${type}-created`,
                    [
                        {
                            dir: 'BEFORE',
                            label: 'before'
                        },
                        {
                            dir: 'DURING',
                            label: 'during',
                        },
                        {
                            dir: 'AFTER',
                            label: 'after'
                        }
                    ]
                )

                createdDate.appendChild(filterDirection);

                return createdDate;
            }],
            ['dueDate', () => {
                const dueDate = inputHelper('input', 'date', `${type}-due`, 'Due Date');

                const dateInput = dueDate.querySelector(`#${type}-due`);

                const localToday = getLocalDateToday();
                dateInput.defaultValue = localToday; 
                dateInput.value = localToday;
                dateInput.min = localToday;

                if (type === 'filter') {
                    const filterDirection = radioHelper(
                        `${type}-due`,
                        [
                            {
                                dir: 'BEFORE',
                                label: 'before'
                            },
                            {
                                dir: 'DURING',
                                label: 'during',
                            },
                            {
                                dir: 'AFTER',
                                label: 'after'
                            }
                        ]
                    )

                    dueDate.appendChild(filterDirection);
                };

                return dueDate;
            }],
            ['priority', () => {
                const priorities = ['low', 'medium', 'high'];
                if (type === 'filter') priorities.unshift('N/A');

                const form = inputHelper('select', 'select', 
                    `${type}-priority`, 
                    'Priority Level');
                
                const select = form.querySelector(`#${type}-priority`);

                priorities.forEach(priority => {
                    const option = document.createElement('option');
                    option.value = priority === 'N/A' ? null : priority;
                    option.textContent = TextControls
                        .capitalizeEachWord(priority);
                    select.appendChild(option);
                })

                return form;
            }],
            ['status', () => {
                if (type === 'task') return;

                return inputHelper('input', 'checkbox', `${type}-status`,
                    'Completed?'
                );
            }],
            ['tags', () => {
                let tags = [];

                const setTags = () => {
                    let tagArray = JSON.stringify(tags);
                    input.setAttribute(`${type}-tagList`, tagArray);
                }

                const createTag = (label) => {
                    const div = document.createElement('div');
                    div.classList.add('tag');

                    const span = document.createElement('span');
                    span.innerHTML = label;

                    const remove = document.createElement('span');
                    remove.classList.add('tag-close');
                    remove.textContent = '×';

                    remove.addEventListener('click', () => {
                        div.remove();
                        tags = tags.filter(tag => tag !== label);
                        setTags();
                    });

                    div.appendChild(span);
                    div.appendChild(remove);
                    return div;
                }

                const shell = document.createElement('fieldset');
                shell.classList.add(`tagContainer`);
                shell.id = `${type}-tagContainer`;

                const input = document.createElement('input');
                input.id = `${type}-tags`;
                input.setAttribute('placeholder', 'Input tags...');

                input.addEventListener('keyup', (e) => {
                    if (e.key === 'Enter') {
                        const value = input.value.trim();
                        if (value !== '' && !tags.includes(value)) {
                            const tag = createTag(value);
                            tags.push(value);
                            shell.insertBefore(tag, input);
                            input.value = '';
                        }
                        setTags();
                    }
                })

                shell.appendChild(input);

                if (type === 'filter') {
                    const filterType = radioHelper(
                        `${type}-tags-filterType`,
                        [
                            {
                                dir: 'INCLUDES',
                                label: 'includes'
                            },
                            {
                                dir: 'EXCLUDES',
                                label: 'excludes'
                            }
                        ]
                    )

                    const filterScope = radioHelper(
                        `${type}-tags-filterScope`,
                        [
                            {
                                dir: 'SOME',
                                label: 'some',
                            },
                            {
                                dir: 'ALL',
                                label: 'all'
                            }
                        ]
                    )

                    shell.appendChild(filterType);
                    shell.appendChild(filterScope);
                }

                return shell;
            }],
            ['submit-task', () => {
                if (type === 'filter') return;

                const shell = document.createElement('fieldset');
                const submit = document.createElement('button');
                submit.setAttribute('type', 'button')
                submit.textContent = 'submit';

                shell.appendChild(submit);
                
                setTimeout(() => {
                    const form = submit.closest('form');
                    if (form) {
                        submit.addEventListener('click', (event) => {
                            event.preventDefault();
                            
                            const keys = ['title', 'description', 'due', 'priority', 'tags'];
                            const taskDetails = {};
                            
                            keys.forEach(key => {
                                const identifier = `${type}-${key}`
                                const element = document.querySelector(`#${identifier}`);
                                if (element) {
                                    if (key === 'due') {
                                        const [year, month, day] = element.value.split('-').map(Number);
                                        taskDetails.dueDate = new Date(year, month - 1, day);
                                    } else if (key === 'tags') {
                                        const tags = JSON.parse(element.getAttribute(`${type}-tagList`));
                                        taskDetails.tags = tags;

                                        // Reset this part of the form
                                        const tagDivs = document.querySelectorAll(
                                            `#${type}-tagContainer > .tag`);
                                        tagDivs.forEach(tag => tag.remove());
                                        
                                    } else {
                                        taskDetails[key] = element.value;
                                    }
                                }
                            });

                            taskDetails.subtasks = [];

                            const tasksAdded = new CustomEvent('task-added', {
                                detail: taskDetails
                            });
                            document.dispatchEvent(tasksAdded);

                            form.reset();
                        });
                    }
                }, 0);

                return shell;
            }],
            ['submit-filter', () => {
                if (type === 'task') return;

                const shell = document.createElement('div');
                const submit = document.createElement('button');
                submit.setAttribute('type', 'button')
                submit.textContent = 'submit';

                shell.appendChild(submit);

                setTimeout(() => {
                    const form = submit.closest('form');

                    if (form) {
                        submit.addEventListener('click', (event) => {
                            event.preventDefault();
                            
                            const keys = ['title', 'created', 'due', 'priority', 'status', 'tags'];

                            const filterDetails = {};
                            
                            keys.forEach(key => {
                                const identifier = `${type}-${key}`
                                const element = document.querySelector(`#${identifier}`);

                                if (element) {
                                    const filters = [];
                                    // Most of the time, this array will only have one element
                                    // But if we're looking at tags...

                                    if (key === 'tags') {
                                        filters.push(
                                            document.querySelector(
                                                `input[name="${identifier}-filterType-radio"]:checked`
                                        )?.value);
                                        filters.push(
                                            document.querySelector(
                                                `input[name="${identifier}-filterScope-radio"]:checked`
                                        )?.value);
                                    } else {
                                        filters.push(
                                            document.querySelector(
                                                `input[name="${identifier}-radio"]:checked`)?.value);
                                    };

                                    if (key === 'due' || key === 'created') {
                                        
                                        const [year, month, day] = element.value.split('-').map(Number);
                                        filterDetails[`${key}Date`].query = new Date(year, month - 1, day);
                                        filterDetails[`${key}Date`].type = filters[0];

                                    } else if (key === 'tags') {

                                        const tags = JSON.parse(element.getAttribute(`${type}-tagList`));
                                        filterDetails[key].tagList = tags;
                                        filterDetails[key].type = filters[0];
                                        filterDetails[key].typeScope = filters[1];

                                        // Reset this part of the form
                                        const tagDivs = document.querySelectorAll(
                                            `#${type}-tagContainer > .tag`);
                                        tagDivs.forEach(tag => tag.remove());
                                        
                                    } else if (key === 'priority') {
                                        filterDetails[key] = element.value;
                                    } else if (key === 'status') {
                                        filterDetails[key] = element.checked;
                                    } else {
                                        filterDetails[key].query = element.value;
                                        filterDetails[key].type = filters[0];
                                    }
                                }
                            });

                            const listFiltered = new CustomEvent('list-filtered', {
                                detail: { list: currentVisibleList, config: filterDetails }
                            });
                            document.dispatchEvent(listFiltered);

                            form.reset();
                        });

                    }
                })

                return shell;
            }]
        ])

        return assembleParts(form, 'shell');
    }
}

    const refreshList = (newListData = null) => {
        const container = document.querySelector('.container');
        const oldList = document.querySelector('.todoGroup');
        
        if (oldList) oldList.remove();
        
        if (newListData) {
            currentVisibleList = newListData;
        } else {
            currentVisibleList = data.viewList();
        };
        container.appendChild(newList);
    };

    documentBody.appendChild(assembleParts(sections, 'container'));
    
    documentBody.appendChild(components.popover(
        components.form('task'), 'createNewTask'));

    documentBody.appendChild(components.popover(
        components.form('filter'), 'filterTasks'));

    document.addEventListener('tasks-updated', () => {
        refreshList();
    });

    document.addEventListener('render-filtered-list', (e) => {
        refreshList(e.detail);
    })
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

const getLocalDateToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

const applyLabel = (id, labelText) => {
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
const radioHelper = (mainID, options) => {
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

const inputHelper = (e, inputType, id, labelText) => {
    const shell = document.createElement('fieldset');
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