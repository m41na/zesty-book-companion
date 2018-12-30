import React from 'react';
import {shallow} from 'enzyme';
import TodoList from '../../src/components/TodoList';

const tasks = [{'name': 'biking', completed: false},{name: 'hiking', completed: true}];

const initialProps = {
    todos: [],
    retrieveTasks(){
        console.log('retrieveTasks');
    },
    createTask(){
        console.log('createTask');
    },
    updateDone(){
        console.log('updateDone');
    },
    deleteTask(){
        console.log('deleteTask');
    }
};

describe('TodoList behavior', () => {

    // describe('when provided with no tasks', () => {        
    //     it('should render the component with an empty list', () => {
    //         const component = shallow(<TodoList {...initialProps} />);
    //         expect(component).toMatchSnapshot();        

    //         //assert component contains "list" element
    //         expect(component).toContainReact(<ul/>);

    //         //assert list element has no children
    //         let text = component.first().find("span").first().text();
    //         expect(component.find("ul li").length).toEqual(0);
    //     });
    // });

    describe('when provided with initial tasks', () => {        
        it('should render the component with list items', () => {
            initialProps.todos.concat(tasks);
            const component = shallow(<TodoList {...initialProps}/>);
            expect(component).toMatchSnapshot();        

            //assert list has two tasks
            const list = component.find("#myUL li");
            expect(list).toHaveLength(2);

            //assert first list item is 'biking'
            let text = component.first().find("span").first().text();
            expect(text).toBe('biking');
        });
    });
});