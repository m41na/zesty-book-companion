import React from 'react';
import {shallow} from 'enzyme';
import TodoList from '../../src/components/TodoList';

const initialProps = {
    todos: [{'name': 'biking', completed: false},{name: 'hiking', completed: true}],
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

    describe('render()', () => {
        
        it('should render the component', () => {
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