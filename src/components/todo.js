import { format, isBefore } from 'date-fns';
import { Button, assembleParts } from '../utils.js';
import { components } from "../components.js"

export const ToDo = (task, expanded = false) => {
    const parts = new Map([
        ['base', () => {
            const shell = document.createElement('div');
            shell.classList.add('todo');
            shell.id = !expanded ? task.id : '';

            if (shell.id === `expand-${task.id}`) shell.classList.add('expanded')
            
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
            title.classList.add('taskName');
            
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

        ['subtask-count', () => {
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
        ['create-subtask', () => {
            if (!expanded) return;

            const shell = document.createElement('div');
            shell.classList.add('addSubtask');
            const popoverId = `add-subtask-${task.id}`;
            
            const button = new Button('Add subtask', popoverId);

            button.onClick(() => {
                document.querySelector(`#expand-${task.id}`)
                    .classList
                    .add('createSubtask');
            });

            const formPopover = components.popover(
                (() => {
                    const form = components.form('subtask');
                    form.setAttribute('data-parent-id', task.id);
                    return form;
                })(),
                popoverId);

            console.log(formPopover);

            formPopover.classList.add('subtaskForm');

            formPopover.addEventListener('toggle', (e) => {
                if (e.newState === 'closed') {
                    document
                        .querySelector(`#expand-${task.id}`)
                        .classList.remove('createSubtask');
                };
            });

            document.body.appendChild(formPopover);

            shell.appendChild(button.render());

            return shell;
        }],
        ['subtask-list', () => {
            if (!expanded) return;
            const { subtasks } = task;
            if (subtasks.length <= 0) return;

            const container = document.createElement('div');
            container.classList.add('subtaskContainer');

            subtasks.forEach(subtask => {
                const subtaskElement = components.todo(subtask);
                subtaskElement.classList.add('sub');
                container.appendChild(subtaskElement);
            });

            return container;
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
            if (expanded || task.__isSubtask ) return;
            const shell = document.createElement('span');
            // TODO: create the "expanded view"
            const link = new Button('more info...', `expand-${task.id}`)

            shell.classList.add('more-details');

            shell.appendChild(link.render());
            
            return shell;
        }]
    ]);

    return assembleParts(parts, 'base');
}