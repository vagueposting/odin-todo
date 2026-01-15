import { getLocalDateToday, TextControls,
    assembleParts, inputHelper, radioHelper,
    propertyToggle } from '../utils.js';

/** Generic form component
 * @property {'task' | 'subtask' | 'filter'} type
 */
export const Form = (type, currentList) => {
const form = new Map([
    ['shell', () => {
        const shell = document.createElement('form');

        if (type === 'subtask') return shell;
            
        shell.id = `form-${type}`;
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
        if (type !== 'filter') return;

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
        if (type !== 'filter') return;

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
            // TODO: add changes so I can actually push subtasks
            const form = submit.closest('form');
            if (form) {
                submit.addEventListener('click', (event) => {
                    event.preventDefault();
                    
                    const keys = ['title', 'description', 'due', 
                        'priority', 'tags', '__isSubtask'];
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
                            } else if (key === '__isSubtask') {
                                taskDetails[key] = type === 'subtask' ? true : false;
                            } else {
                                taskDetails[key] = element.value;
                            }
                        }
                    });

                    const parentID = form.getAttribute('data-parent-id');
                    
                    if (type === 'subtask' && parentID) {
                        document.dispatchEvent(new CustomEvent('subtask-added', {
                            detail: {
                                id: parentID,
                                config: taskDetails
                            }
                        }));

                        const parentTask = document.querySelector(`#expand-${parentID}`)
                        if (parentTask) {
                            parentTask.classList.remove('createSubtask');
                        }
                    } else {
                        document.dispatchEvent(new CustomEvent('task-added', {
                            detail: {
                                config: taskDetails
                            }
                        }))
                    }

                    form.reset();
                });
            }
        }, 0);

        return shell;
    }],
    ['submit-filter', () => {
        if (type !== 'filter') return;

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
    }]]);

    return assembleParts(form, 'shell');
}