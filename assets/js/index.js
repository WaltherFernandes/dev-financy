const Modal = {
    open() {
        document.querySelector('div.modal-overlay').classList.add('active');
    },
    close() {
        document.querySelector('div.modal-overlay').classList.remove('active');
    }
}