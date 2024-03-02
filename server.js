const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.get('/:formId/filterResponses', async (req, res) => {
    try {
      
      // Grab the formId and specified filters from the request  
      const { formId } = req.params;
      const { filters } = req.query;
  
      // Parse the string filters from the request and JSON-ify them 
      const parsedFilters = JSON.parse(filters);
  
      // Fetch the API key from environment variable
      const apiKey = process.env.API_KEY;
      
      // Construct the headers with the Auth Bearer token
      const headers = {
        Authorization: `Bearer ${apiKey}`
      };
  
      // Make a GET request to Fillout API with the Auth header
      const apiUrl = `http://api.fillout.com/v1/api/forms/${formId}/submissions`;
      const response = await axios.get(apiUrl, { headers });
  
      // Filter responses based on the specified criteria
      const filteredResponses = response.data.responses.filter(response => {
        return parsedFilters.every(filter => {
          const question = response.questions.find(q => q.id === filter.id);
  
          if (!question) return false;
  
          switch (filter.condition) {
            case 'equals':
              return question.value === filter.value;
            case 'does_not_equal':
              return question.value !== filter.value;
            case 'greater_than':
              return question.value > filter.value;
            case 'less_than':
              return question.value < filter.value;
            default:
              return false;
          }
        });
      });
  
      // Update the totalResponses field based on the length of the filtered array
      response.data.totalResponses = filteredResponses.length;

      // Update the response object with the filtered responses
      response.data.responses = filteredResponses;
  
      // Send the updated response back to the user
      if (response.data.totalResponses === 0) {
        // If there are no matching responses, send a specific JSON response
        res.status(404).json({ error: 'No matching responses found' });
      } else {
        res.json(response.data);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});
