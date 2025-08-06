import express from "express"
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv"
const app = express();
dotenv.config();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", (req, res) => {
  res.render("index.ejs", {
    title: "",
    Sound: "",
    Do: "",
    speech: "",
    Defination: "",
    showoutput: false,
    found:""
  })
})

app.post("/search", async (req, res) => {
  const uservalue = req.body["userInput"];
  const Baseurl=process.env.API_URL
  
  try {
    // Fetch the data from the API
    const response = await axios.get(Baseurl + uservalue);

    const result = response.data[0]
   
    // Loop through phonetics to find the first valid audio URL
    let myvalue = "";
    for (let index = 0; index < result.phonetics.length; index++) {

      // Check if the audio field is a non-empty string

      if (result.phonetics[index].audio) {

        myvalue = result.phonetics[index].audio;

        break; // Exit the loop once a valid audio URL is found
      }
    }

    let Example = "";

    const total = response.data.length;

    for (let index = 0; index < total; index++) {
      const meanings = response.data[index].meanings;

      // Check if 'meanings' is an array and has entries
      if (meanings && meanings.length > 0) {
        for (let j = 0; j < meanings.length; j++) {
          const definitions = meanings[j].definitions;

          // Check if 'definitions' exists and is an array
          if (definitions && definitions.length > 0) {
            for (let k = 0; k < definitions.length; k++) {
              // Check if an 'example' exists in the current definition
              if (definitions[k].example) {
                Example = definitions[k].example;
                break; // Stop once the first example is found
              }
            }
          }

          // Stop the outer loop once an example is found
          if (Example) break;
        }
      }
    }

    // Now 'Example' holds the first found example or an empty string
    // console.log(Example);
    
      res.render("index.ejs", {
        title: result.word, // Accessing 'word' directly from the object
        speech: result.meanings[0].partOfSpeech,
        Do: Example,
        Defination: result.meanings[0].definitions[0].definition,
        Sound: myvalue,
        showoutput: true,
        found:""
      });
    // Render the page with the correct title (assuming the response is an object)

  } catch (error) {
    // Log the error and send a server error response
    console.error('Error fetching data:', error.message);
    // res.status(500).send('Server Error');
    res.render("index.ejs", {
      title: "", // Accessing 'word' directly from the object
      speech: "",
      Do:"",
      Defination:"",
      Sound:"",
      showoutput: false,
      found:"Word not Found !!",
    });
  }
});

app.listen(3000, () => {
  console.log(`server is running on port http://localhost:3000`);
})
