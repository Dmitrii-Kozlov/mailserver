document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email(null));

  // By default, load the inbox
  load_mailbox('inbox');
});

document.addEventListener('click', event => {
                const element = event.target;
                if (element.className === 'mail') {
                   showMail(element.dataset.id)
                } else if (element.className === 'unread'){
                    markUnread(element.parentElement)
                } else if (element.className === 'archive'){
                        archiveMail(element.parentElement)
                } else if (element.className === 'unarchive'){
                        unarchiveMail(element.parentElement)
                }
                if (element.id === 'reply') {
                    compose_email(element.dataset.id)
                }
                })

function unarchiveMail(element) {
fetch(`/emails/${element.dataset.id}`, {
  method: 'PUT',
  body: JSON.stringify({
      archived: false
  })
})
        element.style.animationPlayState = 'running';
                    element.addEventListener('animationend', () =>  {
                        element.remove();
                    });
  //load_mailbox('inbox')
}

function archiveMail(element) {
 fetch(`/emails/${element.dataset.id}`, {
  method: 'PUT',
  body: JSON.stringify({
      archived: true
  })
})
    element.style.animationPlayState = 'running';
                    element.addEventListener('animationend', () =>  {
                        element.remove();
                    });
 // load_mailbox('inbox')
}

function markUnread(element) {
        fetch(`/emails/${element.dataset.id}`, {
  method: 'PUT',
  body: JSON.stringify({
      read: false
  })
})
element.style.backgroundColor = 'white'
}

  function showMail(id) {
    document.querySelector('#emails-view').innerHTML = ''
      fetch(`/emails/${id}`)
.then(response => response.json())
.then(email => {
    // Print email
    console.log(email);

    // ... do something else with email ...

    const mail_sender = document.createElement('div');
                mail_sender.innerHTML = `From: ${email.sender} `;
    const mail_recipients = document.createElement('div');
                mail_recipients.innerHTML = `To: ${email.recipients} `;
    const mail_title = document.createElement('div');
                mail_title.innerHTML = `Subject: ${email.subject}`;
    const mail_timestamp = document.createElement('div');
                mail_timestamp.innerHTML = `Timestamp: ${email.timestamp}`;
    const hr = document.createElement('div');
    const mail_text = document.createElement('hr')
                mail_text.innerText = `${email.body}`;
    const reply_button = document.createElement('button');
                reply_button.innerHTML = `Reply`;
                reply_button.className = 'btn btn-sm btn-outline-primary'
                reply_button.id = 'reply'
                reply_button.dataset.id = email.id
                // Add mail to DOM
    document.querySelector('#emails-view').append(mail_sender);
    document.querySelector('#emails-view').append(mail_recipients);
    document.querySelector('#emails-view').append(mail_title);
    document.querySelector('#emails-view').append(mail_timestamp);
    document.querySelector('#emails-view').append(reply_button);
    document.querySelector('#emails-view').append(hr);
    document.querySelector('#emails-view').append(mail_text);

})
      fetch(`/emails/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
      read: true
  })
})

  }

function compose_email(mail_id=null) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  if (mail_id) {
      fetch(`/emails/${mail_id}`)
.then(response => response.json())
.then(email => {
    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    document.querySelector('#compose-body').value = `
    
    On ${email.timestamp} ${email.sender} wrote:
     ${email.body} 
     ------------------------`
})
  }

  document.querySelector('#send_mail').addEventListener('click', () => {

      const recipients = document.querySelector('#compose-recipients').value;
      const subject = document.querySelector('#compose-subject').value;
      const body = document.querySelector('#compose-body').value;

      fetch('/emails', {
          method: 'POST',
          body: JSON.stringify({
              recipients: recipients,
              subject: subject,
              body: body
          })
      })
          .then(response => response.json())
          .then(result => {
              // Print result
              console.log(result);
          });
  })


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
.then(response => response.json())
.then(emails => {
    // Print emails
    console.log(emails);

    // ... do something else with emails ...
    emails.forEach(addEmail)
});
  function addEmail(email) {
     const mail = document.createElement('div');
                mail.className = 'mail';
                mail.dataset.id = email.id

                if (mailbox === 'inbox') {
                    mail.innerHTML = `From "${email.sender}" subject "${email.subject}" on ${email.timestamp} 
                                            <button class="unread">Unread</button>
                                            <button class="archive">Archive</button>`;
                } else if (mailbox === 'sent'){
                    mail.innerHTML = `To "${email.recipients}" subject ${email.subject} on ${email.timestamp}`;
                } else if (mailbox === 'archive'){
                    mail.innerHTML = `From "${email.sender}" subject ${email.subject} on ${email.timestamp} 
                                            <button class="unarchive">Unarchive</button>`
                }
                if (email.read) {
                    mail.style.backgroundColor = 'gray'
                }
                // Add mail to DOM
                document.querySelector('#emails-view').append(mail);
  }

}