export const Popover = (contents, id) => {
    const shell = document.createElement('div');
    // Assume that contents is a Node/DOM element.
    if (contents) shell.appendChild(contents);
    shell.setAttribute('popover', '');
    shell.id = id;
    return shell;
}