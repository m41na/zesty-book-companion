export const retrieveTasks = (tasks) => ({
    type: "RETRIEVE_TASKS",
    payload: tasks
});
export const createTask = (task) => ({
    type: "CREATE_TASK",
    payload: task
});
export const updateDone = (task) => ({
    type: "UPDATE_DONE",
    payload: task
});
export const deleteTask = (name) => ({
    type: "DELETE_TASK",
    payload: name
});