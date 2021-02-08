
const file_list_left = document.getElementById('file_list_left');
const files_table = document.querySelector('#file_table');
const editor_btn = document.querySelector('#editor_btn')
const rm_btn = document.querySelector('#removeFileBtn')
const modal_overaly = document.querySelector('.modal-overlay');
const modalEditor = document.querySelector('#editorModal');
let editorMessages = document.querySelector(`#editorModal .alert`);
const file_list_loader = document.querySelector('.files-section .loader')
const file_table_loader = document.querySelector('.table-section .loader')
const move_file_modal = document.querySelector('#moveFileModal');

const saveEdit = document.querySelector('#updateFileBtn')
const move_file_list = document.querySelector('#moveFileModal .files-list-move');
const moveFileBtn = document.querySelector('#moveFileBtn');
const infoFileModal = document.querySelector('#infoFileModal');
const infoBtn = document.querySelector('#infoBtn');
const downloadBTN = document.querySelector('#downloadBTN');
const addFolderBtn = document.getElementById('addFolderBtn');
const addFolderInput = document.getElementById('folderName')
const fileform = document.getElementById('uploadFilesForm');
const uploadBtn = document.getElementById('uploadBtn');
const filestatsContainer = document.querySelector('.fm-wrapper .upload-modal .files-to-upload');
const renameFileBtn = document.getElementById('renameFileBtn');

let htmlToNode = new DOMParser()