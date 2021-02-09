
let currentUrl = Host_domain+`/public`;

function init() {

    file_list_loader.classList.add('show')
    file_table_loader.classList.add('show')
    getFiles(Host_domain+'/public')
        .then(res => {
            // setTableList(res,currentUrl);
            linkClicked(currentUrl)
            file_list_left.innerHTML = '';
            file_list_left.appendChild(parseTree(res.tree))
            file_list_loader.classList.remove('show')
            move_file_list.innerHTML = '';
            move_file_list.appendChild(parseTree(res.tree));
            setEvents(true);
        })
}
document.getElementById('homeBTN').addEventListener('click', (e) => {
    linkClicked(Host_domain+'/public')
    e.stopPropagation();
})
let move_source = document.querySelector('.source');
let move_destination = document.querySelector('.destination');
init();

function setEvents(leftside = false) {
    document.querySelectorAll('.side_folder').forEach(folder => {
        if (leftside) {
            folder.addEventListener("click", async (e) => {
                if (e.target.className == "item-icon") {
                    if (folder.getAttribute('data-open') == "false") {
                        folder.setAttribute('data-open', true);
                    } else if (folder.getAttribute('data-open') == "true") {
                        folder.setAttribute('data-open', false);
                    }
                } else {
                    $('.selectedfolder').removeClass('selectedfolder');
                    folder.classList.toggle('selectedfolder')
                    move_destination.textContent = folder.getAttribute('data-link').replaceAll('\\', '/') + '/' + getSelectedFileNames()[0];
                    move_source.textContent = getSelectedFilelinks()[0];
                    if (!move_file_modal.classList.contains('show')) {
                        file_table_loader.classList.add('show')
                        let link = folder.getAttribute('data-link')
                        let files = await getFiles(link)
                        linkClicked(link)
                    }
                }
                e.stopPropagation()
            })
        }
    })
    let indirs = document.querySelectorAll(`tr[data-type="dir"]`);
    if (indirs) {
        document.querySelectorAll(`tr[data-type="dir"]`).forEach(folder => {
            folder.addEventListener("dblclick", async (e) => {
                let link = folder.getAttribute('data-link')
                let files = await getFiles(link)
                linkClicked(link)
            })
        })
    }
}
//edit file
editor_btn.addEventListener('click', async (e) => {
    let current_file = '';
    fetch(getSelectedFilelinks()[0]).then(res => {
        fmEditor.showLoading();
        current_file = res.headers.get('file-link');
        let type = res.headers.get('Content-Type');
        if (type.includes('text') || type.includes('application')) {
            return res.text();
        } else {
            throw new Error("This file is not editable,download it.")
        }
    }).then(content => {
        fmEditor.set(content);
        modalEditor.setAttribute('data-currentFile', current_file)
        fmEditor.hideLoading();
    }).catch(e => {
        modal_overaly.classList.remove('show');
        modalEditor.classList.remove('show');
        alert(e.message)
    })
})
//remove
rm_btn.addEventListener('click', async (e) => {
    let files = getSelectedFilelinks();
    let deletions = [];
    for (let file of files) {
        console.log(file)
        deletions.push(fetch(file, {
            method: 'DELETE'
        }))
    }
    Promise.all(deletions).then(res => {
        document.getElementById('removeFileModal').classList.remove('show');
        modal_overaly.classList.remove('show');
        console.log(res.status);
        refreshtable();
    })
})
saveEdit.addEventListener('click', async (e) => {
    fmEditor.showLoading()
    let saved = await updateAddFile(modalEditor.getAttribute('data-currentfile'), fmEditor.get(), 'PUT');
    console.log('res:', saved)
    setAlert('#editorModal');
    if (saved) {
        fmEditor.hideLoading()
        succesAlert("File updated")
    } else {
        fmEditor.hideLoading()
        failAlert("Saving Failed, check server connection.")
    }
    setTimeout(() => {
        editorMessages.classList.toggle('show')
    }, 7000)
})
//addFile
const addFileBtn = document.getElementById('addFileBtn');
const addFileInput = document.getElementById('fileName')
addFileBtn.addEventListener('click', async (e) => {
    setAlert('#addFileModal');
    console.log(currentUrl + '/' + addFileInput.value);
    let saved = await updateAddFile(currentUrl + '/' + addFileInput.value.replace(/[ \)\(]/gi, '_'), '', 'PUT');
    console.log('res:', saved)
    if (saved) {
        succesAlert('File added')
        addFileInput.value = '';
        refreshtable();
    } else {
        failAlert("Failed, check server connection.")
    }
})
//addFolder
addFolderBtn.addEventListener('click', async (e) => {
    setAlert('#addFolderModal');
    succesAlert('Adding...', 2000)
    console.log(currentUrl + '/' + addFolderInput.value);
    let saved = await updateAddFile(currentUrl + '/' + addFolderInput.value.replace(/[\. \)\(]/gi, '_'), '', 'MKCOL');
    console.log('res:', saved)
    if (saved) {
        succesAlert('Folder added')
        addFolderInput.value = '';
        await refreshtable();
    } else {
        failAlert("Failed, check server connection.")
    }
})
//uploadFiles
uploadFilesBtn = document.getElementById('uploadFilesBtn');
uploadFilesBtn.addEventListener('change', async (e) => {
    let filestats = '';
    for (let file of fileform.fileuploads.files) {
        console.log(file.size)
        if (file.size > 1000000000) {
            console.log(file.name + ' too big,cancelled')
            continue;
        }
        filestats += getUploadingfileTemplate(file);
    }
    filestatsContainer.innerHTML = filestats;
})
uploadBtn.addEventListener('click', async (e) => {
    for (let file of fileform.fileuploads.files) {
        if (file.size > 1000000000) {
            console.log(file.name + ' too big,cancelled')
            continue;
        }
        await uploadFile(currentUrl + '/' + file.name, await readBuffer(file), 'PUT', file.name);
    }
})
//renamefile
renameFileBtn.addEventListener('click', async (e) => {
    let currentDir = currentUrl.replace(window.location.origin, '');
    let nameFor = document.querySelector(`#renameFileModal .name-for`).textContent;
    let newName = document.querySelector(`#renameFileModal #newFileName`).value || nameFor;
    let toName = currentDir + '/' + newName
    let currentFile = currentDir + '/' + nameFor;
    console.log({
        currentFile,
        currentDir,
        nameFor,
        newName,
        toName
    });
    if (await updateAddFile(currentFile, JSON.stringify({
        toName: currentDir + '/' + newName
    }), 'MOVE')) {
        document.querySelector(`#renameFileModal .btn-icon-reset`).click();
        refreshtable()
    } else {
        document.querySelector(`#renameFileModal .btn-icon-reset`).click();
        console.log('something wrong');
    }
})
//move file or folder
moveFileBtn.addEventListener('click', async (e) => {
    let from = move_source.textContent.trim();
    let to = JSON.stringify({
        toName: move_destination.textContent.trim().replaceAll('\\', '/')
    })
    console.log({
        from,
    });
    updateAddFile(from, to, 'MOVE').then(() => {
        fetch(from, {
            method: 'DELETE'
        }).then(() => {
            document.querySelector('#moveFileModal .close').click();
            refreshtable()
        })
    })
})
document.querySelector('#uploadModal .close').addEventListener('click', () => {
    fileform.reset();
    filestatsContainer.innerHTML = '';
})
document.querySelector(`#uploadModal .cancel`).addEventListener('click', () => {
    fileform.reset();
    filestatsContainer.innerHTML = '';
})
//file info
infoBtn.addEventListener('click', async (e) => {
    console.log('started')
    let files = await getFiles(currentUrl);
    let file = files.list.filter(file => file.name === getSelectedFileNames()[0]);
    let info = '' + getfileInfoTemplate(file[0]);
    document.querySelector('#infoFileModal .modal-body').innerHTML = info;
    console.log('added')
})
//download
downloadBTN.addEventListener('click', (e) => {
    let selectedFilelinks = getSelectedFilelinks();
    let fileNames = getSelectedFileNames();
    selectedFilelinks.forEach((file, idx) => {
        fetch(file).then(res => res.blob()).then(content => {
            console.log(fileNames[idx], 'format:' + content.type)
            downloadFile(content, fileNames[idx], content.type);
        })
    })
})
document.querySelector('#backBTN').addEventListener('click', goBack)
document.querySelector('#forwardBTN').addEventListener('click', goForward)

async function setTableList(files, link = currentUrl) {
    if (forwardStack.length == 0 || (forwardStack.length == 1 && forwardStack[0] == null)) {
        document.querySelector('#forwardBTN').classList.add('nonav')
    } else {
        document.querySelector('#forwardBTN').classList.remove('nonav')
    }
    if (backStack.length == 0 || (backStack.length == 1 && backStack[0] == null)) {
        document.querySelector('#backBTN').classList.add('nonav')
    } else {
        document.querySelector('#backBTN').classList.remove('nonav')
    }
    currentUrl = link;
    document.querySelector('.uploading-folder').textContent = currentUrl;
    let trs = ''
    for (let file of files.list) {
        trs += getTemplateExpanded(file);
    }
    files_table.innerHTML = trs;
    setEvents();
    file_table_loader.classList.remove('show')
}