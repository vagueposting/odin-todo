import { format, isBefore } from 'date-fns';
import { getLocalDateToday, inputHelper, 
    radioHelper, assembleParts, TextControls,
    propertyToggle, applyPopoverTarget } from "./utils.js";

export const components = {

todo: (task, expanded = false) => {
    const parts = new Map([
        ['base', () => {
            const shell = document.createElement('div');
            shell.classList.add('todo');
            shell.id = !expanded ? task.id : `expand-${task.id}`;
            return shell;
        }],
        ['title', () => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('checkbox-wrapper-19');
            
            const checkbox = document.createElement('input');
            checkbox.setAttribute('type', 'checkbox');
            checkbox.id = `checkbox-${task.id}`;
            checkbox.checked = task.status;
            checkbox.addEventListener('change', function(e) {
                const changeStatus = new CustomEvent('toggle-task', 
                    { detail: task.id }
                );

                document.dispatchEvent(changeStatus);
            });

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

        ['subtask-list', () => {
            if (expanded) return;
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
            if (expanded) return;
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
form: (type, currentList) => {
    const form = new Map([
        ['shell', () => {
            const shell = document.createElement('form');
            shell.id = 'form-newTask';

            return shell;
        }],
        ['title', () => {
            const shell = document.createElement('div');
            if (type === 'filter') shell.classList.add('filterOption')
            
            const title = inputHelper('input', 'text', `${type}-title`, 'Title');
            
            if (type === 'filter') {
                const toggle = propertyToggle(
                    'enableFilter-title',
                    title);

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

                shell.appendChild(toggle);
                title.appendChild(filterDirection);
                shell.appendChild(title);
                return shell;
            } else {
                return title;
            };
        }],
        ['description', () => {
            if (type === 'filter') return;
            return inputHelper('textarea', null, `${type}-description`, 'Description');
        }],
        ['createdDate', () => {
            if (type === 'task') return;

            const shell = document.createElement('div');
            shell.classList.add('filterOption');

            const createdDate = inputHelper('input', 
                'date', 
                `${type}-created`, 
                'Date Created',
                false);

            const toggle = propertyToggle(
                'enableFilter-createdDate',
                createdDate
            )


            const dateInput = createdDate.querySelector(`#${type}-created`);
            dateInput.defaultValue = getLocalDateToday();
            dateInput.max = getLocalDateToday();

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

            shell.appendChild(toggle);
            createdDate.appendChild(filterDirection);
            shell.appendChild(createdDate);

            return shell;
        }],
        ['dueDate', () => {

            const shell = document.createElement('div');
            shell.classList.add('filterOption');

            const dueDate = inputHelper('input', 'date', `${type}-due`, 'Due Date');

            const dateInput = dueDate.querySelector(`#${type}-due`);

            const localToday = getLocalDateToday();
            dateInput.defaultValue = localToday; 
            dateInput.value = localToday;
            dateInput.min = localToday;

            if (type === 'filter') {
                const toggle = propertyToggle(
                    'enableFilter-dueDate',
                    dueDate
                );

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

                shell.appendChild(toggle);
                dueDate.appendChild(filterDirection);
                shell.appendChild(dueDate);
            };

            if (type === 'filter') {
                return shell
            } else {
                return dueDate
            };
        }],
        ['priority', () => {
            const shell = document.createElement('div');
            shell.classList.add('filterOption');

            const priorities = ['low', 'medium', 'high'];

            const form = inputHelper('select', 'select', 
                `${type}-priority`, 
                'Priority Level');
            
            const select = form.querySelector(`#${type}-priority`);

            priorities.forEach(priority => {
                const option = document.createElement('option');
                option.value = priority;
                option.textContent = TextControls
                    .capitalizeEachWord(priority);
                select.appendChild(option);
            })

            if (type === 'filter') {
                const toggle = propertyToggle(
                    'enableFilter-priority',
                    form
                );

                shell.appendChild(toggle);
                shell.appendChild(form);
                return shell;
            } else {
                return form;
            }
        }],
        ['status', () => {
            if (type === 'task') return;

            const shell = document.createElement('div');
            shell.classList.add('filterOption');

            const status = inputHelper('input', 'checkbox', `${type}-status`,
                'Completed?'
            );

            const toggle = propertyToggle(
                'enableFilter-status',
                status
            );

            shell.appendChild(toggle);
            shell.appendChild(status);
            return shell;
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

            const shell = document.createElement('div');

            const subshell = document.createElement('fieldset');
            if (type === 'filter') {
                shell.classList.add('filterOption');
                subshell.setAttribute('disabled', null);
            };
            subshell.classList.add(`tagContainer`);
            subshell.id = `${type}-tagContainer`;

            const label = document.createElement('label');
            label.textContent = 'Tags';

            const input = document.createElement('input');
            input.id = `${type}-tags`;
            input.setAttribute('placeholder', 'Input tags...');

            input.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    const value = input.value.trim();
                    if (value !== '' && !tags.includes(value)) {
                        const tag = createTag(value);
                        tags.push(value);
                        subshell.insertBefore(tag, input);
                        input.value = '';
                    }
                    setTags();
                }
            })

            subshell.appendChild(label);
            subshell.appendChild(input);

            if (type === 'filter') {
                const toggle = propertyToggle(
                    'enableFilter-tags',
                    subshell
                )
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
                
                shell.appendChild(toggle);
                subshell.appendChild(filterType);
                subshell.appendChild(filterScope);
                shell.appendChild(subshell);

                return shell;
            }

            return subshell;
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
                                    taskDetails.tags = tags ? tags : [];

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
                            const propName = key === 'due' || key === 'created' ? `${key}Date` : key;
                            const isEnabled = document.querySelector(`#enableFilter-${propName}`).checked;

                            const isItDisabled = (key) => {
                                if (!isEnabled) {
                                    filterDetails[key] = null;
                                    return true;
                                };

                                return false;
                            }

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

                                // Set properties
                                if (key === 'due' || key === 'created') {

                                    if (isItDisabled(`${key}Date`)) return;

                                    const [year, month, day] = element.value.split('-').map(Number);
                                    filterDetails[`${key}Date`] = {}
                                    filterDetails[`${key}Date`].query = new Date(year, month - 1, day);
                                    filterDetails[`${key}Date`].type = filters[0];

                                } else if (key === 'tags') {

                                    if (isItDisabled(key)) return;

                                    const tags = JSON.parse(element.getAttribute(`${type}-tagList`));
                                    filterDetails[key] = {}
                                    filterDetails[key].tagList = tags;
                                    filterDetails[key].type = filters[0];
                                    filterDetails[key].typeScope = filters[1];

                                    // Reset this part of the form
                                    const tagDivs = document.querySelectorAll(
                                        `#${type}-tagContainer > .tag`);
                                    tagDivs.forEach(tag => tag.remove());
                                    
                                } else if (key === 'priority') {
                                    if (isItDisabled(key)) return;

                                    filterDetails[key] = element.value;
                                } else if (key === 'status') {
                                    if (isItDisabled(key)) return;

                                    filterDetails[key] = element.checked;
                                } else {
                                    if (isItDisabled(key)) return;
                                    filterDetails[key] = {};
                                    filterDetails[key].query = element.value;
                                    filterDetails[key].type = filters[0];
                                }
                            }
                        });

                        const listFiltered = new CustomEvent('list-filtered', {
                            detail: { list: currentList, config: filterDetails }
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
},
    sort: (currentVisibleList) => {
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
    },
    clear: () => {
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
};