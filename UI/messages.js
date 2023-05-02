function sendMessage(text){
    const newmessage = document.createElement('div');
    newmessage.innerHTML = text;
    document.getElementById('messages').append(newmessage)
}