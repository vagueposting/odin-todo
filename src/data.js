import { isAfter, isBefore, isSameDay } from 'date-fns';

export const DataHandler = (state) => {
    /* ======== START OF MAIN INIT =========== */
    const SAVEDATA = localStorage.getItem('ToDoList');
    let rawList = [];

    try {
        rawList = SAVEDATA ? JSON.parse(SAVEDATA) : [];
        if (!Array.isArray(rawList)) throw new Error(
            'Stored data is not an array');
    } catch (error) {
        console.warn(
            'Failed to parse saved data, starting fresh:',
             error.message);
        rawList = [];
        localStorage.removeItem('ToDoList');
    }    

    const updateEvent = new CustomEvent('tasks-updated');
    const commonUpdateEvent = () => { document.dispatchEvent(updateEvent) };

    /**
     * @typedef {Object} TaskConfig
     * @property {string} title - the name of the task
     * @property {string} description - description of the task
     * @property {Date} dueDate - due date of the task
     * @property {'low'|'medium'|'high'} priority - how urgent the task is
     * @property {Array<Object>} subtasks - additional 
     * @property {Array<String>} tags - tags
     */
    class ToDo {
        constructor(config) {
            const { title, description, dueDate, 
                priority, subtasks, tags } = config;

            this.title = title;
            this.id = crypto.randomUUID();
            this.description = description;
            this.createdDate = new Date;
            this.dueDate = dueDate;
            this.priority = priority;
            this.status = false; // Completion state
            this.subtasks = subtasks;
            this.tags = tags;

            this.__isSubtask = this instanceof Subtask;
        };

        edit(property, change) {
            if (!(property in this)) {
                return false;
            }

            if (this[property] === null || this[property] === undefined) {
                this[property] = change;
                commonUpdateEvent();
                return true;
            }

            if (Array.isArray(this[property]) && !Array.isArray(change)) {
                return false;
            }

            if (typeof change === typeof this[property]) {
                this[property] = change;
                commonUpdateEvent();
                return true;
            };
        };

        toggle() {
            this.status = !this.status
            commonUpdateEvent();
        };
    };

    class Subtask extends ToDo {
        constructor(config) {
            super(config);

            this.subtasks = null;
        }

        addSubtask() {
            throw new Error('Subtasks cannot have sub-subtasks of their own.')
        }

        removeSubtask() {
            throw new Error('Subtasks do not have sub-subtasks of their own.')
        }
    }

    /* Adding new methods to account for Subtask */
    ToDo.prototype.addSubtask = function(config) {
        this.subtasks.push(new Subtask(config));
        commonUpdateEvent();
    };

    ToDo.prototype.removeSubtask = function(id) {
        const subtaskToRemove = this.subtasks.findIndex(task => task.id === id);
        if (subtaskToRemove !== 1) this.subtasks.splice(subtaskToRemove, 1);
        commonUpdateEvent();
    }
    /* Adding new methods to account for Subtask */

    // Rehydrate helper
    const rehydrateTask = (data) => {
        const config = {
            ...data,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            createdDate: data.createdDate ? new Date(data.createdDate) : new Date()
        };
        
        const isSubtask = config.subtasks === null || config.__isSubtask;
        const task = isSubtask ? new Subtask(config) : new ToDo(config);
        
        if (task.subtasks && Array.isArray(task.subtasks)) {
            task.subtasks = task.subtasks.map(sub => rehydrateTask(sub));
        }
        return task;
    };

    // Rehydrate the entire list
    const ToDoList = rawList.map(taskData => rehydrateTask(taskData));
   
    if (!SAVEDATA) {
        localStorage.setItem('ToDoList', JSON.stringify(ToDoList));
    }

    /* ======== END OF MAIN INIT =========== */

    const addTask = (config) => {
        const newTask = new ToDo(config);
        ToDoList.push(newTask);
        commonUpdateEvent();
    };

    const removeTask = (id) => {
        const taskToRemove = ToDoList.findIndex((task) => task.id === id);

        if (taskToRemove !== -1) ToDoList.splice(taskToRemove, 1);
        commonUpdateEvent();
    };

    const viewList = () => {
        return structuredClone(ToDoList);
    };

    /**
     * Returns a list of tasks but filtered according to parameters.
     * Use 'null' for filters that are not in use.
     * @param {Array<Object>} list - specific list array object to be filtered through. use 'null' if starting from scratch.
     * 
     * @param {Object} filters - object containing all filters
     * @property {Object} title - search query for title
     *      @property {string} query - text being searched for
     *      @property {'INCLUDES' | 'EXCLUDES'} type - query type
     * @property {Object} createdDate - search query for creation date
     *      @property {Date} query - date being searched for
     *      @property {'BEFORE' | 'DURING' | 'AFTER'} type - query type
     * @property {Object} dueDate - search query for dueDate
     *      @property {Date} query - date being searched for
     *      @property {'BEFORE' | 'DURING' | 'AFTER'} type - query type
     * @property {'low' | 'medium' | 'high'} priority - query for priority
     * @property {Boolean} status - completion state of task
     * @property {Object} tags - query list for tags
     *      @property {Array<string>} tagList - list of tags
     *      @property {'INCLUDES' | 'EXCLUDES'} type - query direction
     *      @property {'SOME' | 'ALL'} typeScope - scope of query
     */
    const filterList = (list = null, filters) => {
        let filteredList = list === null ? viewList() : list;
        const { title, createdDate, dueDate, priority, status, tags } = filters;

        /**
         * date helper. use for either dueDate or createdDate
         * @param {Object} filter - object representing a date filter query
         * @param {'dueDate' | 'createdDate' } category - specific date query
         */
        const dateFilter = (filter, category) => {
            const { query, type } = filter;

            switch (type) {
                case 'BEFORE':
                    filteredList = filteredList.filter((task) => 
                        isBefore(task[category], query)
                    );
                    break;
                case 'DURING':
                    filteredList = filteredList.filter((task) => 
                        isSameDay(task[category], query)
                    );
                    break;
                case 'AFTER':
                    filteredList = filteredList.filter((task) => 
                        isAfter(task[category], query)
                    );
                    break;
            }
        };

        /* Individual filters */

        if (title) {
            switch (title.type) {
                case 'INCLUDES':
                    filteredList = filteredList.filter(
                        (task) => task.title.includes(title.query)
                    )
                    break;
                case 'EXCLUDES':
                    filteredList = filteredList.filter(
                        (task) => !task.title.includes(title.query)
                    )
                    break;
                default:
                    console.error('The filter did not include a query type').
                    break;
            };
        };

        if (createdDate) {
            if (createdDate.query instanceof Date) dateFilter(createdDate, 'createdDate')
        }

        if (dueDate) {
            if (dueDate.query instanceof Date) dateFilter(dueDate, 'dueDate');
        }

        if (priority) {
            const options = ['low', 'medium', 'high']

            if (options.includes(priority)) {
                filteredList = filteredList.filter(
                    (task) => task.priority === priority);
            }
        };

        if (status != null) {
            filteredList = filteredList.filter((task) => task.status === status);
        };

        if (tags) {
            const  { tagList, type, typeScope } = tags; // 'tagList' is an array.
            switch (type) {
                case 'INCLUDES':
                    switch (typeScope) {
                        case 'SOME':
                            filteredList = filteredList.filter((task) => 
                                task.tags.some(t => tagList.includes(t)));
                            break;
                        case 'ALL':
                            filteredList = filteredList.filter((task) => 
                                tagList.every(t => task.tags.includes(t)));
                            break;
                    };
                    break;
                case 'EXCLUDES':
                    switch (typeScope) {
                        case 'SOME':
                            throw new Error('Ambiguous filtering logic');
                            break;
                        case 'ALL':
                            filteredList = filteredList.filter((task) =>
                                !task.tags.some(t => tagList.includes(t)));
                            break;
                    };
                    break;
            }
        }

        return filteredList;
    }

    const sortList = (list = null, sortBy = 'DUE', direction = 'DESC') => {
        const sourceList = list === null ? viewList() : list;
        const itemsToSort = [...sourceList]; 

        return itemsToSort.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'TITLE':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'CREATE':
                    comparison =  a.createdDate - b.createdDate;
                    break;
                case 'DUE':
                    comparison = a.dueDate - b.dueDate;
                    break;
                case 'PRIORITY':
                    const weights = { high: 3, medium: 2, low: 1 };
                    comparison = weights[a.priority] - weights[b.priority];
                    break;
                case 'SUBTASKS':
                    // Sort by how many subtasks you have
                    comparison = a.subtasks.length - b.subtasks.length;
                    break;
                case 'TAGS':
                    // Same logic. Sort by how many tasks you have
                    comparison = a.tags.length - b.tags.length;
                    break;
            }

            return direction === 'ASC' ? comparison : -comparison;
        });

        return itemsToSort;
    };

    const clearList = () => {
        ToDoList.length = 0;
        commonUpdateEvent();
    }

    // Helper to save to localStorage
    const saveToStorage = () => {
        localStorage.setItem('ToDoList', JSON.stringify(ToDoList));
    };

    // Add a task when this is heard.
    document.addEventListener('task-added', function(e) {
        if (e.detail.title === '') {
            return;
        };

        addTask(e.detail);
    })

    document.addEventListener('list-filtered', function(e) {
        const { list, config } = e.detail;
        const filteredResult = filterList(list, config);

        document.dispatchEvent(new CustomEvent('request-render', {
            detail: filteredResult
        }));
    });

    document.addEventListener('list-sorted', function (e) {
        const { list, sortBy, direction } = e.detail;

        const sortedList = sortList(list, sortBy, direction);

        document.dispatchEvent(new CustomEvent('request-render', {
            detail: sortedList
        }));
    });

    document.addEventListener('toggle-task', function (e) {
        const target = ToDoList.find(task => task.id === e.detail);

        if (target) target.toggle();
    });

    document.addEventListener('clear-list', clearList);

    // Save whenever list is updated
    document.addEventListener('tasks-updated', saveToStorage);

    // Auto-save on page unload
    window.addEventListener('beforeunload', saveToStorage);

    return { // addTask, 
        removeTask,
        viewList,
        // sortList ,
        // filterList,
        // clearList
    };
}