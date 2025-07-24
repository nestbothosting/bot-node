// create API KEY and NODE ID

const fs = require("fs");
const path = require("path");
const randomstring = require("randomstring");

const filepath = path.join(__dirname, "auth.json");

CreateAuthdata(filepath)
  .then((response) => {
    console.log(`Base: ${response}`);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

async function CreateAuthdata(filepath) {
  const FileData = '{"API_KEY": "","Node_ID": ""}'
  try {
    if (!fs.existsSync(filepath)) {
      fs.writeFile(filepath, FileData, (err) => {
        if(err) console.log(err)
        console.log('Create File Auth.json')
      })
    }
    const fileContent = await fs.promises.readFile(filepath, "utf8");

    if (!fileContent.trim()) {
      return "No Data in The File";
    }

    const AuthJson = JSON.parse(fileContent);

    if (AuthJson.API_KEY && AuthJson.Node_ID) {
      return `API KEY: ${AuthJson.API_KEY} and Node id: ${AuthJson.Node_ID}`
    }

    const key = randomstring.generate(30)
    const node_id = randomstring.generate({ charset: "numeric", length: 20 })

    AuthJson.API_KEY = key
    AuthJson.Node_ID = node_id

    fs.promises.writeFile(filepath, JSON.stringify(AuthJson))

    return `Successfully Create API KEY And Node ID!, API KEY: ${key} , Node ID: ${node_id}`
  } catch (error) {
    console.error("Error reading or parsing the file:", error);
    throw error;
  }
}