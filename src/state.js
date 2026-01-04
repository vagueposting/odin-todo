export const StateHandler = (data) => {
    const appState = {
        sort: false,
        filter: false
    };

    document.addEventListener('list-filtered', () => {
        appState.filter = true;
    });

    document.addEventListener('list-filtered', () => {
        appState.sort = true;
    });

    document.addEventListener('view-reset', () => {
        appState.filter = false;
        appState.sort = false;
    });
};