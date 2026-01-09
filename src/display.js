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
            const controlList = ['new', 'filter', 'sort', 'refresh', 'clear']
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
                { // refresh 
                    d: 'M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z',
                    stroke: 'black'
                },
                {
                    // clear
                    d: 'M21.03,3L18,20.31C17.83,21.27 17,22 16,22H8C7,22 6.17,21.27 6,20.31L2.97,3H21.03M5.36,5L8,20H16L18.64,5H5.36M9,18V14H13V18H9M13,13.18L9.82,10L13,6.82L16.18,10L13,13.18Z',
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
                        applyPopoverTarget(buttonShell, 'filterTasks');
                        break;
                    case 2: // sort
                        applyPopoverTarget(buttonShell, 'sortTasks');
                        break;
                    case 3: // refresh
                        buttonShell.addEventListener('click', function(e) {
                            refreshList();
                        });
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