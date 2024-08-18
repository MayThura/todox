import express from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { v4 as uuidv4 } from 'uuid';
import { validateTodo, validateUser } from '../schemas/validators.js';
import auth from '../middleware/auth.js';
import { verifyToken } from '../functions/cookies.js';

dayjs.extend(utc);
const router = express.Router();

export default ({todoRepository}) => {
    // Create new todo
    router.post('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            const todoID = uuidv4();
            const created = dayjs().utc().toISOString();

            let newTodo = {
                ...req.body,
                todoID,
                userID: session.userID,
                created,
                completed: req.body.completed || false // Ensure "completed" field is included and defaults to false
            };

            if (validateTodo(newTodo)) {
                let resultTodo = await todoRepository.insertOne(newTodo);
                return res.status(201).send(resultTodo);
            }
            console.error(validateTodo.errors);
            return res.status(400).send({error: "Invalid field used."});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Todo creation failed."});
        }
    });

    // Get filtered todos from a user
    router.get('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);
            const { completed } = req.query; // Capture the 'completed' query parameter
    
            // Create a filter object
            let filter = { userID: session.userID };
            if (completed !== undefined) {
                filter.completed = completed === 'true'; // Convert query string 'true'/'false' to boolean
            }
    
            const todos = await todoRepository.findFilteredByUserId(filter);
    
            if (todos) {
                return res.status(200).send(todos);
            } else {
                return res.status(404).send({ error: "No todos found." });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).send({ error: "Failed to fetch todos." });
        }
    });

    // Update todo status (mark as done or not done)
    router.patch('/:todoID', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);
            const { todoID } = req.params;
            const { completed } = req.body; // Expecting completed to be true or false

            const updatedTodo = await todoRepository.updateTodoStatus(session.userID, todoID, completed);

            if (updatedTodo) {
                return res.status(200).send(updatedTodo);
            } else {
                return res.status(404).send({ error: "Todo not found or unauthorized access." });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).send({ error: "Failed to update todo status." });
        }
    });

    // Delete a todo
    router.delete('/:todoID', auth, async (req, res) => {
        try {
            const session = verifyToken(req.cookies['todox-session']);
            const { todoID } = req.params;

            const result = await todoRepository.deleteOne(todoID, session.userID);

            if (result.deletedCount === 1) {
                return res.status(200).send({ message: 'Todo deleted successfully.' });
            } else {
                return res.status(404).send({ error: 'Todo not found or not authorized to delete.' });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).send({ error: 'Failed to delete todo.' });
        }
    });

    return router;
}