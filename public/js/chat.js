const socket=io()

//Elements
const $messageform = document.querySelector('#messageform')
const $messageforminput=$messageform.querySelector('input')
const $messageformbutton=$messageform.querySelector('button')
const $sendlocationbutton=document.querySelector('#location')
const $messages=document.querySelector('#messages')

//templates
const messagetemplate=document.querySelector('#message-template').innerHTML
const locationmessagetemplate=document.querySelector("#location-message-template").innerHTML
const sidebartemplate=document.querySelector('#sidebar-template').innerHTML

//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{
    $messages.scrollTop= $messages.scrollHeight
    // //New msg element
    // const $newmessage=$messages.lastElementChild

    // //Height of the new message
    // const newmessagestyles=getComputedStyle($newmessage)
    // const newmessagemargin=parseInt(newmessagestyles.marginBottom)
    // const newmessageh=$newmessage.offsetHeight + newmessagemargin

    // //visible height
    // const visibleheight=$messages.offsetHeight

    // //height of messages container
    // const containerheight= $messages.scrollHeight

    // //how far have i scroll
    // const scrolloffset=$messages.scrollTop + visibleheight

    // if(containerheight-newmessageh<= scrolloffset){
    //     $messages.scrollTop= $messages.scrollHeight
    // }
}

socket.on('message',(message)=>{
     console.log(message)
     const html=Mustache.render(messagetemplate,{
         username:message.username,
         message:message.text,
         createdat:moment(message.createdate).format('h:mm A')
     })
     $messages.insertAdjacentHTML('beforeend',html)
     autoscroll()
})

socket.on('locationmessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationmessagetemplate,{
        username:message.username,
        url:message.url,
        createdat:moment(message.createdat).format('h:mm: A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomdata',({room,users})=>{
    const html=Mustache.render(sidebartemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})


$messageform.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageformbutton.setAttribute('disabled','disabled')
    //Disable
    const message=e.target.elements.message.value

    socket.emit('sendmessage',message,(error)=>{
        $messageformbutton.removeAttribute('disabled')
        $messageforminput.value=''
        $messageforminput.focus()
        if(error){
            return console.log(error)
        }

        console.log('Message Deliverd')
    })
})

$sendlocationbutton.addEventListener('click',()=>{
       if(!navigator.geolocation){
           return alert('Geolocaction is not supported by your browser')
       }

       $sendlocationbutton.setAttribute('disabled','disabled')

       navigator.geolocation.getCurrentPosition((position)=>{
         socket.emit('sendlocation',{
             lattitude:position.coords.latitude,
             longitude:position.coords.longitude
         },()=>{
             $sendlocationbutton.removeAttribute('disabled')
             console.log('Location shared')
         })
       })
})

socket.emit('join',{username,room},(error)=>{
     if(error){
         alert(error)
         location.href='/'
     }
})