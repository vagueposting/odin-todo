import { DataHandler } from "./data.js"

// Test the data handling
const data = DataHandler();
const testTask = {
    title: 'Clean the auditorium',
    description: 'You need to clean the auditorium for the New Year\'s pageant.',
    dueDate: new Date(),
    priority: 'high',
    notes: '',
    subtasks: []
}
data.addTask(testTask);
console.log(data.viewList());