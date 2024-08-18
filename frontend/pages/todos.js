// page to display todo list
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import Alert from '../components/Alert';
import apiFetch from '../functions/apiFetch';
import { updateTodoError, updateTodoSuccess, clearTodoAlerts } from '../actions/todo';
import { Colours, Typography } from '../definitions';
import Link from 'next/link';

const Todos = () => {
    const [todos, setTodos] = useState([]);
    const [filter, setFilter] = useState('all');
    const todoState = useSelector((state) => state.todo);
    const dispatch = useDispatch();

    // fetch todo list according to the status given by the user
    const fetchTodos = async () => {
        let query = '';
        if (filter === 'completed') {
            query = '?completed=true';
        } else if (filter === 'incomplete') {
            query = '?completed=false';
        }

        const response = await apiFetch(`/todo${query}`, { method: "GET" });
        if (response.status === 200) {
            setTodos(response.body);
        } else {
            dispatch(updateTodoError({ error: response.body.error }));
        }
    };

    useEffect(() => {
        fetchTodos();
    }, [filter, dispatch]);

    // toggle todo status
    const toggleTodoStatus = async (todoID, completed) => {
        const response = await apiFetch(`/todo/${todoID}`, {
            method: "PATCH",
            body: { completed: !completed },
        });

        if (response.status === 200) {
            fetchTodos();
            dispatch(updateTodoSuccess({ success: "Todo status updated." }));
        } else {
            dispatch(updateTodoError({ error: response.body.error }));
        }
    };

    // delete a todo
    const deleteTodo = async (todoID) => {
        const response = await apiFetch(`/todo/${todoID}`, {
            method: "DELETE",
        });

        if (response.status === 200) {
            fetchTodos();
            dispatch(updateTodoSuccess({ success: "Todo deleted successfully." }));
        } else {
            dispatch(updateTodoError({ error: response.body.error }));
        }
    };

    // display info if the todo list is empty
    const renderEmptyState = () => {
        let message = '';
        switch (filter) {
            case 'completed':
                message = 'No completed tasks to show.';
                break;
            case 'incomplete':
                message = 'No incomplete tasks to show.';
                break;
            default:
                message = 'No tasks to show.';
                break;
        }
        return <EmptyState>{message}</EmptyState>;
    };


    return (
        <PageLayout title="My Todos">
            <Container>
                <h1>My Todos</h1>
                <Alert message={todoState.alerts.error} onClose={() => dispatch(clearTodoAlerts())} />
                <Alert message={todoState.alerts.success} onClose={() => dispatch(clearTodoAlerts())} variant="success" />
                <FilterContainer>
                    <Button 
                        text="All" 
                        onClick={() => setFilter('all')} 
                        variant={filter === 'all' ? 'primary' : 'neutral-light'}
                    />
                    <Button 
                        text="Completed" 
                        onClick={() => setFilter('completed')} 
                        variant={filter === 'completed' ? 'primary' : 'neutral-light'}
                    />
                    <Button 
                        text="Incomplete" 
                        onClick={() => setFilter('incomplete')} 
                        variant={filter === 'incomplete' ? 'primary' : 'neutral-light'}
                    />
                    {/* link to "create" page in case the user wants to create a new task while viewing the list */}
                    <Link href="/create">
                        <img src="/img/add.png" alt="Create New Task" />
                    </Link>
                </FilterContainer>
                
                <TodoList>
                    {todos.length === 0 ? (
                        renderEmptyState()
                    ) : (
                        todos.map((todo) => (
                            <TodoItem key={todo.todoID}>
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => toggleTodoStatus(todo.todoID, todo.completed)}
                                />
                                <TodoName className={todo.completed ? 'completed' : ''}>{todo.name}</TodoName>
                                <DeleteButton onClick={() => deleteTodo(todo.todoID)}>
                                    <AddIcon src="/img/trash-bin.svg" alt="Delete" />
                                </DeleteButton>
                            </TodoItem>
                        ))
                    )}
                </TodoList>
            </Container>
        </PageLayout>
    );
};

export default Todos;

const Container = styled.div`
    width: 100%;
    h1 {
        color: ${Colours.BLACK};
        font-size: ${Typography.HEADING_SIZES.M};
        font-weight: ${Typography.WEIGHTS.LIGHT};
        margin-bottom: 1rem;
    }
`;

const FilterContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const TodoList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const TodoItem = styled.div`
    display: flex;
    align-items: center;
    padding: 1rem;
    background: ${Colours.GRAY_LIGHTER};
    border-radius: 8px;

    input[type="checkbox"] {
        margin-right: 1rem;
        cursor: pointer;
    }

    span {
        font-family: ${Typography.FONTS.BODY};
        font-size: ${Typography.BODY_SIZES.L};
        color: ${Colours.BLACK};

        &.completed {
            text-decoration: line-through;
            color: ${Colours.GRAY_DARK};
        }
    }
`;

const TodoName = styled.span`
    display: flex;
    text-align: left;
`;

const DeleteButton = styled.button`
    margin-left: auto;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
        width: 16px;
        height: 16px;
        transition: filter 0.2s ease-in-out;
    }

    &:hover img {
        filter: brightness(0.8) sepia(1) hue-rotate(180deg);
    }
`;

const EmptyState = styled.div`
    text-align: center;
    color: ${Colours.GRAY_DARK};
    font-family: ${Typography.FONTS.BODY};
    font-size: ${Typography.BODY_SIZES.L};
    padding: 2rem 0;
`;

const AddIcon = styled.img`
    width: 24px; 
    height: 24px; 
    margin-bottom: 1rem;
    cursor: pointer;
    transition: opacity 0.2s ease-in-out;

    &:hover {
        opacity: 0.8;
    }
`;