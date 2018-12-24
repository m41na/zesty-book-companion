const initialState = [];
const rootReducer = (state = initialState, action) => {
    switch(action.type){
        case "CREATE_TASK": {
            return [...state, action.payload]
        }
        case "RETRIEVE_TASKS": {
            return action.payload;
        }
        case "UPDATE_DONE": {
            return state.map(e=> {
                if(e.name == action.payload.name){
                    return action.payload;
                }
                return e;
            });
        }
        case "DELETE_TASK": {
            return action.payload;
        }
        default: {
            return state;
        }
    }
}
export default rootReducer;