export const DataHandler = () => {
    /* ======== START OF INIT =========== */
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

    const commonUpdateEvent = () => document.dispatchEvent(
        new CustomEvent('tasks-updated'));

    /**
     * @typedef {Object} TaskConfig
     * @property {string} title - the name of the task
     * @property {string} description - description of the task
     * @property {Date} dueDate - due date of the task
     * @property {'low'|'medium'|'high'} - how urgent the task is
     * @property {string} notes - additional information about the task
     * @property {Array<Object>} subtasks - additional 
     */
    class ToDo {
        constructor(config) {
            const { title, description, dueDate, 
                priority, notes, subtasks } = config;

            this.title = title;
            this.id = crypto.randomUUID();
            this.description = description;
            this.createdDate = new Date();
            this.dueDate = dueDate;
            this.priority = priority;
            this.status = false; // Completion state
            this.notes = notes;
            this.subtasks = subtasks;
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

    // Rehydrate the task list
    const ToDoList = rawList.map(taskData => new ToDo(taskData));

    if (!SAVEDATA) {
        localStorage.setItem('ToDoList', JSON.stringify(ToDoList));
    }

    /* ======== END OF INIT =========== */

    const addTask = (config) => {
        const newTask = new ToDo(config);
        ToDoList.push(newTask);
        commonUpdateEvent()
    };

    const removeTask = (id) => {
        const taskToRemove = ToDoList.findIndex((task) => task.id === id);

        if (taskToRemove !== -1) ToDoList.splice(taskToRemove, 1);
        commonUpdateEvent();
    };

    const viewList = () => {
        return structuredClone(ToDoList);
    };

    const clearList = () => {
        ToDoList.length = 0;
        commonUpdateEvent();
    }

    // Helper to save to localStorage
    const saveToStorage = () => {
        const savedList = JSON.parse(localStorage.getItem('ToDoList'));

        if (JSON.stringify(viewList()) !== JSON.stringify(savedList)) {
            localStorage.setItem('ToDoList', JSON.stringify(viewList()));
            return true;
        } else return false;
    };

    // Save whenever list is updated
    document.addEventListener('tasks-updated', saveToStorage);

    // Bonus: Auto-save on page unload
    window.addEventListener('beforeunload', saveToStorage);

    return { addTask, 
        removeTask,
        viewList,
        clearList
    };
}