import React from 'react';
import './css/todos.css';

class TodoList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            task: ''
        };
    }
    componentDidMount(){
        this.props.retrieveTasks();
    }
    onCreateTask(e){
        e.preventDefault();
        this.props.createTask(this.state.task);
        this.setState({task: ''});
    }
    onUpdateDone(name, done){
        this.props.updateDone(name, !done);
    }
    onDeleteTask(name){
        this.props.deleteTask(name);
    }
    onChange(e){
        let value = e.target.value;
        this.setState({[e.target.name]: value});
    }
    render(){
        const {todos} = this.props;

        return (
            <div className="wrapper">
                <div id="myDIV" className="header">
                    <h2>My To Do List</h2>
                    <form id="tasks_form" onSubmit={this.onCreateTask.bind(this)}>
                        <input type="text" name="task" placeholder="Title..." value={this.state.task} onChange={this.onChange.bind(this)} />
                        <button type="submit" className="addBtn">Add</button>
                    </form>
                </div>

                <ul id="myUL">
                    {todos && todos.map(e=>
                    <li key={e.name} data-name={e.name} className={e.completed?'checked':''} >
                        <span onClick={()=>this.onUpdateDone(e.name, e.completed)}>{e.name}</span> 
                        <span className="close" onClick={()=>this.onDeleteTask(e.name)}>x</span>
                    </li>
                    )}
                </ul> 
            </div>
        );
    }
}
export default TodoList;