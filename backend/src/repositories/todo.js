export default (db) => {
    const { TODO_COLLECTION } = process.env;
    const collection = db.collection(TODO_COLLECTION);

    async function insertOne(todo) {
        return await collection.insertOne(todo);
    }

    // Fetch filtered todos for a specific user, sorted by creation date (oldest first)
    async function findFilteredByUserId(filter) {
        return await collection.find(filter).sort({ created: 1 }).toArray(); // Sort by creation date
    }

    // Update the 'done' status of a todo by its ID
    async function updateTodoStatus(userID, todoID, completed) {
        const result = await collection.findOneAndUpdate(
            { userID, todoID },
            { $set: { completed } },
            { returnDocument: "after" }
        );
        return result.value;
    }

    // Delete a todo
    async function deleteOne(todoID, userID) {
        return await collection.deleteOne({ todoID, userID });
    }

    return {
        insertOne,
        findFilteredByUserId,
        updateTodoStatus,
        deleteOne
    };
};