export const StateHandler = () => {
    const appState = {
        sort: false,
        filter: false,
        subtaskBeingCreated: false
    };

    // List views

    document.addEventListener('list-filtered', () => {
        appState.filter = true;
    });

    document.addEventListener('list-sorted', () => {
        appState.sort = true;
    });

    document.addEventListener('view-reset', () => {
        appState.filter = false;
        appState.sort = false;
    });

    // Subtask state tracker

    document.addEventListener('subtask-being-created', () => {
        appState.subtaskBeingCreated = true;
    })

    document.addEventListener('submit-subtask', () => {
        appState.subtaskBeingCreated = false;
    })
};