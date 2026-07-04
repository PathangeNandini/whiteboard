const users=[];

//Add a user to the list
const addUser=({name,roomId,userId,host,presenter})=>{
    const user={name,roomId,userId,host,presenter};
    users.push(user);
    return users.filter((user)=>user.roomId===roomId);
}

//Remove a user from the list
const removeUser=(userId)=>{
    const index=users.findIndex((user)=>user.userId===userId);
    if(index!==-1){
        return users.splice(index,1)[0];
    }
    
}

//Get a user from the list
const getUser=(userId)=>{
    return users.find((user)=>user.userId===userId);
}

//get all users from the room

const getUsersInRoom=(roomId)=>{
    return users.filter((user)=>user.roomId===roomId);
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}