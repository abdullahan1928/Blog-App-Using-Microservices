const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/posts', async (req, res) => {
    const postId = randomBytes(4).toString('hex');
    const { title } = req.body;

    posts[postId] = {
        id: postId,
        title,
    };

    await axios.post('http://localhost:4005/events', {
        type: 'PostCreated',
        data: {
            id: postId,
            title,
        },
    })
    
    res.status(201).send(posts[postId]);
});

app.post('/events', (req, res) => {
    console.log('Event received: ', req.body.type);
    res.send({ status: 'OK' });
})

app.listen(4000, () => {
    console.log('Example app listening on port 4000!');
});