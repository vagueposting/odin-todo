export const DataHandler = () => {
    // Initialization
    const ToDoList = []
    if (!localStorage.getItem('ToDoList')) {
        localStorage.setItem('ToDoList', JSON.stringify(ToDoList));
    }
    const commonUpdateEvent = new CustomEvent('tasks-updated');

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
            this.createdDate: new Date();
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
                document.dispatchEvent(commonUpdateEvent);
                return true;
            }

            if (Array.isArray(this[property]) && !Array.isArray(change)) {
                return false;
            }

            if (typeof change === typeof this[property]) {
                this[property] = change;
                document.dispatchEvent(commonUpdateEvent);
                return true;
            };
        };

        toggle() {
            this.status = !this.status
        };
    };

    const addTask = (config) => {
        const newTask = new ToDo(config);
        ToDoList.push(newTask);
        document.dispatchEvent(commonUpdateEvent)
    };

    const removeTask = (id) => {
        const taskToRemove = ToDoList.findIndex((task) => task.id === id);

        if (taskToRemove) ToDoList.splice(taskToRemove, 1);
        document.dispatchEvent(commonUpdateEvent);
    };

    const viewList = () => {
        return structuredClone(ToDoList);
    };

    // Helper to save to localStorage
    const saveToStorage = () => {
        const savedList = JSON.parse(localStorage.getItem('ToDoList'));

        if (JSON.stringify(viewList()) != JSON.stringify(savedList)) {
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
        viewList };
}