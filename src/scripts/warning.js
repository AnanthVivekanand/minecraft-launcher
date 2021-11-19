function prependError(type, message) {
    const parent = document.getElementsByClassName("container")[0];
    const types = {
        "wrongPass": "Incorrect email or password!",
        "missingField": "Missing email or password!",
        "genericError": "Woops! There was an error that we didn't handle!",
        "clientCrash": "The Minecraft Client has crashed!"
    };

    let element = document.createElement("div");
    element.className = "backdrop";
    parent.prepend(element);

    let modal = document.createElement("div");
    modal.className = "EM";
    modal.innerHTML = `
       <div class="EM-content">
       <img onclick="closeEM()" src="https://static.thenounproject.com/png/26894-200.png" class="close">
       <p>${types[type]}</p>
       </div>
    `;
    console.warn(message);
    parent.prepend(modal);
}

function closeEM() {
    if(!document.getElementsByClassName("EM")[0] || !document.getElementsByClassName("backdrop")[0]) return;

    document.getElementsByClassName("backdrop")[0].remove();
    document.getElementsByClassName("EM")[0].remove();
}
