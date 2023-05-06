require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

app.use(cors());

app.use(express.static('build'))

const morganLogFunction = morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        req.body.name ? JSON.stringify(req.body) : ''
      ].join(' ')
})

app.use(morganLogFunction);

app.use(express.json());

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons);
    });
});

app.get('/info', (request, response) => {
    const date = new Date();

    Person.find({}).then(persons => {
        const responseToClient = `
        <div>
            <br>
            <p>Phonebook has info for ${persons.length}</p>
            <br>
            <p>${date}</p>
        </div>
        `;
        response.send(responseToClient);
    });
});

const errorHandler = (error, request, response, next) => {
    console.log(error.message);

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'Malformeatted id'});
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message});
    }

    next(error);
};

app.get('/api/persons/:id', (request, response, next) => {
    const personId = request.params.id;

    Person.findById(personId)
        .then(result => {
            if (result) {
                response.json(result);
            } else {
                response.status(404).send('Not found!');
            }
        })
        .catch(error => {
            next(error);
        });
});

app.delete('/api/persons/:id', (request, response, next) => {
    const personId = request.params.id;

    Person.findByIdAndRemove(personId)
        .then(result => {
            response.status(204).send('deleted successfully!');
        })
        .catch(error => {
            next(error);
        })
});

app.put('/api/persons/:id', (request, response) => {
    const body = request.body;
    const personId = request.params.id; 

    const person = {
        number: body.number
    };

    Person.findByIdAndUpdate(personId, person, { new: true })
        .then(updatedPerson => {
            response.send(updatedPerson);
        })
});

app.post('/api/persons', (request, response, next) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    };

    const person = new Person({
        name: body.name,
        number: body.number
    });

    person.save()
        .then(savedPerson => {
        response.json(savedPerson);
        })
        .catch(error => {
            next(error);
        })
    
});

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
