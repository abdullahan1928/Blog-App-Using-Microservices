const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const comments = {};

app.get('/posts/:id/comments', (req, res) => {
    res.send(comments[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex');
    const { content } = req.body;
    const commentsPerPost = comments[req.params.id] || [];

    commentsPerPost.push({
        id: commentId,
        content,
        status: 'pending'
    });

    comments[req.params.id] = commentsPerPost;

    await axios.post('http://localhost:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: req.params.id,
            status: 'pending'
        },
    })

    res.status(201).send(commentsPerPost);
});

app.post('/events', async (req, res) => {
    const { type, data } = req.body;
    console.log('Event received: ', type);

    if (type === 'CommentModerated') {
        const { id, content, postId, status } = data;

        const commentsPerPost = comments[postId];
        const comment = commentsPerPost.find(comment => comment.id === id);
        comment.status = status;

        await axios.post('http://localhost:4005/events', {
            type: 'CommentUpdated',
            data: {
                id,
                content,
                postId,
                status
            }
        })
    }

    res.send({ status: 'OK' });
})

app.listen(4001, () => {
    console.log('Example app listening on port 4001!');
});