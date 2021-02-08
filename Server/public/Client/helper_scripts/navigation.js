let currentPage = null;
let backStack = [];
let forwardStack = [];
async function navigate(newPage) {
    currentPage = newPage;
    if (newPage) {
        file_table_loader.classList.add('show')
        let files = await getFiles(newPage)
        await setTableList(files, newPage)
    }
}

function linkClicked(page) {
    if (!backStack.includes(currentPage)) {
        backStack.push(currentPage);
    }
    forwardStack = [];
    navigate(page);
}

function goBack() {
    if (!forwardStack.includes(currentPage)) {
        forwardStack.push(currentPage);
    }
    navigate(backStack.pop());
}

function goForward() {
    if (!backStack.includes(currentPage)) {
        backStack.push(currentPage);
    }
    navigate(forwardStack.pop());
}