const users=[]

//add user, remove user, getuser,getusersinroom

const adduser=({ id, username,room})=>{
    //clean the data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //validate the data
    if(!username||!room){
         return {
             error:'username ans room are required'
         }
    }

    //check for existing user
    const existinguser=users.find((user)=>{
        return user.room===room && user.username===username
    })

    //validate username
    if(existinguser){
         return{
             error:'username is in use'
         }
    }

    //store user
    const user={id,username,room}
    users.push(user)
    return{user}

}

const removeuser=(id)=>{
      const index=users.findIndex((user)=>{
         return user.id===id
      })

      if(index!==-1){
          return users.splice(index,1)[0]
      }
}


const getuser=(id)=>{
    return users.find((user)=>{
        return user.id===id
    })
}

const getusersinroom=(room)=>{
     return users.filter((user)=> user.room===room)
}

module.exports={
    adduser,
    removeuser,
    getuser,
    getusersinroom
}