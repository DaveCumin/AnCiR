function sendMessage(text){
    const newmessage = document.createElement('div');
    newmessage.innerHTML = text;
    const messagesDiv = document.getElementById('messages');
    messagesDiv.append(newmessage);
    messagesDiv.scrollIntoView(false);

}