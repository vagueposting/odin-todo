import { createSVGElement, assembleParts } from './utils.js';
import { components } from './components.js';

export const DisplayHandler = (data, state) => {
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
                if (i === 3) continue;
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
                        applyPopoverTarget(buttonShell, 'filterTasks');
                        break;
                    case 2: // sort
                        applyPopoverTarget(buttonShell, 'sortTasks');
                        break;
                    case 4: // clear
                        applyPopoverTarget(buttonShell, 'confirmClear')
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

    const refreshList = (newListData = null) => {
        const container = document.querySelector('.container');
        const oldList = document.querySelector('.todoGroup');
        
        if (oldList) oldList.remove();
        
        if (newListData) {
            currentVisibleList = newListData;
        } else {
            currentVisibleList = data.viewList();
        };
        container.appendChild(sections.get('todos')());
    };

    documentBody.appendChild(assembleParts(sections, 'container'));
    
    documentBody.appendChild(components.popover(
        components.form('task', currentVisibleList), 'createNewTask'));

    documentBody.appendChild(components.popover(
        components.form('filter', currentVisibleList), 'filterTasks'));

    documentBody.appendChild(components.popover(
        components.sort(currentVisibleList), 'sortTasks'));

    documentBody.appendChild(components.popover(
        components.clear(), 'confirmClear'));

    document.addEventListener('tasks-updated', () => {
        refreshList();
    });

    document.addEventListener('request-render', (e) => {
        refreshList(e.detail);
    })

}