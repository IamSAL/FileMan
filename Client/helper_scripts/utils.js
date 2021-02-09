const cache=new Map();
function parseTree(tree) {
    let ul = document.createElement('ul')
    ul.className = "sub-files"
    tree.children.map(child => {
        let type = child.type;
        let li1 = document.createElement('li')
        li1.appendChild(htmlToNode.parseFromString(type == "file" ? getFileIcon() : "<span></span>", "text/html").documentElement.children[1].children[0])
        li1.className = type == "file" ? "file-item item side_file" : "dir-item item side_folder"
        li1.setAttribute('data-link', Host_domain+pathToURL(child.path))
        type == "directory" ? li1.setAttribute('data-open', false) : null;
        if (child.children) {
            ul.prepend(parseTree(child))
        }
        let span = document.createElement('span')
        span.innerHTML = type == "directory" ? `<span class="item-icon">` + '📁' + `</span>` + child.name.substr(0, 17) : ' ' + child.name.substr(0, 17)
        // span.textContent=child.name.substr(0,3)+`${child.type=="file"?child.extension:""}`;
        li1.appendChild(span)
        ul.prepend(li1);
    })
    return ul;
}
function succesAlert(msg, timeout = 7000) {
    editorMessages.classList.remove('error')
    editorMessages.classList.add('success')
    editorMessages.innerHTML = msg
    editorMessages.classList.add('show')
    hideAlert(timeout)
}


function failAlert(msg, timeout = 7000) {
    editorMessages.classList.remove('success')
    editorMessages.classList.add('error')
    editorMessages.innerHTML = msg;
    editorMessages.classList.add('show')
    hideAlert(timeout)
}

function hideAlert(time) {
    setTimeout(() => {
        editorMessages.classList.toggle('show')
    }, time)
}

function setAlert(current) {
    editorMessages = document.querySelector(`${current} .alert`);
}
async function refreshtable() {
    // file_table_loader.classList.add('show')
    cache.clear();
    init()
    // linkClicked(currentUrl);

}
async function getFiles(url) {
    if(cache.has(url)){
        return cache.get(url);
    }else{
        let files = await fetch(url)
        let res=await files.json();
        cache.set(url,res)
        return res;
    }
}

function pathToURL(path) {
    // return path.match(/\\public\\.*/g)[0]
    return encodeURI(path.match(/\/public\/.*/g)[0]);

}
//copyright:https://gist.github.com/davalapar/d0a5ba7cce4bc599f54800da22926da2
function downloadFile(data, filename, mime) {
    const blob = new Blob([data], {
        type: mime || 'application/octet-stream'
    });
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
        window.navigator.msSaveBlob(blob, filename);
        return;
    }
    const blobURL = window.URL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.style.display = 'none';
    tempLink.href = blobURL;
    tempLink.setAttribute('download', filename);
    if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
    }
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    setTimeout(() => {
        window.URL.revokeObjectURL(blobURL);
    }, 100);
}

function getSelectedFilelinks() {
    return Array.from(document.querySelectorAll('tr.file-item.selected')).map(file => file.getAttribute('data-link'))
}

function getSelectedFileNames() {
    return Array.from(document.querySelectorAll('tr.file-item.selected')).map(file => file.getAttribute('data-name'))
}

function readBuffer(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.addEventListener("load", () => {
            resolve(reader.result);
        })
        reader.addEventListener("error", () => {
            reject(reader.error)
        })
        reader.readAsArrayBuffer(file)
    })
}
async function uploadFile(url, content, method, fileName = 'DumbFile') {
    let request = new XMLHttpRequest();
    request.open(method, url);
    // upload progress event
    request.upload.addEventListener('progress', function (e) {
        let percent_complete = (e.loaded / e.total) * 100;
        // percentage of upload completed
        document.querySelector(`#${fileName.replace(/[\. \)\(]/gi, '_')} .upload-state`).textContent = percent_complete == 100 ? "uploaded " : "Uploading...";
        document.querySelector(`#${fileName.replace(/[\. \)\(]/gi, '_')} .percentage`).textContent = `${percent_complete}%`;
        document.querySelector(`#${fileName.replace(/[\. \)\(]/gi, '_')} .progress-bar`).style.width = `${percent_complete}%`
    });
    request.addEventListener('error', (e) => {
        console.log(e)
        document.querySelector(`#${fileName.replace(/[\. \)\(]/gi, '_')} .upload-error`).style.display = "block";
    })
    // AJAX request finished event
    request.addEventListener('load', function (e) {
        // HTTP status message
        console.log(request.status);
        // request.response will hold the response from the server
        console.log(request.response);
    });
    // send POST request to server side script
    request.send(content);
}
async function updateAddFile(url, content, method, header = {}) {
    return fetch(url, {
        method: method.toUpperCase(),
        mode: 'cors',
        headers: header,
        body: content
    }).then(res => {
        console.log(res.status)
        return true;
    }).catch(e => {
        console.log(e.toString())
        return false;
    })
}